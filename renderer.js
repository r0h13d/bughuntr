const { ipcRenderer } = require('electron');
const marked = require('marked');
const hljs = require('highlight.js');
const { defaultTemplates, templateCategories } = require('./templates');
const DOMPurify = require('dompurify'); // Add this line to import DOMPurify

// Setup markdown renderer with syntax highlighting
marked.setOptions({
  highlight: function (code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  },
  breaks: true,
  gfm: true
});

// Create a safe renderer function that sanitizes HTML
function renderMarkdownSafely(markdown) {
  // First convert markdown to HTML
  const rawHtml = marked.parse(markdown || '');
  // Then sanitize the HTML to prevent XSS
  return DOMPurify.sanitize(rawHtml, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
      'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
      'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'img', 'span',
      'del', 'input'
    ],
    ALLOWED_ATTR: [
      'href', 'name', 'target', 'src', 'class', 'id', 'style', 'alt', 'type', 'checked', 'disabled'
    ]
  });
}

// DOM Elements
const projectsList = document.getElementById('projectsList');
const notesList = document.getElementById('notesList');
const noteTitleInput = document.getElementById('noteTitleInput');
const projectSelect = document.getElementById('projectSelect');
const tagsInput = document.getElementById('tagsInput');
const noteContent = document.getElementById('noteContent');
const previewTitle = document.getElementById('previewTitle');
const previewProject = document.getElementById('previewProject');
const previewTags = document.getElementById('previewTags');
const previewContent = document.getElementById('previewContent');
const saveNoteBtn = document.getElementById('saveNoteBtn');
const newNoteBtn = document.getElementById('newNoteBtn');
const newProjectBtn = document.getElementById('newProjectBtn');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');
const searchInput = document.getElementById('searchInput');
const projectModal = document.getElementById('projectModal');
const projectNameInput = document.getElementById('projectNameInput');
const projectUrlInput = document.getElementById('projectUrlInput');
const projectScopeInput = document.getElementById('projectScopeInput');
const saveProjectBtn = document.getElementById('saveProjectBtn');
const cancelProjectBtn = document.getElementById('cancelProjectBtn');
const toolbarBtns = document.querySelectorAll('.toolbar-btn');
const wordCount = document.querySelector('.word-count');
const charCount = document.querySelector('.char-count');
const saveStatus = document.getElementById('saveStatus');
const themeToggle = document.getElementById('themeToggle');
const templateBtn = document.getElementById('templateBtn');
const templateMenu = document.getElementById('templateMenu');
const templateModal = document.getElementById('templateModal');
const templateNameInput = document.getElementById('templateNameInput');
const templateCategoryInput = document.getElementById('templateCategoryInput');
const saveTemplateBtn = document.getElementById('saveTemplateBtn');
const cancelTemplateBtn = document.getElementById('cancelTemplateBtn');
const linkModal = document.getElementById('linkModal');
const linkTextInput = document.getElementById('linkTextInput');
const linkUrlInput = document.getElementById('linkUrlInput');
const insertLinkBtn = document.getElementById('insertLinkBtn');
const cancelLinkBtn = document.getElementById('cancelLinkBtn');
const tableModal = document.getElementById('tableModal');
const tableRowsInput = document.getElementById('tableRowsInput');
const tableColsInput = document.getElementById('tableColsInput');
const insertTableBtn = document.getElementById('insertTableBtn');
const cancelTableBtn = document.getElementById('cancelTableBtn');
const statusMessage = document.getElementById('statusMessage');
const autocompleteDropdown = document.getElementById('autocompleteDropdown');

// State management
let currentNote = null;
let allNotes = [];
let allProjects = [];
let allTemplates = [];
let currentProject = null;
let saveTimeout = null;
let isModified = false;
let lastSavedContent = '';
let currentTheme = 'light';
let selectionStart = 0;
let selectionEnd = 0;
let allTags = new Set(); // Track all unique tags
let activeTagFilters = []; // Track active tag filters

// Initialize app
// Add this function to renderer.js, just before the init() function

// Debug function to check templates
function debugTemplates() {
  console.log("All templates:", allTemplates);
  console.log("Template categories:", templateCategories);

  // Group templates by category for debugging
  const groupedTemplates = {};
  allTemplates.forEach(template => {
    const category = template.category || 'other';
    if (!groupedTemplates[category]) {
      groupedTemplates[category] = [];
    }
    groupedTemplates[category].push(template);
  });

  console.log("Grouped templates:", groupedTemplates);
}

// Modify the createDefaultTemplates function to ensure templates are properly loaded
function createDefaultTemplates() {
  // Get existing templates
  const existingTemplates = JSON.parse(localStorage.getItem('templates') || '[]');

  if (existingTemplates.length === 0) {
    console.log("No templates found in localStorage, initializing with defaults");
    // No templates exist, use all defaults
    allTemplates = defaultTemplates;
    localStorage.setItem('templates', JSON.stringify(allTemplates));
  } else {
    console.log(`Found ${existingTemplates.length} templates in localStorage`);

    // Check if we need to add any new templates that didn't exist before
    const existingIds = existingTemplates.map(t => t.id);
    const newTemplates = defaultTemplates.filter(t => !existingIds.includes(t.id));

    if (newTemplates.length > 0) {
      console.log(`Adding ${newTemplates.length} new default templates`);
      allTemplates = [...existingTemplates, ...newTemplates];
      localStorage.setItem('templates', JSON.stringify(allTemplates));
    } else {
      allTemplates = existingTemplates;
    }
  }

  // Debug the templates
  debugTemplates();

  // Render the template menu
  renderTemplateMenu();
}

function showTagsManagementModal(tagStats) {
  const tagsModal = document.getElementById('tagsModal');
  const tagsList = document.getElementById('managementTagsList');

  // Clear previous content
  tagsList.innerHTML = '';

  // Sort tags by usage count (descending)
  const sortedTags = Object.keys(tagStats).sort((a, b) => tagStats[b] - tagStats[a]);

  // No tags case
  if (sortedTags.length === 0) {
    const emptyEl = document.createElement('div');
    emptyEl.className = 'empty-tags';
    emptyEl.textContent = 'No tags available yet';
    tagsList.appendChild(emptyEl);
  } else {
    // Create tag items
    sortedTags.forEach(tag => {
      const count = tagStats[tag];

      const tagItem = document.createElement('div');
      tagItem.className = 'tag-item';

      const tagInfo = document.createElement('div');
      tagInfo.className = 'tag-info';

      const tagName = document.createElement('span');
      tagName.className = 'tag-name';
      tagName.textContent = tag;

      const tagCount = document.createElement('span');
      tagCount.className = 'tag-count';
      tagCount.textContent = `${count} note${count === 1 ? '' : 's'}`;

      tagInfo.appendChild(tagName);
      tagInfo.appendChild(tagCount);

      tagItem.appendChild(tagInfo);

      tagsList.appendChild(tagItem);
    });
  }

  // Show the modal
  tagsModal.style.display = 'flex';
  tagsModal.classList.add('visible');
}

