const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const Store = require('electron-store');
const { v4: uuidv4 } = require('uuid');

// Setup persistent storage
const store = new Store();

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('index.html');
  
  // Open DevTools in development
  // mainWindow.webContents.openDevTools();
  
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  
  // Create application menu
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Note',
          accelerator: 'CmdOrCtrl+N',
          click() {
            mainWindow.webContents.send('create-new-note');
          }
        },
        {
          label: 'New Project',
          accelerator: 'CmdOrCtrl+Shift+N',
          click() {
            mainWindow.webContents.send('create-new-project');
          }
        },
        { type: 'separator' },
        {
          label: 'Export All Data',
          click() {
            mainWindow.webContents.send('export-data');
          }
        },
        {
          label: 'Import Data',
          click() {
            mainWindow.webContents.send('import-data');
          }
        },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'toggledevtools' },
        { type: 'separator' },
        { role: 'resetzoom' },
        { role: 'zoomin' },
        { role: 'zoomout' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    }
  ];
  
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC handlers for note operations
ipcMain.on('get-all-projects', (event) => {
  const projects = store.get('projects') || [];
  event.reply('all-projects', projects);
});

ipcMain.on('get-all-notes', (event) => {
  const notes = store.get('notes') || [];
  event.reply('all-notes', notes);
});

ipcMain.on('save-note', (event, noteData) => {
  let notes = store.get('notes') || [];
  
  // If note has an id, update existing note, otherwise create new
  if (noteData.id) {
    notes = notes.map(note => note.id === noteData.id ? noteData : note);
  } else {
    noteData.id = uuidv4();
    noteData.createdAt = new Date().toISOString();
    notes.push(noteData);
  }
  
  noteData.updatedAt = new Date().toISOString();
  store.set('notes', notes);
  event.reply('note-saved', noteData);
});

ipcMain.on('save-project', (event, projectData) => {
  let projects = store.get('projects') || [];
  
  if (projectData.id) {
    projects = projects.map(project => project.id === projectData.id ? projectData : project);
  } else {
    projectData.id = uuidv4();
    projectData.createdAt = new Date().toISOString();
    projects.push(projectData);
  }
  
  projectData.updatedAt = new Date().toISOString();
  store.set('projects', projects);
  event.reply('project-saved', projectData);
});

ipcMain.on('delete-note', (event, noteId) => {
  let notes = store.get('notes') || [];
  notes = notes.filter(note => note.id !== noteId);
  store.set('notes', notes);
  event.reply('note-deleted', noteId);
});

ipcMain.on('delete-project', (event, projectId) => {
  let projects = store.get('projects') || [];
  projects = projects.filter(project => project.id !== projectId);
  store.set('projects', projects);
  
  // Also remove all notes associated with this project
  let notes = store.get('notes') || [];
  notes = notes.filter(note => note.projectId !== projectId);
  store.set('notes', notes);
  
  event.reply('project-deleted', projectId);
});

// Import data handler
ipcMain.on('save-imported-data', (event, data) => {
  store.set('projects', data.projects);
  store.set('notes', data.notes);
  event.reply('data-imported');
});