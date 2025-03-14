const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const db = require('./sqlite-storage'); // Path to your sqlite-storage.js file
const { migrateToSqlite } = require('./migrate-data');

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

app.on('ready', async () => {
  // Run data migration first
  try {
    await migrateToSqlite();
    console.log('Migration completed successfully');
  } catch (err) {
    console.error('Migration error:', err);
    
    // Show error dialog if in development mode
    if (process.env.NODE_ENV === 'development') {
      const { dialog } = require('electron');
      dialog.showErrorBox(
        'Migration Error',
        `An error occurred during data migration:\n${err.message}\n\nThe application will continue, but some data may not be available.`
      );
    }
  }
  
  // Create the window whether migration succeeded or failed
  createWindow();
});

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

// Close the database connection when app is about to quit
app.on('will-quit', () => {
  db.close();
});

// IPC handlers for note operations
ipcMain.on('get-all-projects', async (event) => {
  try {
    const projects = await db.getProjects();
    event.reply('all-projects', projects);
  } catch (error) {
    console.error('Error getting projects:', error);
    event.reply('all-projects', []);
  }
});

ipcMain.on('get-all-notes', async (event) => {
  try {
    const notes = await db.getNotes();
    event.reply('all-notes', notes);
  } catch (error) {
    console.error('Error getting notes:', error);
    event.reply('all-notes', []);
  }
});

ipcMain.on('save-note', async (event, noteData) => {
  try {
    if (!noteData.id) {
      noteData.id = uuidv4();
      noteData.createdAt = new Date().toISOString();
    }
    
    noteData.updatedAt = new Date().toISOString();
    await db.saveNote(noteData);
    event.reply('note-saved', noteData);
  } catch (error) {
    console.error('Error saving note:', error);
    event.reply('error', { message: 'Failed to save note' });
  }
});

ipcMain.on('save-project', async (event, projectData) => {
  try {
    if (!projectData.id) {
      projectData.id = uuidv4();
      projectData.createdAt = new Date().toISOString();
    }
    
    projectData.updatedAt = new Date().toISOString();
    await db.saveProject(projectData);
    event.reply('project-saved', projectData);
  } catch (error) {
    console.error('Error saving project:', error);
    event.reply('error', { message: 'Failed to save project' });
  }
});

ipcMain.on('delete-note', async (event, noteId) => {
  try {
    await db.deleteNote(noteId);
    event.reply('note-deleted', noteId);
  } catch (error) {
    console.error('Error deleting note:', error);
    event.reply('error', { message: 'Failed to delete note' });
  }
});

ipcMain.on('delete-project', async (event, projectId) => {
  try {
    await db.deleteProject(projectId);
    event.reply('project-deleted', projectId);
  } catch (error) {
    console.error('Error deleting project:', error);
    event.reply('error', { message: 'Failed to delete project' });
  }
});

// Import data handler
ipcMain.on('save-imported-data', async (event, data) => {
  try {
    await db.importData(data);
    event.reply('data-imported');
  } catch (error) {
    console.error('Error importing data:', error);
    event.reply('error', { message: 'Failed to import data' });
  }
});

// Add handler for saving all notes at once (for tag management)
ipcMain.on('save-all-notes', async (event, notes) => {
  try {
    // Begin transaction
    await db.run('BEGIN TRANSACTION');
    
    for (const note of notes) {
      note.updatedAt = new Date().toISOString();
      await db.saveNote(note);
    }
    
    // Commit transaction
    await db.run('COMMIT');
    
    event.reply('all-notes-saved');
  } catch (error) {
    // Rollback on error
    await db.run('ROLLBACK');
    console.error('Error saving all notes:', error);
    event.reply('error', { message: 'Failed to save notes' });
  }
});

// Get all tags (for tag management)
ipcMain.on('get-all-tags', async (event) => {
  try {
    const tags = await db.all('SELECT name FROM tags ORDER BY name');
    event.reply('all-tags', tags.map(t => t.name));
  } catch (error) {
    console.error('Error getting tags:', error);
    event.reply('all-tags', []);
  }
});

// Add template handlers
ipcMain.on('get-all-templates', async (event) => {
  try {
    const templates = await db.getTemplates();
    event.reply('all-templates', templates);
  } catch (error) {
    console.error('Error getting templates:', error);
    event.reply('all-templates', []);
  }
});

ipcMain.on('save-template', async (event, templateData) => {
  try {
    if (!templateData.id) {
      templateData.id = `template-${Date.now()}`;
    }
    
    await db.saveTemplate(templateData);
    event.reply('template-saved', templateData);
  } catch (error) {
    console.error('Error saving template:', error);
    event.reply('error', { message: 'Failed to save template' });
  }
});

ipcMain.on('delete-template', async (event, templateId) => {
  try {
    await db.deleteTemplate(templateId);
    event.reply('template-deleted', templateId);
  } catch (error) {
    console.error('Error deleting template:', error);
    event.reply('error', { message: 'Failed to delete template' });
  }
});