// Update the renderTemplateMenu function to ensure all templates are displayed
function renderTemplateMenu() {
  templateMenu.innerHTML = '';

  // Add these style properties to make the menu scrollable
  templateMenu.style.maxHeight = '400px'; // Set a maximum height
  templateMenu.style.overflowY = 'auto';  // Enable vertical scrolling
  templateMenu.style.overflowX = 'hidden'; // Prevent horizontal scrolling


  console.log("Rendering template menu with", allTemplates.length, "templates");

  // Group templates by category
  const groupedTemplates = {};

  allTemplates.forEach(template => {
    const category = template.category || 'other';
    if (!groupedTemplates[category]) {
      groupedTemplates[category] = [];
    }
    groupedTemplates[category].push(template);
  });

  console.log("Templates grouped by category:", Object.keys(groupedTemplates));

  // Create category headers and items
  Object.keys(templateCategories).forEach(category => {
    if (!groupedTemplates[category] || groupedTemplates[category].length === 0) {
      console.log(`No templates for category: ${category}`);
      return;
    }

    console.log(`Rendering category ${category} with ${groupedTemplates[category].length} templates`);

    const categoryHeader = document.createElement('div');
    categoryHeader.className = 'template-category';
    categoryHeader.textContent = templateCategories[category];
    categoryHeader.style.padding = '8px 15px';
    categoryHeader.style.fontWeight = 'bold';
    categoryHeader.style.fontSize = '0.8rem';
    categoryHeader.style.color = 'var(--text-muted)';
    categoryHeader.style.textTransform = 'uppercase';

    templateMenu.appendChild(categoryHeader);

    groupedTemplates[category].forEach(template => {
      const item = document.createElement('div');
      item.className = 'template-item';
      item.textContent = template.name;

      item.addEventListener('click', () => {
        applyTemplate(template);
        templateMenu.classList.remove('show');
      });

      templateMenu.appendChild(item);
    });
  });

  // Add separator
  const separator = document.createElement('div');
  separator.className = 'context-menu-separator';
  templateMenu.appendChild(separator);

  // Add "Save current as template" option
  const saveTemplateItem = document.createElement('div');
  saveTemplateItem.className = 'template-item';
  saveTemplateItem.innerHTML = '<i class="fas fa-save"></i> Save current as template';
  saveTemplateItem.addEventListener('click', () => {
    showTemplateModal();
    templateMenu.classList.remove('show');
  });
  templateMenu.appendChild(saveTemplateItem);
}

// Replace the loadTemplates function with this version
function loadTemplates() {
  console.log("Loading templates from localStorage");
  try {
    const templates = JSON.parse(localStorage.getItem('templates') || '[]');
    console.log(`Loaded ${templates.length} templates from localStorage`);

    // Validate templates have required fields
    const validTemplates = templates.filter(template =>
      template && template.id && template.name && template.content && template.category
    );

    if (validTemplates.length !== templates.length) {
      console.warn(`Found ${templates.length - validTemplates.length} invalid templates`);
    }

    allTemplates = validTemplates;
    renderTemplateMenu();
  } catch (error) {
    console.error("Error loading templates:", error);
    // If there was an error loading templates, reset to defaults
    localStorage.removeItem('templates');
    allTemplates = [];
    createDefaultTemplates();
  }
}

// Modify the init function to clear localStorage for templates (one-time fix)
// Update init function
function init() {
  loadProjects();
  loadNotes();
  loadTemplates();
  bindEvents();
  setupAutoSave();
  loadThemePreference();
  fixIconsDisplay();
  createDefaultTemplates();
  setupTagAutocomplete(); // Add this line
}

// Load projects from storage
function loadProjects() {
  ipcRenderer.send('get-all-projects');
}

// Load notes from storage
function loadNotes() {
  ipcRenderer.send('get-all-notes');
}

// Load templates from storage
function loadTemplates() {
  const templates = JSON.parse(localStorage.getItem('templates') || '[]');
  allTemplates = templates;
  renderTemplateMenu();
}

// Create default templates if none exist
function createDefaultTemplates() {
  if (allTemplates.length === 0) {
    allTemplates = defaultTemplates;
    localStorage.setItem('templates', JSON.stringify(allTemplates));
    renderTemplateMenu();
  }
}

// Bind event listeners
function bindEvents() {
  // Tab switching
  tabBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      const tabName = this.dataset.tab;

      // Update active tab button
      tabBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      // Update active tab content
      tabPanes.forEach(pane => pane.classList.remove('active'));
      document.getElementById(`${tabName}Tab`).classList.add('active');

      // Update preview if switching to preview tab
      if (tabName === 'preview') {
        updatePreview();
      }
    });
  });

  // Save note
  saveNoteBtn.addEventListener('click', saveNote);

  // Create new note
  newNoteBtn.addEventListener('click', createNewNote);

  // Create new project
  newProjectBtn.addEventListener('click', showProjectModal);

  // Save project
  saveProjectBtn.addEventListener('click', saveProject);

  // Cancel project modal
  cancelProjectBtn.addEventListener('click', hideProjectModal);

  // Search notes
  searchInput.addEventListener('input', filterNotes);

  // Note content changes
  noteContent.addEventListener('input', function () {
    isModified = true;
    saveStatus.textContent = 'Modified';
    updateWordCount();

    // Reset auto-save timer
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    saveTimeout = setTimeout(saveNote, 2000);
  });

  // Save cursor position for toolbar actions
  noteContent.addEventListener('select', function () {
    selectionStart = this.selectionStart;
    selectionEnd = this.selectionEnd;
  });

  noteContent.addEventListener('click', function () {
    selectionStart = this.selectionStart;
    selectionEnd = this.selectionEnd;
  });

  noteContent.addEventListener('keyup', function (e) {
    selectionStart = this.selectionStart;
    selectionEnd = this.selectionEnd;

    // Check for markdown shortcuts
    checkForMarkdownShortcuts(e);
  });

  // Toolbar button actions
  toolbarBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      const action = this.dataset.action;
      applyMarkdownFormat(action);
    });
  });

  // Templates menu
  templateBtn.addEventListener('click', toggleTemplateMenu);

  // Close templates menu when clicking elsewhere
  document.addEventListener('click', function (e) {
    if (!templateBtn.contains(e.target) && !templateMenu.contains(e.target)) {
      templateMenu.classList.remove('show');
    }
  });

  // Add these to your bindEvents function
  document.getElementById('shortcutsBtn').addEventListener('click', showKeyboardShortcutsModal);
  document.getElementById('manageTagsBtn').addEventListener('click', () => {
    // Show tags management modal
    ipcRenderer.send('get-tags-stats');
  });

  // Add this to your existing IPC handling section
  ipcRenderer.on('show-shortcuts-modal', showKeyboardShortcutsModal);

  ipcRenderer.on('tags-stats', (event, tagStats) => {
    showTagsManagementModal(tagStats);
  });

  // Template modal buttons
  saveTemplateBtn.addEventListener('click', saveAsTemplate);
  cancelTemplateBtn.addEventListener('click', function () {
    templateModal.style.display = 'none';
  });

  // Link modal buttons
  insertLinkBtn.addEventListener('click', insertLink);
  cancelLinkBtn.addEventListener('click', function () {
    linkModal.style.display = 'none';
  });

  // Table modal buttons
  insertTableBtn.addEventListener('click', insertTable);
  cancelTableBtn.addEventListener('click', function () {
    tableModal.style.display = 'none';
  });

  // Theme toggle
  themeToggle.addEventListener('change', toggleTheme);

  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyboardShortcuts);

  // IPC responses
  ipcRenderer.on('all-projects', (event, projects) => {
    allProjects = projects;
    renderProjects();
    updateProjectSelect();
  });

  // Update the IPC on all-notes handler
  ipcRenderer.on('all-notes', (event, notes) => {
    allNotes = notes;
    renderNotes();

    // Update all tags after loading notes
    updateAllTags();
  });

  ipcRenderer.on('note-saved', (event, note) => {
    // Update current note
    currentNote = note;

    // Update saved state
    isModified = false;
    lastSavedContent = note.content;
    saveStatus.textContent = 'Saved';

    // Show status message
    showStatusMessage('Note saved successfully', 'success');

    // Refresh notes list
    loadNotes();
  });

  ipcRenderer.on('project-saved', (event, project) => {
    hideProjectModal();

    // Show status message
    showStatusMessage('Project saved successfully', 'success');

    // Refresh projects list
    loadProjects();
  });

  ipcRenderer.on('note-deleted', (event, noteId) => {
    if (currentNote && currentNote.id === noteId) {
      createNewNote();
    }

    // Refresh notes list
    loadNotes();

    // Show status message
    showStatusMessage('Note deleted', 'success');
  });

  ipcRenderer.on('project-deleted', (event, projectId) => {
    // Refresh projects list
    loadProjects();

    // Refresh notes list
    loadNotes();

    // Show status message
    showStatusMessage('Project and associated notes deleted', 'success');
  });

  ipcRenderer.on('create-new-note', createNewNote);
  ipcRenderer.on('create-new-project', showProjectModal);
  ipcRenderer.on('export-data', exportData);
  ipcRenderer.on('import-data', importData);

  // Auto-focus search on Ctrl+F
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      searchInput.focus();
    }
  });

  // Handle Ctrl+S to save
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveNote();
    }
  });
}

