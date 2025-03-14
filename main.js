const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const Store = require('electron-store');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

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
    },
    {
      label: 'Tools',
      submenu: [
        {
          label: 'Manage Tags',
          click() {
            mainWindow.webContents.send('show-tags-modal');
          }
        },
        {
          label: 'Keyboard Shortcuts',
          accelerator: 'CmdOrCtrl+/',
          click() {
            mainWindow.webContents.send('show-shortcuts-modal');
          }
        },
        { type: 'separator' },
        {
          label: 'Generate Report',
          click() {
            mainWindow.webContents.send('generate-report');
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About BugHuntr',
          click() {
            dialog.showMessageBox(mainWindow, {
              title: 'About BugHuntr',
              message: 'BugHuntr v1.0.0',
              detail: 'A cross-platform app for bug bounty hunters to track notes, experiments, and hunting processes.\n\nDeveloped with ❤️ for the bug bounty community.',
              buttons: ['OK']
            });
          }
        },
        {
          label: 'View License',
          click() {
            dialog.showMessageBox(mainWindow, {
              title: 'License',
              message: 'MIT License',
              detail: 'Copyright (c) 2023 BugHuntr\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.',
              buttons: ['OK']
            });
          }
        }
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

// Get all unique tags
ipcMain.on('get-tags-stats', (event) => {
  const notes = store.get('notes') || [];
  const tagStats = {};
  
  // Count occurrences of each tag
  notes.forEach(note => {
    if (note.tags && Array.isArray(note.tags)) {
      note.tags.forEach(tag => {
        if (tag.trim()) {
          const normalizedTag = tag.trim();
          tagStats[normalizedTag] = (tagStats[normalizedTag] || 0) + 1;
        }
      });
    }
  });
  
  event.reply('tags-stats', tagStats);
});

// Generate markdown report
ipcMain.on('export-markdown-report', (event, { projectId, notes, projectName }) => {
  dialog.showSaveDialog(mainWindow, {
    title: 'Save Markdown Report',
    defaultPath: `${projectName || 'BugHuntr'}-Report.md`,
    filters: [
      { name: 'Markdown Files', extensions: ['md'] }
    ]
  }).then(result => {
    if (!result.canceled && result.filePath) {
      fs.writeFileSync(result.filePath, notes.join('\n\n---\n\n'));
      event.reply('report-exported', { success: true, path: result.filePath });
    }
  }).catch(err => {
    event.reply('report-exported', { success: false, error: err.message });
  });
});