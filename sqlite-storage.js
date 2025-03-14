// sqlite-storage.js
const { app } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

class SqliteStorage {
  constructor() {
    // Set up database path in user data directory
    const userDataPath = app.getPath('userData');
    this.dbPath = path.join(userDataPath, 'bughuntr.db');
    this.db = null;
    this.isInitialized = false;
  }
  
  // Initialize database and create tables if they don't exist
  async initializeDatabase() {
    return new Promise((resolve, reject) => {
      if (this.isInitialized) {
        return resolve();
      }
      
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('Error opening database:', err.message);
          return reject(err);
        }
        
        // Enable foreign keys
        this.db.run('PRAGMA foreign_keys = ON', (err) => {
          if (err) return reject(err);
          
          // Create projects table
          this.db.run(`
            CREATE TABLE IF NOT EXISTS projects (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL,
              url TEXT,
              scope TEXT,
              createdAt TEXT NOT NULL,
              updatedAt TEXT NOT NULL
            )
          `, (err) => {
            if (err) return reject(err);
            
            // Create notes table
            this.db.run(`
              CREATE TABLE IF NOT EXISTS notes (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                content TEXT,
                projectId TEXT,
                createdAt TEXT NOT NULL,
                updatedAt TEXT NOT NULL,
                FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE SET NULL
              )
            `, (err) => {
              if (err) return reject(err);
              
              // Create tags table
              this.db.run(`
                CREATE TABLE IF NOT EXISTS tags (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  name TEXT NOT NULL UNIQUE
                )
              `, (err) => {
                if (err) return reject(err);
                
                // Create note_tags junction table
                this.db.run(`
                  CREATE TABLE IF NOT EXISTS note_tags (
                    noteId TEXT NOT NULL,
                    tagId INTEGER NOT NULL,
                    PRIMARY KEY (noteId, tagId),
                    FOREIGN KEY (noteId) REFERENCES notes(id) ON DELETE CASCADE,
                    FOREIGN KEY (tagId) REFERENCES tags(id) ON DELETE CASCADE
                  )
                `, (err) => {
                  if (err) return reject(err);
                  
                  // Create templates table
                  this.db.run(`
                    CREATE TABLE IF NOT EXISTS templates (
                      id TEXT PRIMARY KEY,
                      name TEXT NOT NULL,
                      category TEXT NOT NULL,
                      content TEXT NOT NULL
                    )
                  `, (err) => {
                    if (err) return reject(err);
                    
                    this.isInitialized = true;
                    resolve();
                  });
                });
              });
            });
          });
        });
      });
    });
  }
  
  // Close the database connection
  close() {
    if (this.db) {
      this.db.close();
    }
  }
  
  // Helper for running SQL queries
  async run(sql, params = []) {
    await this.initializeDatabase();
    
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }
  
  // Helper for getting multiple rows
  async all(sql, params = []) {
    await this.initializeDatabase();
    
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows);
      });
    });
  }
  
  // Helper for getting a single row
  async get(sql, params = []) {
    await this.initializeDatabase();
    
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row);
      });
    });
  }
  
  // Get all projects
  async getProjects() {
    try {
      return await this.all('SELECT * FROM projects ORDER BY updatedAt DESC');
    } catch (error) {
      console.error('Error in getProjects:', error);
      return [];
    }
  }
  
  // Save a project (create or update)
  async saveProject(project) {
    try {
      if (project.id) {
        // Update existing project
        await this.run(
          'UPDATE projects SET name = ?, url = ?, scope = ?, updatedAt = ? WHERE id = ?',
          [project.name, project.url || null, project.scope || null, project.updatedAt, project.id]
        );
      } else {
        // Insert new project
        await this.run(
          'INSERT INTO projects (id, name, url, scope, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
          [project.id, project.name, project.url || null, project.scope || null, project.createdAt, project.updatedAt]
        );
      }
      return project;
    } catch (error) {
      console.error('Error in saveProject:', error);
      throw error;
    }
  }
  
  // Delete a project
  async deleteProject(projectId) {
    try {
      await this.run('DELETE FROM projects WHERE id = ?', [projectId]);
    } catch (error) {
      console.error('Error in deleteProject:', error);
      throw error;
    }
  }
  
  // Get all notes
  async getNotes() {
    try {
      const notes = await this.all('SELECT * FROM notes ORDER BY updatedAt DESC');
      
      // Get tags for each note
      for (const note of notes) {
        const tagRows = await this.all(`
          SELECT t.name 
          FROM tags t
          JOIN note_tags nt ON t.id = nt.tagId
          WHERE nt.noteId = ?
        `, [note.id]);
        
        note.tags = tagRows.map(row => row.name);
      }
      
      return notes;
    } catch (error) {
      console.error('Error in getNotes:', error);
      return [];
    }
  }
  
  // Save a note (create or update) without transaction handling
  async saveNoteRaw(note) {
    try {
      if (note.id) {
        // Update existing note
        await this.run(
          'UPDATE notes SET title = ?, content = ?, projectId = ?, updatedAt = ? WHERE id = ?',
          [note.title, note.content || null, note.projectId || null, note.updatedAt, note.id]
        );
      } else {
        // Insert new note
        await this.run(
          'INSERT INTO notes (id, title, content, projectId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
          [note.id, note.title, note.content || null, note.projectId || null, note.createdAt, note.updatedAt]
        );
      }
      
      // Clear existing tags for this note
      await this.run('DELETE FROM note_tags WHERE noteId = ?', [note.id]);
      
      const tags = note.tags || [];
      
      // Add new tags
      for (const tagName of tags) {
        if (!tagName || tagName.trim() === '') continue;
        
        // Find or create tag
        let tagId;
        const existingTag = await this.get('SELECT id FROM tags WHERE name = ?', [tagName]);
        
        if (existingTag) {
          tagId = existingTag.id;
        } else {
          const result = await this.run('INSERT INTO tags (name) VALUES (?)', [tagName]);
          tagId = result.lastID;
        }
        
        // Create note-tag relationship
        await this.run('INSERT INTO note_tags (noteId, tagId) VALUES (?, ?)', [note.id, tagId]);
      }
      
      return note;
    } catch (error) {
      console.error('Error in saveNoteRaw:', error);
      throw error;
    }
  }
  
  // Save a note (create or update) with transaction handling
  async saveNote(note) {
    try {
      await this.run('BEGIN TRANSACTION');
      await this.saveNoteRaw(note);
      await this.run('COMMIT');
      return note;
    } catch (error) {
      await this.run('ROLLBACK');
      throw error;
    }
  }
  
  // Delete a note
  async deleteNote(noteId) {
    try {
      await this.run('DELETE FROM notes WHERE id = ?', [noteId]);
    } catch (error) {
      console.error('Error in deleteNote:', error);
      throw error;
    }
  }
  
  // Get all templates
  async getTemplates() {
    try {
      return await this.all('SELECT * FROM templates');
    } catch (error) {
      console.error('Error in getTemplates:', error);
      return [];
    }
  }
  
  // Save a template
  async saveTemplate(template) {
    try {
      const existingTemplate = await this.get('SELECT id FROM templates WHERE id = ?', [template.id]);
      
      if (existingTemplate) {
        // Update existing template
        await this.run(
          'UPDATE templates SET name = ?, category = ?, content = ? WHERE id = ?',
          [template.name, template.category, template.content, template.id]
        );
      } else {
        // Insert new template
        await this.run(
          'INSERT INTO templates (id, name, category, content) VALUES (?, ?, ?, ?)',
          [template.id, template.name, template.category, template.content]
        );
      }
      return template;
    } catch (error) {
      console.error('Error in saveTemplate:', error);
      throw error;
    }
  }
  
  // Delete a template
  async deleteTemplate(templateId) {
    try {
      await this.run('DELETE FROM templates WHERE id = ?', [templateId]);
    } catch (error) {
      console.error('Error in deleteTemplate:', error);
      throw error;
    }
  }
  
  // Import all data
  async importData(data) {
    try {
      await this.run('BEGIN TRANSACTION');
      
      // Clear existing data
      await this.run('DELETE FROM note_tags');
      await this.run('DELETE FROM tags');
      await this.run('DELETE FROM notes');
      await this.run('DELETE FROM projects');
      await this.run('DELETE FROM templates');
      
      // Import projects
      if (data.projects && Array.isArray(data.projects)) {
        for (const project of data.projects) {
          if (!project.id) continue;
          await this.run(
            'INSERT INTO projects (id, name, url, scope, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
            [
              project.id, 
              project.name, 
              project.url || null, 
              project.scope || null, 
              project.createdAt || new Date().toISOString(), 
              project.updatedAt || new Date().toISOString()
            ]
          );
        }
      }
      
      // Create a map of tag names to IDs
      const tagMap = new Map();
      
      // Collect all unique tags from notes
      if (data.notes && Array.isArray(data.notes)) {
        const allTags = new Set();
        for (const note of data.notes) {
          if (note.tags && Array.isArray(note.tags)) {
            for (const tag of note.tags) {
              if (tag && tag.trim() !== '') {
                allTags.add(tag);
              }
            }
          }
        }
        
        // Insert all tags
        for (const tag of allTags) {
          const result = await this.run('INSERT INTO tags (name) VALUES (?)', [tag]);
          tagMap.set(tag, result.lastID);
        }
      }
      
      // Import notes and create note-tag relationships
      if (data.notes && Array.isArray(data.notes)) {
        for (const note of data.notes) {
          if (!note.id) continue;
          
          // Insert note
          await this.run(
            'INSERT INTO notes (id, title, content, projectId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
            [
              note.id, 
              note.title || 'Untitled Note', 
              note.content || null, 
              note.projectId || null, 
              note.createdAt || new Date().toISOString(), 
              note.updatedAt || new Date().toISOString()
            ]
          );
          
          // Create note-tag relationships
          if (note.tags && Array.isArray(note.tags)) {
            for (const tag of note.tags) {
              if (tag && tag.trim() !== '' && tagMap.has(tag)) {
                await this.run(
                  'INSERT INTO note_tags (noteId, tagId) VALUES (?, ?)',
                  [note.id, tagMap.get(tag)]
                );
              }
            }
          }
        }
      }
      
      // Import templates
      if (data.templates && Array.isArray(data.templates)) {
        for (const template of data.templates) {
          if (!template.id) continue;
          await this.run(
            'INSERT INTO templates (id, name, category, content) VALUES (?, ?, ?, ?)',
            [template.id, template.name, template.category || 'general', template.content]
          );
        }
      }
      
      await this.run('COMMIT');
      return true;
    } catch (error) {
      await this.run('ROLLBACK');
      console.error('Error in importData:', error);
      throw error;
    }
  }
}

module.exports = new SqliteStorage();