// Render projects list
function renderProjects() {
  projectsList.innerHTML = '';

  allProjects.forEach(project => {
    const li = document.createElement('li');
    li.innerHTML = `<i class="fas fa-folder"></i> ${project.name}`;
    li.dataset.id = project.id;

    li.addEventListener('click', () => {
      // Filter notes by project
      filterNotesByProject(project.id);

      // Highlight selected project
      document.querySelectorAll('#projectsList li').forEach(p => {
        p.classList.remove('selected');
      });
      li.classList.add('selected');
    });

    // Add context menu for project item
    li.addEventListener('contextmenu', (e) => {
      e.preventDefault();

      currentProject = project;

      // Create context menu
      const menu = document.createElement('div');
      menu.classList.add('context-menu');

      // Edit option
      const editItem = document.createElement('div');
      editItem.classList.add('context-menu-item');
      editItem.innerHTML = '<i class="fas fa-edit"></i> Edit Project';
      editItem.addEventListener('click', () => {
        document.body.removeChild(menu);
        editProject(project);
      });

      // New note in project option
      const newNoteItem = document.createElement('div');
      newNoteItem.classList.add('context-menu-item');
      newNoteItem.innerHTML = '<i class="fas fa-file-circle-plus"></i> New Note in Project';
      newNoteItem.addEventListener('click', () => {
        document.body.removeChild(menu);
        createNewNoteInProject(project.id);
      });

      // Separator
      const separator = document.createElement('div');
      separator.classList.add('context-menu-separator');

      // Delete option
      const deleteItem = document.createElement('div');
      deleteItem.classList.add('context-menu-item', 'danger');
      deleteItem.innerHTML = '<i class="fas fa-trash-alt"></i> Delete Project';
      deleteItem.addEventListener('click', () => {
        document.body.removeChild(menu);
        deleteProject(project.id);
      });

      menu.appendChild(editItem);
      menu.appendChild(newNoteItem);
      menu.appendChild(separator);
      menu.appendChild(deleteItem);

      // Position the menu
      menu.style.left = `${e.clientX}px`;
      menu.style.top = `${e.clientY}px`;

      document.body.appendChild(menu);

      // Close menu when clicking elsewhere
      document.addEventListener('click', function closeMenu() {
        if (document.body.contains(menu)) {
          document.body.removeChild(menu);
        }
        document.removeEventListener('click', closeMenu);
      });
    });

    projectsList.appendChild(li);
  });
}

// Render notes list
function renderNotes() {
  notesList.innerHTML = '';

  if (allNotes.length === 0) {
    const li = document.createElement('li');
    li.innerHTML = '<em>No notes yet. Create your first note!</em>';
    li.style.color = 'var(--text-muted)';
    li.style.cursor = 'default';
    notesList.appendChild(li);
    return;
  }

  // Sort notes by updated date (newest first)
  const sortedNotes = [...allNotes].sort((a, b) => {
    const dateA = new Date(a.updatedAt || a.createdAt);
    const dateB = new Date(b.updatedAt || b.createdAt);
    return dateB - dateA;
  });

  sortedNotes.forEach(note => {
    const li = document.createElement('li');
    li.className = 'note-item';

    const titleDiv = document.createElement('div');
    titleDiv.className = 'note-title';
    titleDiv.innerHTML = `<i class="fas fa-file-alt"></i> ${note.title || 'Untitled Note'}`;

    const metaDiv = document.createElement('div');
    metaDiv.className = 'note-meta';

    // Find project name
    let projectName = '';
    if (note.projectId) {
      const project = allProjects.find(p => p.id === note.projectId);
      if (project) {
        projectName = project.name;
      }
    }

    // Format date
    const date = new Date(note.updatedAt || note.createdAt);
    const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    metaDiv.textContent = `${projectName ? projectName + ' • ' : ''}${formattedDate}`;

    li.appendChild(titleDiv);
    li.appendChild(metaDiv);

    li.dataset.id = note.id;

    li.addEventListener('click', () => {
      // Check if there are unsaved changes
      if (isModified && currentNote) {
        if (confirm('You have unsaved changes. Save before switching notes?')) {
          saveNote(() => {
            loadNote(note);
          });
          return;
        }
      }

      loadNote(note);

      // Highlight selected note
      document.querySelectorAll('#notesList li').forEach(n => {
        n.classList.remove('selected');
      });
      li.classList.add('selected');
    });

    // Add context menu for note item
    li.addEventListener('contextmenu', (e) => {
      e.preventDefault();

      // Create context menu
      const menu = document.createElement('div');
      menu.classList.add('context-menu');

      // Duplicate option
      const duplicateItem = document.createElement('div');
      duplicateItem.classList.add('context-menu-item');
      duplicateItem.innerHTML = '<i class="fas fa-copy"></i> Duplicate Note';
      duplicateItem.addEventListener('click', () => {
        document.body.removeChild(menu);
        duplicateNote(note);
      });

      // Save as template option
      const templateItem = document.createElement('div');
      templateItem.classList.add('context-menu-item');
      templateItem.innerHTML = '<i class="fas fa-save"></i> Save as Template';
      templateItem.addEventListener('click', () => {
        document.body.removeChild(menu);
        showTemplateModal(note);
      });

      // Export option
      const exportItem = document.createElement('div');
      exportItem.classList.add('context-menu-item');
      exportItem.innerHTML = '<i class="fas fa-file-export"></i> Export as Markdown';
      exportItem.addEventListener('click', () => {
        document.body.removeChild(menu);
        exportNoteAsMarkdown(note);
      });

      // Separator
      const separator = document.createElement('div');
      separator.classList.add('context-menu-separator');

      // Delete option
      const deleteItem = document.createElement('div');
      deleteItem.classList.add('context-menu-item', 'danger');
      deleteItem.innerHTML = '<i class="fas fa-trash-alt"></i> Delete Note';
      deleteItem.addEventListener('click', () => {
        document.body.removeChild(menu);
        deleteNote(note.id);
      });

      menu.appendChild(duplicateItem);
      menu.appendChild(templateItem);
      menu.appendChild(exportItem);
      menu.appendChild(separator);
      menu.appendChild(deleteItem);

      // Position the menu
      menu.style.left = `${e.clientX}px`;
      menu.style.top = `${e.clientY}px`;

      document.body.appendChild(menu);

      // Close menu when clicking elsewhere
      document.addEventListener('click', function closeMenu() {
        if (document.body.contains(menu)) {
          document.body.removeChild(menu);
        }
        document.removeEventListener('click', closeMenu);
      });
    });

    notesList.appendChild(li);
  });
}

