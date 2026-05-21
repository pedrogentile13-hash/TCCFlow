/**
 * Rich Text Editor Component
 * A comprehensive Word-style editor with formatting toolbar, keyboard shortcuts, and localStorage support
 */

class RichTextEditor {
  constructor(editorId, options = {}) {
    this.editorId = editorId;
    this.editor = document.getElementById(editorId);
    this.options = {
      autoSaveInterval: options.autoSaveInterval || 30000,
      storageKey: options.storageKey || `editor_${editorId}`,
      onSave: options.onSave || null,
      toolbarPosition: options.toolbarPosition || 'top',
      enableToolbar: options.enableToolbar !== false,
      ...options
    };

    this.history = [];
    this.historyIndex = -1;
    this.isSaving = false;
    this.lastSaveTime = null;

    this.init();
  }

  init() {
    if (!this.editor) {
      console.error(`Editor with id "${this.editorId}" not found`);
      return;
    }

    // Make editor contenteditable
    this.editor.contentEditable = true;
    this.editor.spellcheck = true;

    // Setup event listeners
    this.setupEventListeners();
    this.loadFromStorage();
    this.setupAutoSave();
    this.captureHistory();

    // Setup keyboard shortcuts
    this.setupKeyboardShortcuts();
  }

  setupEventListeners() {
    // Auto-capture history on input
    this.editor.addEventListener('input', () => {
      this.captureHistory();
    });

    // Handle paste to clean formatting
    this.editor.addEventListener('paste', (e) => {
      e.preventDefault();
      const text = e.clipboardData.getData('text/plain');
      document.execCommand('insertText', false, text);
    });

    // Prevent default drag and drop
    this.editor.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    });

    this.editor.addEventListener('drop', (e) => {
      e.preventDefault();
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        this.handleFileUpload(files[0]);
      }
    });

    // Selection tracking for floating toolbar
    document.addEventListener('selectionchange', () => {
      this.updateFloatingToolbar();
    });
  }

  setupKeyboardShortcuts() {
    this.editor.addEventListener('keydown', (e) => {
      if (!e.ctrlKey && !e.metaKey) return;

      const key = e.key.toLowerCase();
      let handled = false;

      switch (key) {
        case 'b':
          document.execCommand('bold');
          handled = true;
          break;
        case 'i':
          document.execCommand('italic');
          handled = true;
          break;
        case 'u':
          document.execCommand('underline');
          handled = true;
          break;
        case 'z':
          if (e.shiftKey) {
            this.redo();
          } else {
            this.undo();
          }
          handled = true;
          break;
        case 'y':
          this.redo();
          handled = true;
          break;
        case 'k':
          if (e.shiftKey) {
            e.preventDefault();
            this.insertLink();
            handled = true;
          }
          break;
      }

      if (handled) {
        e.preventDefault();
      }
    });
  }

  captureHistory() {
    const content = this.editor.innerHTML;

    // Remove from history if we've undone and then made a new change
    this.history = this.history.slice(0, this.historyIndex + 1);

    // Don't add if same as last
    if (this.history[this.historyIndex] !== content) {
      this.history.push(content);
      this.historyIndex++;

      // Limit history to 50 items
      if (this.history.length > 50) {
        this.history.shift();
        this.historyIndex--;
      }
    }
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.editor.innerHTML = this.history[this.historyIndex];
    }
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.editor.innerHTML = this.history[this.historyIndex];
    }
  }

  formatText(command, value = null) {
    document.execCommand(command, false, value);
    this.editor.focus();
  }

  toggleFormat(command) {
    this.formatText(command);
  }

  setFontFamily(font) {
    this.formatText('fontName', font);
  }

  setFontSize(size) {
    // Convert px to font size value (1-7)
    const sizeMap = { '8': 1, '10': 1, '12': 2, '14': 3, '16': 3, '18': 4, '20': 4, '24': 5, '28': 6, '32': 6, '36': 7, '48': 7 };
    const sizeValue = sizeMap[size] || 3;
    this.formatText('fontSize', sizeValue);
  }

  setTextColor(color) {
    this.formatText('foreColor', color);
  }

  setBackgroundColor(color) {
    this.formatText('backColor', color);
  }

  setAlignment(alignment) {
    this.formatText(`justify${alignment.charAt(0).toUpperCase() + alignment.slice(1)}`);
  }

  insertLink() {
    const url = prompt('Enter URL:');
    if (url) {
      this.formatText('createLink', url);
    }
  }

  insertImage() {
    const url = prompt('Enter image URL:');
    if (url) {
      this.formatText('insertImage', url);
    }
  }

  insertTable(rows = 3, cols = 3) {
    let table = '<table style="border-collapse: collapse; width: 100%;"><tbody>';
    for (let i = 0; i < rows; i++) {
      table += '<tr>';
      for (let j = 0; j < cols; j++) {
        table += '<td style="border: 1px solid #ddd; padding: 8px; min-width: 50px;">&nbsp;</td>';
      }
      table += '</tr>';
    }
    table += '</tbody></table><p></p>';
    document.execCommand('insertHTML', false, table);
  }

  insertList(type) {
    this.formatText(`insert${type === 'ordered' ? 'Ordered' : 'Unordered'}List`);
  }

  setLineHeight(value) {
    const multiplier = parseFloat(value);
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      span.style.lineHeight = value;
      range.surroundContents(span);
    }
  }

  clearFormatting() {
    this.formatText('removeFormat');
  }

  getWordCount() {
    const text = this.editor.innerText || '';
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
  }

  getCharCount() {
    return (this.editor.innerText || '').length;
  }

  getContent() {
    return this.editor.innerHTML;
  }

  setContent(html) {
    this.editor.innerHTML = html;
    this.captureHistory();
  }

  getText() {
    return this.editor.innerText || '';
  }

  setText(text) {
    this.editor.innerText = text;
    this.captureHistory();
  }

  focus() {
    this.editor.focus();
  }

  async saveToStorage() {
    try {
      const content = this.getContent();
      localStorage.setItem(this.options.storageKey, content);
      this.lastSaveTime = new Date();

      if (this.options.onSave) {
        this.options.onSave({ content, timestamp: this.lastSaveTime });
      }
      return true;
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
      return false;
    }
  }

  loadFromStorage() {
    try {
      const content = localStorage.getItem(this.options.storageKey);
      if (content) {
        this.editor.innerHTML = content;
      }
    } catch (e) {
      console.error('Failed to load from localStorage:', e);
    }
  }

  setupAutoSave() {
    setInterval(() => {
      this.saveToStorage();
    }, this.options.autoSaveInterval);
  }

  insertFootnote() {
    const footnoteCount = this.editor.querySelectorAll('.footnote-ref').length + 1;
    const footnoteHTML = `<a href="#fn${footnoteCount}" class="footnote-ref">[${footnoteCount}]</a>`;
    document.execCommand('insertHTML', false, footnoteHTML);
  }

  handleFileUpload(file) {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.style.maxWidth = '100%';
        img.style.height = 'auto';

        const div = document.createElement('div');
        div.appendChild(img);
        document.execCommand('insertHTML', false, div.innerHTML);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please upload an image file');
    }
  }

  exportAsHTML() {
    return this.getContent();
  }

  exportAsText() {
    return this.getText();
  }

  print() {
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Print</title>
        <style>
          body { font-family: "Geist", sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
          table { border-collapse: collapse; width: 100%; }
          td, th { border: 1px solid #ddd; padding: 8px; text-align: left; }
          img { max-width: 100%; height: auto; }
        </style>
      </head>
      <body>
        ${this.getContent()}
        <script>window.print();</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }

  updateFloatingToolbar() {
    const selection = window.getSelection();
    if (selection.toString().length > 0) {
      // Floating toolbar would be shown here
      // Implementation depends on toolbar UI
    }
  }

  destroy() {
    this.saveToStorage();
    this.editor.contentEditable = false;
    this.editor.removeEventListener('input', null);
    this.editor.removeEventListener('paste', null);
    this.editor.removeEventListener('dragover', null);
    this.editor.removeEventListener('drop', null);
  }
}

// Export for use in both modules and scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RichTextEditor;
}
