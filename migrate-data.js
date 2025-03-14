// migrate-data.js
const { app } = require('electron');
const path = require('path');
const fs = require('fs');

// Path to the old electron-store data
const getOldDataPath = () => {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'config.json');
};

// Migrate to SQLite
const migrateToSqlite = async () => {
  try {
    const oldDataPath = getOldDataPath();
    const db = require('./sqlite-storage');
    
    // First make sure database is initialized
    await db.initializeDatabase();
    
    // Check if old data exists
    if (!fs.existsSync(oldDataPath)) {
      console.log('No old data found, skipping migration');
      return;
    }
    
    console.log('Starting migration from Electron Store to SQLite...');
    
    // Check if migration was already done
    const hasData = await db.get('SELECT COUNT(*) as count FROM sqlite_master WHERE type="table" AND name="notes"');
    if (hasData && hasData.count > 0) {
      const noteCount = await db.get('SELECT COUNT(*) as count FROM notes');
      if (noteCount && noteCount.count > 0) {
        console.log('Database already has data, skipping migration');
        return;
      }
    }
    
    // Read old data
    let oldData;
    try {
      const fileContent = fs.readFileSync(oldDataPath, 'utf8');
      oldData = JSON.parse(fileContent);
      console.log(`Read old data: ${oldData.projects?.length || 0} projects, ${oldData.notes?.length || 0} notes`);
    } catch (error) {
      console.error('Error reading old data file:', error);
      return;
    }
    
    // Get templates from localStorage if available
    const templates = [];
    const localStoragePath = path.join(app.getPath('userData'), 'Local Storage', 'file__0.localstorage');
    if (fs.existsSync(localStoragePath)) {
      console.log('Found local storage file, will attempt to extract templates');
      // Templates are stored in localStorage which is a binary format
      // We won't implement the extraction here due to complexity
    }
    
    // Build data structure for import
    const importData = {
      projects: oldData.projects || [],
      notes: oldData.notes || [],
      templates: templates
    };
    
    // Import the data
    console.log('Importing data into SQLite...');
    await db.importData(importData);
    
    console.log('Data successfully migrated to SQLite');
    
    // Create backup of old data
    const backupPath = `${oldDataPath}.backup-${Date.now()}`;
    fs.copyFileSync(oldDataPath, backupPath);
    console.log(`Created backup of old data at ${backupPath}`);
    
    return true;
  } catch (error) {
    console.error('Error migrating data:', error);
    throw error;
  }
};

// Export migration function
module.exports = {
  migrateToSqlite
};