// Update project select dropdown
function updateProjectSelect() {
  // Save current selection
  const currentSelection = projectSelect.value;

  // Clear options except first one
  while (projectSelect.options.length > 1) {
    projectSelect.remove(1);
  }

  // Add project options
  allProjects.forEach(project => {
    const option = document.createElement('option');
    option.value = project.id;
    option.textContent = project.name;
    projectSelect.appendChild(option);
  });

  // Restore selection if possible
  if (currentSelection) {
    projectSelect.value = currentSelection;
  }
}

// Load note into editor
function loadNote(note) {
  currentNote = note;

  noteTitleInput.value = note.title || '';
  projectSelect.value = note.projectId || '';
  tagsInput.value = note.tags ? note.tags.join(', ') : '';
  noteContent.value = note.content || '';

  // Update saved state
  isModified = false;
  lastSavedContent = note.content;
  saveStatus.textContent = 'Saved';

  updatePreview();
  updateWordCount();
}

// Create new note
function createNewNote() {
  // Check if there are unsaved changes
  if (isModified && currentNote) {
    if (confirm('You have unsaved changes. Save before creating a new note?')) {
      saveNote(() => {
        resetNoteForm();
      });
      return;
    }
  }

  resetNoteForm();
}

// Reset note form
function resetNoteForm() {
  currentNote = null;

  noteTitleInput.value = '';
  projectSelect.value = '';
  tagsInput.value = '';
  noteContent.value = '';

  // Update saved state
  isModified = false;
  lastSavedContent = '';
  saveStatus.textContent = 'New Note';

  updatePreview();
  updateWordCount();

  // Focus on title input
  noteTitleInput.focus();

  // Deselect notes in the list
  document.querySelectorAll('#notesList li').forEach(n => {
    n.classList.remove('selected');
  });
}

// Create new note in specific project
function createNewNoteInProject(projectId) {
  createNewNote();
  projectSelect.value = projectId;
}

// Save current note
function saveNote(callback) {
  const title = noteTitleInput.value.trim();
  const projectId = projectSelect.value;
  const content = noteContent.value;
  const tagsStr = tagsInput.value;

  // Parse tags
  const tags = tagsStr.split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);

  const noteData = {
    id: currentNote ? currentNote.id : null,
    title: title || 'Untitled Note',
    projectId: projectId || null,
    content,
    tags
  };

  ipcRenderer.send('save-note', noteData);

  // Clear auto-save timeout
  if (saveTimeout) {
    clearTimeout(saveTimeout);
    saveTimeout = null;
  }

  // Execute callback if provided
  if (typeof callback === 'function') {
    callback();
  }
}

// Delete note
function deleteNote(noteId) {
  if (confirm('Are you sure you want to delete this note?')) {
    ipcRenderer.send('delete-note', noteId);
  }
}

// Duplicate note
function duplicateNote(note) {
  const newNote = {
    title: `${note.title} (Copy)`,
    projectId: note.projectId,
    content: note.content,
    tags: [...note.tags]
  };

  // Clear current note to create a new one
  currentNote = null;

  // Fill form with duplicated content
  noteTitleInput.value = newNote.title;
  projectSelect.value = newNote.projectId || '';
  tagsInput.value = newNote.tags.join(', ');
  noteContent.value = newNote.content;

  // Set as modified
  isModified = true;
  saveStatus.textContent = 'Modified';

  // Save the duplicate
  saveNote();
}

// Export note as markdown
function exportNoteAsMarkdown(note) {
  const dataStr = note.content;
  const dataBlob = new Blob([dataStr], { type: 'text/markdown' });
  const dataUrl = URL.createObjectURL(dataBlob);

  const downloadLink = document.createElement('a');
  downloadLink.href = dataUrl;
  downloadLink.download = `${note.title || 'Untitled'}.md`;
  downloadLink.style.display = 'none';

  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);

  showStatusMessage('Note exported as Markdown', 'success');
}

// Show project modal
function showProjectModal() {
  currentProject = null;

  projectNameInput.value = '';
  projectUrlInput.value = '';
  projectScopeInput.value = '';

  document.getElementById('projectModalTitle').textContent = 'New Project';

  projectModal.style.display = 'flex';
  projectModal.classList.add('visible');

  // Focus on name input
  setTimeout(() => {
    projectNameInput.focus();
  }, 100);
}

// Hide project modal
function hideProjectModal() {
  projectModal.classList.remove('visible');
  setTimeout(() => {
    projectModal.style.display = 'none';
  }, 300);
}

// Edit project
function editProject(project) {
  currentProject = project;

  projectNameInput.value = project.name;
  projectUrlInput.value = project.url || '';
  projectScopeInput.value = project.scope || '';

  document.getElementById('projectModalTitle').textContent = 'Edit Project';

  projectModal.style.display = 'flex';
  projectModal.classList.add('visible');
}

// Save project
function saveProject() {
  const name = projectNameInput.value.trim();

  if (!name) {
    alert('Project name cannot be empty');
    return;
  }

  const projectData = {
    id: currentProject ? currentProject.id : null,
    name,
    url: projectUrlInput.value.trim(),
    scope: projectScopeInput.value.trim()
  };

  ipcRenderer.send('save-project', projectData);
}

// Delete project
function deleteProject(projectId) {
  if (confirm('Are you sure you want to delete this project? All associated notes will also be deleted.')) {
    ipcRenderer.send('delete-project', projectId);
  }
}

// Update preview
// Update preview
function updatePreview() {
  previewTitle.textContent = noteTitleInput.value || 'Untitled Note';

  // Update project name in preview
  const projectId = projectSelect.value;
  let projectName = 'None';

  if (projectId) {
    const project = allProjects.find(p => p.id === projectId);
    if (project) {
      projectName = project.name;
    }
  }

  previewProject.textContent = `Project: ${projectName}`;

  // Update tags in preview with better structure
  previewTags.innerHTML = '';
  const tagsStr = tagsInput.value;

  if (tagsStr) {
    const tags = tagsStr.split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    if (tags.length > 0) {
      tags.forEach(tag => {
        const tagEl = document.createElement('span');
        tagEl.className = 'tag';
        tagEl.textContent = tag;
        previewTags.appendChild(tagEl);
      });
    } else {
      const emptyTag = document.createElement('span');
      emptyTag.className = 'empty-tag';
      emptyTag.textContent = 'No tags';
      previewTags.appendChild(emptyTag);
    }
  } else {
    const emptyTag = document.createElement('span');
    emptyTag.className = 'empty-tag';
    emptyTag.textContent = 'No tags';
    previewTags.appendChild(emptyTag);
  }

  // Render markdown content
  previewContent.innerHTML = renderMarkdownSafely(noteContent.value || '');

  // Process checkboxes in the preview
  const checkboxes = previewContent.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach((checkbox, index) => {
    checkbox.id = `task-${index}`;
    checkbox.addEventListener('change', function () {
      // Update the markdown content when a checkbox is checked/unchecked
      const taskListItems = noteContent.value.split('\n')
        .map(line => {
          if (line.match(/^- \[([ x])\] /)) {
            const checkboxIndex = Array.from(checkboxes).findIndex(cb => cb === checkbox);
            if (checkboxIndex === index) {
              return checkbox.checked
                ? line.replace(/^- \[( )\] /, '- [x] ')
                : line.replace(/^- \[(x)\] /, '- [ ] ');
            }
          }
          return line;
        })
        .join('\n');

      noteContent.value = taskListItems;
      isModified = true;
      saveStatus.textContent = 'Modified';
    });
  });
}

// Add this function to your renderer.js
function fixIconsDisplay() {
  // Force refresh of Font Awesome icons
  document.querySelectorAll('.fas, .far, .fab, .fa').forEach(icon => {
    const classes = [...icon.classList];
    icon.classList.remove(...classes);
    setTimeout(() => {
      icon.classList.add(...classes);
    }, 10);
  });

  // Fix specific icons with direct content if needed
  document.querySelectorAll('.fa-folder').forEach(icon => {
    if (!icon.innerHTML.trim()) icon.innerHTML = '&#xf07b;';
  });

  document.querySelectorAll('.fa-file-alt').forEach(icon => {
    if (!icon.innerHTML.trim()) icon.innerHTML = '&#xf15c;';
  });
}

// Filter notes by search term
function filterNotes() {
  const searchTerm = searchInput.value.toLowerCase();

  // If no search term and no active tag filters, reset to show all notes
  if (!searchTerm && activeTagFilters.length === 0) {
    renderNotes();
    return;
  }

  const filteredNotes = allNotes.filter(note => {
    // First check if note matches all active tag filters
    if (activeTagFilters.length > 0) {
      // Note must have tags property and it must include all active tag filters
      if (!note.tags || !activeTagFilters.every(tag =>
        note.tags.some(noteTag => noteTag.toLowerCase() === tag.toLowerCase()))) {
        return false;
      }
    }

    // If no search term, we've already filtered by tags
    if (!searchTerm) {
      return true;
    }

    // Search in title
    if (note.title && note.title.toLowerCase().includes(searchTerm)) {
      return true;
    }

    // Search in content
    if (note.content && note.content.toLowerCase().includes(searchTerm)) {
      return true;
    }

    // Search in tags
    if (note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchTerm))) {
      return true;
    }

    return false;
  });

  renderFilteredNotes(filteredNotes);
}

// New function to extract and update all unique tags
function updateAllTags() {
  allTags.clear();

  allNotes.forEach(note => {
    if (note.tags && Array.isArray(note.tags)) {
      note.tags.forEach(tag => {
        if (tag.trim()) {
          allTags.add(tag.trim());
        }
      });
    }
  });

  // Update tag filter UI if it exists
  if (tagFilterContainer) {
    renderTagFilters();
  }
}

// New function to render tag filters
function renderTagFilters() {
  tagFilterContainer.innerHTML = '';

  if (allTags.size === 0) {
    const emptyEl = document.createElement('div');
    emptyEl.className = 'empty-tags';
    emptyEl.textContent = 'No tags yet';
    tagFilterContainer.appendChild(emptyEl);
    return;
  }

  // Create "Clear Filters" button if there are active filters
  if (activeTagFilters.length > 0) {
    const clearBtn = document.createElement('button');
    clearBtn.className = 'tag-filter clear-filters';
    clearBtn.textContent = 'Clear Filters';
    clearBtn.addEventListener('click', () => {
      activeTagFilters = [];
      renderTagFilters();
      filterNotes();
    });
    tagFilterContainer.appendChild(clearBtn);
  }

  // Create tag filter buttons
  Array.from(allTags).sort().forEach(tag => {
    const tagBtn = document.createElement('button');
    tagBtn.className = 'tag-filter';
    tagBtn.textContent = tag;

    // Check if this tag is active
    if (activeTagFilters.includes(tag)) {
      tagBtn.classList.add('active');
    }

    tagBtn.addEventListener('click', () => {
      // Toggle this tag's active state
      if (activeTagFilters.includes(tag)) {
        activeTagFilters = activeTagFilters.filter(t => t !== tag);
      } else {
        activeTagFilters.push(tag);
      }

      renderTagFilters();
      filterNotes();
    });

    tagFilterContainer.appendChild(tagBtn);
  });
}
// Show keyboard shortcuts modal
function showKeyboardShortcutsModal() {
  // Create modal if it doesn't exist yet
  if (!document.getElementById('shortcutsModal')) {
    const modal = document.createElement('div');
    modal.id = 'shortcutsModal';
    modal.className = 'modal';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content shortcuts-modal-content';

    modalContent.innerHTML = `
      <h3>Keyboard Shortcuts</h3>
      
      <div class="shortcuts-container">
        <div class="shortcuts-grid">
          <div class="shortcut-category">
            <h4>Editor</h4>
            <div class="shortcut-item">
              <div class="shortcut-keys">
                <kbd>Ctrl</kbd> + <kbd>S</kbd>
              </div>
              <div class="shortcut-desc">Save note</div>
            </div>
            <div class="shortcut-item">
              <div class="shortcut-keys">
                <kbd>Ctrl</kbd> + <kbd>B</kbd>
              </div>
              <div class="shortcut-desc">Bold text</div>
            </div>
            <div class="shortcut-item">
              <div class="shortcut-keys">
                <kbd>Ctrl</kbd> + <kbd>I</kbd>
              </div>
              <div class="shortcut-desc">Italic text</div>
            </div>
            <div class="shortcut-item">
              <div class="shortcut-keys">
                <kbd>Ctrl</kbd> + <kbd>K</kbd>
              </div>
              <div class="shortcut-desc">Insert link</div>
            </div>
          </div>
          
          <div class="shortcut-category">
            <h4>Application</h4>
            <div class="shortcut-item">
              <div class="shortcut-keys">
                <kbd>Ctrl</kbd> + <kbd>N</kbd>
              </div>
              <div class="shortcut-desc">New note</div>
            </div>
            <div class="shortcut-item">
              <div class="shortcut-keys">
                <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>N</kbd>
              </div>
              <div class="shortcut-desc">New project</div>
            </div>
            <div class="shortcut-item">
              <div class="shortcut-keys">
                <kbd>Ctrl</kbd> + <kbd>F</kbd>
              </div>
              <div class="shortcut-desc">Search</div>
            </div>
            <div class="shortcut-item">
              <div class="shortcut-keys">
                <kbd>Ctrl</kbd> + <kbd>/</kbd>
              </div>
              <div class="shortcut-desc">Show this dialog</div>
            </div>
          </div>
        </div>
        
        <div class="shortcut-category">
          <h4>Markdown Shortcuts</h4>
          <div class="markdown-shortcuts-grid">
            <div class="shortcut-item">
              <div class="shortcut-keys"><code># </code> then <kbd>Space</kbd></div>
              <div class="shortcut-desc">Heading 1</div>
            </div>
            <div class="shortcut-item">
              <div class="shortcut-keys"><code>## </code> then <kbd>Space</kbd></div>
              <div class="shortcut-desc">Heading 2</div>
            </div>
            <div class="shortcut-item">
              <div class="shortcut-keys"><code>- </code> then <kbd>Space</kbd></div>
              <div class="shortcut-desc">Unordered list</div>
            </div>
            <div class="shortcut-item">
              <div class="shortcut-keys"><code>1. </code> then <kbd>Space</kbd></div>
              <div class="shortcut-desc">Ordered list</div>
            </div>
            <div class="shortcut-item">
              <div class="shortcut-keys"><code>- [ ] </code> then <kbd>Space</kbd></div>
              <div class="shortcut-desc">Task list</div>
            </div>
            <div class="shortcut-item">
              <div class="shortcut-keys"><code>\`\`\`</code> then <kbd>Enter</kbd></div>
              <div class="shortcut-desc">Code block</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-actions">
        <button id="closeShortcutsBtn" class="btn primary">Close</button>
      </div>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Add close button handler
    document.getElementById('closeShortcutsBtn').addEventListener('click', () => {
      modal.classList.remove('visible');
      setTimeout(() => {
        modal.style.display = 'none';
      }, 300);
    });
  }

  // Show the modal
  const modal = document.getElementById('shortcutsModal');
  modal.style.display = 'flex';
  modal.classList.add('visible');
}

// Enhance keyboard shortcuts handler
function handleKeyboardShortcuts(e) {
  // Ctrl/Cmd + B for bold
  if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
    e.preventDefault();
    applyMarkdownFormat('bold');
  }

  // Ctrl/Cmd + I for italic
  if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
    e.preventDefault();
    applyMarkdownFormat('italic');
  }

  // Ctrl/Cmd + K for link
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    applyMarkdownFormat('link');
  }

  // Ctrl/Cmd + / for keyboard shortcuts help
  if ((e.ctrlKey || e.metaKey) && e.key === '/') {
    e.preventDefault();
    showKeyboardShortcutsModal();
  }
}
// Additional method to handle tag suggestions while typing
function setupTagAutocomplete() {
  tagsInput.addEventListener('input', function () {
    const cursorPos = this.selectionStart;
    const text = this.value;

    // Find the current tag being typed
    const lastCommaIndex = text.lastIndexOf(',', cursorPos - 1);
    const currentTagStart = lastCommaIndex !== -1 ? lastCommaIndex + 1 : 0;
    const currentTag = text.substring(currentTagStart, cursorPos).trim().toLowerCase();

    // If current tag is at least 1 character, show suggestions
    if (currentTag.length >= 1) {
      const suggestions = Array.from(allTags)
        .filter(tag => tag.toLowerCase().includes(currentTag) && tag.toLowerCase() !== currentTag)
        .sort()
        .slice(0, 5); // Show top 5 matches

      if (suggestions.length > 0) {
        // Show autocomplete dropdown
        autocompleteDropdown.innerHTML = '';
        autocompleteDropdown.style.display = 'block';
        autocompleteDropdown.classList.add('show');

        // Position dropdown
        const inputRect = tagsInput.getBoundingClientRect();
        autocompleteDropdown.style.left = `${inputRect.left}px`;
        autocompleteDropdown.style.top = `${inputRect.bottom}px`;
        autocompleteDropdown.style.width = `${inputRect.width}px`;

        // Add suggestions
        suggestions.forEach(tag => {
          const item = document.createElement('div');
          item.className = 'autocomplete-item';
          item.textContent = tag;

          item.addEventListener('click', () => {
            // Replace current tag with selected suggestion
            const before = text.substring(0, currentTagStart);
            const after = text.substring(cursorPos);
            const newText = before + (before.endsWith(',') ? ' ' : '') + tag + after;

            tagsInput.value = newText;
            tagsInput.focus();

            // Hide dropdown
            autocompleteDropdown.classList.remove('show');
            autocompleteDropdown.style.display = 'none';
          });

          autocompleteDropdown.appendChild(item);
        });
      } else {
        // Hide dropdown if no matches
        autocompleteDropdown.classList.remove('show');
        autocompleteDropdown.style.display = 'none';
      }
    } else {
      // Hide dropdown if tag is too short
      autocompleteDropdown.classList.remove('show');
      autocompleteDropdown.style.display = 'none';
    }
  });

  // Hide dropdown when clicking outside
  document.addEventListener('click', function (e) {
    if (!tagsInput.contains(e.target) && !autocompleteDropdown.contains(e.target)) {
      autocompleteDropdown.classList.remove('show');
      autocompleteDropdown.style.display = 'none';
    }
  });
}

// Filter notes by project
function filterNotesByProject(projectId) {
  const filteredNotes = allNotes.filter(note => note.projectId === projectId);
  renderFilteredNotes(filteredNotes);
}

// Render filtered notes
function renderFilteredNotes(filteredNotes) {
  notesList.innerHTML = '';

  if (filteredNotes.length === 0) {
    const li = document.createElement('li');
    li.innerHTML = '<em>No notes found</em>';
    li.style.color = 'var(--text-muted)';
    li.style.cursor = 'default';
    notesList.appendChild(li);
    return;
  }

  // Sort notes by updated date (newest first)
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    const dateA = new Date(a.updatedAt || a.createdAt);
    const dateB = new Date(b.updatedAt || b.createdAt);
    return dateB - dateA;
  });

  sortedNotes.forEach(note => {
    const li = document.createElement('li');
    li.className = 'note-item';

    const titleDiv = document.createElement('div');
    titleDiv.className = 'note-title';
    titleDiv.innerHTML = `<i class="fas fa-file-alt"></i> ${note.title || 'Untitled Note'}`;

    const metaDiv = document.createElement('div');
    metaDiv.className = 'note-meta';

    // Find project name
    let projectName = '';
    if (note.projectId) {
      const project = allProjects.find(p => p.id === note.projectId);
      if (project) {
        projectName = project.name;
      }
    }

    // Format date
    const date = new Date(note.updatedAt || note.createdAt);
    const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    metaDiv.textContent = `${projectName ? projectName + ' • ' : ''}${formattedDate}`;

    li.appendChild(titleDiv);
    li.appendChild(metaDiv);

    li.dataset.id = note.id;

    li.addEventListener('click', () => {
      loadNote(note);

      // Highlight selected note
      document.querySelectorAll('#notesList li').forEach(n => {
        n.classList.remove('selected');
      });
      li.classList.add('selected');
    });

    notesList.appendChild(li);
  });
}

// Export all data
function exportData() {
  const data = {
    projects: allProjects,
    notes: allNotes,
    templates: allTemplates
  };

  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const dataUrl = URL.createObjectURL(dataBlob);

  const downloadLink = document.createElement('a');
  downloadLink.href = dataUrl;
  downloadLink.download = `bughuntr-export-${new Date().toISOString().split('T')[0]}.json`;
  downloadLink.style.display = 'none';

  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);

  showStatusMessage('Data exported successfully', 'success');
}

// Import data
function importData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.style.display = 'none';

  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);

        if (!data.projects || !data.notes) {
          throw new Error('Invalid data format');
        }

        if (confirm('This will replace all your existing projects and notes. Continue?')) {
          // Save imported data
          ipcRenderer.send('save-imported-data', data);

          // Save templates if present
          if (data.templates) {
            localStorage.setItem('templates', JSON.stringify(data.templates));
            allTemplates = data.templates;
            renderTemplateMenu();
          }

          // Reload data
          loadProjects();
          loadNotes();

          // Show success message
          showStatusMessage('Data imported successfully', 'success');
        }
      } catch (err) {
        showStatusMessage('Error importing data: ' + err.message, 'error');
      }
    };

    reader.readAsText(file);
  };

  document.body.appendChild(input);
  input.click();
  document.body.removeChild(input);
}

// Update word count
function updateWordCount() {
  const text = noteContent.value;

  // Count words
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  // Count characters
  const charCount = text.length;

  // Update UI
  document.querySelector('.word-count').textContent = `${wordCount} words`;
  document.querySelector('.char-count').textContent = `${charCount} characters`;
}

// Setup auto-save
function setupAutoSave() {
  // Check for changes every 5 seconds
  setInterval(() => {
    if (isModified && currentNote && noteContent.value !== lastSavedContent) {
      saveNote();
    }
  }, 5000);
}

// Apply markdown formatting
function applyMarkdownFormat(action) {
  // Save current selection
  const start = selectionStart;
  const end = selectionEnd;
  const selectedText = noteContent.value.substring(start, end);

  let replacement = '';
  let cursorOffset = 0;

  switch (action) {
    case 'heading1':
      replacement = `# ${selectedText}`;
      cursorOffset = 2;
      break;
    case 'heading2':
      replacement = `## ${selectedText}`;
      cursorOffset = 3;
      break;
    case 'heading3':
      replacement = `### ${selectedText}`;
      cursorOffset = 4;
      break;
    case 'bold':
      replacement = `**${selectedText}**`;
      cursorOffset = 2;
      break;
    case 'italic':
      replacement = `*${selectedText}*`;
      cursorOffset = 1;
      break;
    case 'strikethrough':
      replacement = `~~${selectedText}~~`;
      cursorOffset = 2;
      break;
    case 'ul':
      replacement = selectedText.split('\n').map(line => `- ${line}`).join('\n');
      cursorOffset = 2;
      break;
    case 'ol':
      replacement = selectedText.split('\n').map((line, i) => `${i + 1}. ${line}`).join('\n');
      cursorOffset = 3;
      break;
    case 'checklist':
      replacement = selectedText.split('\n').map(line => `- [ ] ${line}`).join('\n');
      cursorOffset = 6;
      break;
    case 'link':
      showLinkModal(selectedText);
      return;
    case 'image':
      if (selectedText) {
        replacement = `![${selectedText}](image-url)`;
      } else {
        replacement = '![Alt text](image-url)';
      }
      cursorOffset = 2;
      break;
    case 'table':
      showTableModal();
      return;
    case 'codeInline':
      replacement = `\`${selectedText}\``;
      cursorOffset = 1;
      break;
    case 'codeBlock':
      replacement = `\`\`\`\n${selectedText}\n\`\`\``;
      cursorOffset = 4;
      break;
    case 'quote':
      replacement = selectedText.split('\n').map(line => `> ${line}`).join('\n');
      cursorOffset = 2;
      break;
    case 'hr':
      replacement = `\n---\n${selectedText}`;
      cursorOffset = 5;
      break;
  }

  // Replace selected text
  noteContent.value = noteContent.value.substring(0, start) + replacement + noteContent.value.substring(end);

  // Set cursor position
  if (selectedText) {
    noteContent.setSelectionRange(start + replacement.length, start + replacement.length);
  } else {
    noteContent.setSelectionRange(start + cursorOffset, start + cursorOffset);
  }

  // Focus back on textarea
  noteContent.focus();

  // Mark as modified
  isModified = true;
  saveStatus.textContent = 'Modified';

  // Update preview if in preview mode
  if (document.getElementById('previewTab').classList.contains('active')) {
    updatePreview();
  }

  // Update word count
  updateWordCount();
}

// Show link modal
function showLinkModal(selectedText) {
  linkTextInput.value = selectedText;
  linkUrlInput.value = '';

  linkModal.style.display = 'flex';
  linkModal.classList.add('visible');

  setTimeout(() => {
    linkUrlInput.focus();
  }, 100);
}

// Insert link
function insertLink() {
  const text = linkTextInput.value.trim() || 'Link text';
  const url = linkUrlInput.value.trim() || 'https://example.com';

  const markdown = `[${text}](${url})`;

  // Insert at cursor position
  const start = selectionStart;
  const end = selectionEnd;

  noteContent.value = noteContent.value.substring(0, start) + markdown + noteContent.value.substring(end);

  // Set cursor position after insertion
  noteContent.setSelectionRange(start + markdown.length, start + markdown.length);

  // Hide modal
  linkModal.classList.remove('visible');
  setTimeout(() => {
    linkModal.style.display = 'none';
  }, 300);

  // Focus back on textarea
  noteContent.focus();

  // Mark as modified
  isModified = true;
  saveStatus.textContent = 'Modified';
}

// Show table modal
function showTableModal() {
  tableModal.style.display = 'flex';
  tableModal.classList.add('visible');
}

// Insert table
function insertTable() {
  const rows = parseInt(tableRowsInput.value, 10) || 3;
  const cols = parseInt(tableColsInput.value, 10) || 3;

  // Create header row
  let tableText = '|';
  for (let i = 0; i < cols; i++) {
    tableText += ` Column ${i + 1} |`;
  }
  tableText += '\n|';

  // Create separator row
  for (let i = 0; i < cols; i++) {
    tableText += ' --- |';
  }
  tableText += '\n';

  // Create data rows
  for (let i = 0; i < rows - 1; i++) {
    tableText += '|';
    for (let j = 0; j < cols; j++) {
      tableText += `  |`;
    }
    tableText += '\n';
  }

  // Insert at cursor position
  const start = selectionStart;
  const end = selectionEnd;

  noteContent.value = noteContent.value.substring(0, start) + tableText + noteContent.value.substring(end);

  // Set cursor position after insertion
  noteContent.setSelectionRange(start + tableText.length, start + tableText.length);

  // Hide modal
  tableModal.classList.remove('visible');
  setTimeout(() => {
    tableModal.style.display = 'none';
  }, 300);

  // Focus back on textarea
  noteContent.focus();

  // Mark as modified
  isModified = true;
  saveStatus.textContent = 'Modified';
}

// Toggle template menu
function toggleTemplateMenu() {
  templateMenu.classList.toggle('show');
}

// Render template menu
function renderTemplateMenu() {
  templateMenu.innerHTML = '';

  // Group templates by category
  const groupedTemplates = {};

  allTemplates.forEach(template => {
    const category = template.category || 'other';
    if (!groupedTemplates[category]) {
      groupedTemplates[category] = [];
    }
    groupedTemplates[category].push(template);
  });

  // Create category headers and items
  Object.keys(templateCategories).forEach(category => {
    if (!groupedTemplates[category] || groupedTemplates[category].length === 0) {
      return;
    }

    const categoryHeader = document.createElement('div');
    categoryHeader.className = 'template-category';
    categoryHeader.textContent = templateCategories[category];
    categoryHeader.style.padding = '8px 15px';
    categoryHeader.style.fontWeight = 'bold';
    categoryHeader.style.fontSize = '0.8rem';
    categoryHeader.style.color = 'var(--text-muted)';
    categoryHeader.style.textTransform = 'uppercase';

    templateMenu.appendChild(categoryHeader);

    groupedTemplates[category].forEach(template => {
      const item = document.createElement('div');
      item.className = 'template-item';
      item.textContent = template.name;

      item.addEventListener('click', () => {
        applyTemplate(template);
        templateMenu.classList.remove('show');
      });

      templateMenu.appendChild(item);
    });
  });

  // Add separator
  const separator = document.createElement('div');
  separator.className = 'context-menu-separator';
  templateMenu.appendChild(separator);

  // Add "Save current as template" option
  const saveTemplateItem = document.createElement('div');
  saveTemplateItem.className = 'template-item';
  saveTemplateItem.innerHTML = '<i class="fas fa-save"></i> Save current as template';
  saveTemplateItem.addEventListener('click', () => {
    showTemplateModal();
    templateMenu.classList.remove('show');
  });
  templateMenu.appendChild(saveTemplateItem);
}

// Apply template
function applyTemplate(template) {
  // Check if there are unsaved changes
  if (isModified && currentNote) {
    if (!confirm('You have unsaved changes. Apply template anyway?')) {
      return;
    }
  }

  // Apply template content
  noteContent.value = template.content;

  // Set as modified
  isModified = true;
  saveStatus.textContent = 'Modified';

  // Update preview and word count
  updatePreview();
  updateWordCount();
}

// Show template modal
function showTemplateModal(note) {
  const content = note ? note.content : noteContent.value;

  if (!content.trim()) {
    showStatusMessage('Cannot save empty content as template', 'error');
    return;
  }

  // Pre-fill template name with note title
  if (note) {
    templateNameInput.value = note.title;
  } else {
    templateNameInput.value = noteTitleInput.value || '';
  }

  templateModal.style.display = 'flex';
  templateModal.classList.add('visible');

  setTimeout(() => {
    templateNameInput.focus();
  }, 100);
}

// Save as template
function saveAsTemplate() {
  const name = templateNameInput.value.trim();
  const category = templateCategoryInput.value;
  const content = noteContent.value;

  if (!name) {
    alert('Template name cannot be empty');
    return;
  }

  if (!content.trim()) {
    alert('Cannot save empty content as template');
    return;
  }

  // Create template object
  const template = {
    id: `template-${Date.now()}`,
    name,
    category,
    content
  };

  // Add to templates
  allTemplates.push(template);

  // Save to local storage
  localStorage.setItem('templates', JSON.stringify(allTemplates));

  // Update template menu
  renderTemplateMenu();

  // Hide modal
  templateModal.classList.remove('visible');
  setTimeout(() => {
    templateModal.style.display = 'none';
  }, 300);

  // Show success message
  showStatusMessage('Template saved successfully', 'success');
}

// Toggle theme
function toggleTheme() {
  if (themeToggle.checked) {
    document.documentElement.setAttribute('data-theme', 'dark');
    currentTheme = 'dark';
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    currentTheme = 'light';
  }

  // Save preference
  localStorage.setItem('theme', currentTheme);
}

// Load theme preference
function loadThemePreference() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  currentTheme = savedTheme;

  if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggle.checked = true;
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    themeToggle.checked = false;
  }
}

// Show status message
function showStatusMessage(message, type) {
  const statusMsg = document.getElementById('statusMessage');
  statusMsg.textContent = message;
  statusMsg.className = `status-message ${type}`;
  statusMsg.style.display = 'block';

  // Hide after 3 seconds
  setTimeout(() => {
    statusMsg.style.display = 'none';
  }, 3000);
}

// Handle keyboard shortcuts
function handleKeyboardShortcuts(e) {
  // Ctrl/Cmd + B for bold
  if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
    e.preventDefault();
    applyMarkdownFormat('bold');
  }

  // Ctrl/Cmd + I for italic
  if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
    e.preventDefault();
    applyMarkdownFormat('italic');
  }

  // Ctrl/Cmd + K for link
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    applyMarkdownFormat('link');
  }
}

// Check for markdown shortcuts
function checkForMarkdownShortcuts(e) {
  if (e.key !== ' ' && e.key !== 'Enter') return;

  const cursorPos = noteContent.selectionStart;
  const textBeforeCursor = noteContent.value.substring(0, cursorPos);
  const currentLine = textBeforeCursor.split('\n').pop();

  // Heading shortcuts
  if (e.key === ' ') {
    if (currentLine === '#') {
      replaceCurrentLine('# ', 2);
    } else if (currentLine === '##') {
      replaceCurrentLine('## ', 3);
    } else if (currentLine === '###') {
      replaceCurrentLine('### ', 4);
    }
  }

  // List shortcuts
  if (e.key === ' ') {
    if (currentLine === '-' || currentLine === '*') {
      replaceCurrentLine('- ', 2);
    } else if (currentLine === '1.') {
      replaceCurrentLine('1. ', 3);
    } else if (currentLine === '[]' || currentLine === '[ ]') {
      replaceCurrentLine('- [ ] ', 6);
    }
  }

  // Code block shortcut
  if (e.key === 'Enter' && currentLine === '```') {
    const replacement = '```\n\n```';
    noteContent.value = textBeforeCursor + replacement + noteContent.value.substring(cursorPos);
    noteContent.selectionStart = noteContent.selectionEnd = cursorPos + 4;
    e.preventDefault();
  }

  // Horizontal rule shortcut
  if (e.key === 'Enter' && currentLine === '---') {
    const replacement = '\n---\n';
    noteContent.value = textBeforeCursor + replacement + noteContent.value.substring(cursorPos);
    noteContent.selectionStart = noteContent.selectionEnd = cursorPos + 5;
    e.preventDefault();
  }
}

// Replace current line with formatted text
function replaceCurrentLine(replacement, cursorOffset) {
  const cursorPos = noteContent.selectionStart;
  const textBeforeCursor = noteContent.value.substring(0, cursorPos);
  const lastNewlineIndex = textBeforeCursor.lastIndexOf('\n');
  const lineStart = lastNewlineIndex === -1 ? 0 : lastNewlineIndex + 1;

  noteContent.value =
    noteContent.value.substring(0, lineStart) +
    replacement +
    noteContent.value.substring(cursorPos);

  noteContent.selectionStart = noteContent.selectionEnd = lineStart + cursorOffset;
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);