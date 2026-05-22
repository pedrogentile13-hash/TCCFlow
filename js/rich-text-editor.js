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
    this.footnoteCounter = 0;
    this.autoSaveTimer = null;
    this.debounceTimer = null;

    this.init();
  }

  init() {
    if (!this.editor) {
      console.error(`Editor with id "${this.editorId}" not found`);
      return;
    }

    // Make editor contenteditable with attributes
    this.editor.contentEditable = 'true';
    this.editor.spellcheck = true;
    this.editor.setAttribute('role', 'textbox');
    this.editor.setAttribute('aria-label', 'Rich text editor');
    this.editor.setAttribute('data-gramm_editor', 'false');

    // Ensure editor is focused on init
    setTimeout(() => {
      this.editor.focus();
    }, 100);

    // Setup event listeners
    this.setupEventListeners();
    this.loadFromStorage();
    this.setupAutoSave();
    this.captureHistory();
    this.countFootnotes();

    // Setup keyboard shortcuts
    this.setupKeyboardShortcuts();
  }

  setupEventListeners() {
    // Auto-capture history on input with debounce
    this.editor.addEventListener('input', () => {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.captureHistory();
        // Auto-update numbering when headings are modified
        this.autonumberDocument();
        this.updateTableOfContents();
      }, 300);
    });

    // Handle paste - allow rich paste by default, but with option to clean
    this.editor.addEventListener('paste', (e) => {
      // Capture history after paste is processed
      setTimeout(() => {
        this.captureHistory();
      }, 10);

      // Note: To implement "paste as plain text" option, uncomment below:
      // e.preventDefault();
      // const text = e.clipboardData.getData('text/plain');
      // document.execCommand('insertText', false, text);
    });

    // Prevent default drag and drop
    this.editor.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      this.editor.style.opacity = '0.8';
    });

    this.editor.addEventListener('dragleave', () => {
      this.editor.style.opacity = '1';
    });

    this.editor.addEventListener('drop', (e) => {
      e.preventDefault();
      this.editor.style.opacity = '1';
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
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;
      const altKey = e.altKey;

      const key = e.key.toLowerCase();
      let handled = false;

      // Text formatting shortcuts
      if (ctrlOrCmd && !altKey) {
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
      }

      // Heading shortcuts: Ctrl+Alt+1 to Ctrl+Alt+4
      if (ctrlOrCmd && altKey && !e.shiftKey) {
        const headingLevel = parseInt(key);
        if (headingLevel >= 1 && headingLevel <= 4) {
          e.preventDefault();
          this.applyHeadingStyle(headingLevel);
          handled = true;
        }
      }

      // Clear formatting: Ctrl+Shift+M
      if (ctrlOrCmd && e.shiftKey && key === 'm') {
        e.preventDefault();
        this.clearFormatting();
        handled = true;
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
    if (!text.trim()) return 0;
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
  }

  getCharCount() {
    const text = this.editor.innerText || '';
    return text.length;
  }

  getCharCountWithoutSpaces() {
    const text = this.editor.innerText || '';
    return text.replace(/\s/g, '').length;
  }

  getReadingTime() {
    const wordCount = this.getWordCount();
    const wordsPerMinute = 200; // Average reading speed
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return minutes < 1 ? '< 1 min' : `~${minutes} min`;
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
      } else {
        // Load example content if storage is empty
        this.loadExampleContent();
      }
    } catch (e) {
      console.error('Failed to load from localStorage:', e);
      this.loadExampleContent();
    }
  }

  loadExampleContent() {
    // Only load example for new editors
    if (this.editor.innerHTML.trim() === '') {
      const example = `
        <p style="line-height: 1.8;">
          <strong>Bem-vindo ao Editor de Texto Rico!</strong>
        </p>
        <p style="line-height: 1.8;">
          Este é um editor profissional com suporte a:
        </p>
        <ul style="line-height: 1.8;">
          <li><strong>Formatação de texto:</strong> negrito, itálico, sublinhado, tachado</li>
          <li><strong>Controles de fonte:</strong> família, tamanho e cores</li>
          <li><strong>Alinhamento:</strong> esquerda, centro, direita e justificado</li>
          <li><strong>Listas:</strong> com marcadores e numeradas</li>
          <li><strong>Tabelas:</strong> insira e formate tabelas facilmente</li>
          <li><strong>Imagens:</strong> arraste e solte ou insira via URL</li>
          <li><strong>Links:</strong> Ctrl+Shift+K para inserir hiperlinks</li>
          <li><strong>Auto-salvamento:</strong> seu conteúdo é salvo automaticamente</li>
        </ul>
        <p style="line-height: 1.8; margin-top: 1.5em;">
          Use os atalhos de teclado para agilizar seu trabalho:
        </p>
        <ul style="line-height: 1.8;">
          <li><strong>Ctrl+B:</strong> Negrito</li>
          <li><strong>Ctrl+I:</strong> Itálico</li>
          <li><strong>Ctrl+U:</strong> Sublinhado</li>
          <li><strong>Ctrl+Z:</strong> Desfazer</li>
          <li><strong>Ctrl+Y:</strong> Refazer</li>
        </ul>
        <p style="line-height: 1.8; margin-top: 1.5em; color: #6b6480;">
          <em>Dica: Comece a digitação para substituir este texto de exemplo.</em>
        </p>
      `;
      this.editor.innerHTML = example;
    }
  }

  setupAutoSave() {
    this.autoSaveTimer = setInterval(() => {
      this.saveToStorage();
    }, this.options.autoSaveInterval);
  }

  clearAutoSave() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  countFootnotes() {
    this.footnoteCounter = this.editor.querySelectorAll('.footnote-ref').length;
  }

  insertFootnote() {
    this.footnoteCounter++;
    const footnoteHTML = `<sup><a href="#fn${this.footnoteCounter}" class="footnote-ref" data-footnote="${this.footnoteCounter}">[${this.footnoteCounter}]</a></sup>`;
    document.execCommand('insertHTML', false, footnoteHTML);
  }

  // Auto-Numbering System Methods
  applyHeadingStyle(level) {
    const tag = `h${level}`;
    document.execCommand('formatBlock', false, `<${tag}>`);
    this.editor.focus();
    setTimeout(() => {
      this.autonumberDocument();
      this.updateTableOfContents();
    }, 50);
  }

  applyNumberingStyle(style) {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const paragraph = range.commonAncestorContainer.nodeType === 3
      ? range.commonAncestorContainer.parentElement
      : range.commonAncestorContainer;

    if (!paragraph) return;

    // Check if it's a heading - if so, apply to heading level
    if (paragraph.tagName && /^H[1-4]$/.test(paragraph.tagName)) {
      // Clear existing numbering if any
      const existing = paragraph.querySelector('.auto-number');
      if (existing) existing.remove();

      // Reapply heading numbering
      this.autonumberDocument();
      return;
    }

    // Apply paragraph numbering styles
    const styleMap = {
      'bullet-circle': { icon: '◦', type: 'bullet' },
      'bullet-square': { icon: '◾', type: 'bullet' },
      'bullet-dash': { icon: '–', type: 'bullet' },
      'number-123': { type: 'number', format: 'decimal' },
      'number-abc': { type: 'number', format: 'alpha' },
      'number-roman': { type: 'number', format: 'roman' },
      'custom-1.1': { type: 'custom', format: 'hierarchical' }
    };

    if (styleMap[style]) {
      paragraph.setAttribute('data-numbering-style', style);
      paragraph.setAttribute('data-numbering-type', styleMap[style].type);
      if (styleMap[style].format) {
        paragraph.setAttribute('data-numbering-format', styleMap[style].format);
      }
      if (styleMap[style].icon) {
        paragraph.setAttribute('data-numbering-icon', styleMap[style].icon);
      }

      // Apply numbering to this paragraph group
      this.renumberParagraphGroup(paragraph, style);
    }

    this.editor.focus();
  }

  renumberParagraphGroup(targetParagraph, style) {
    const allParagraphs = this.editor.querySelectorAll(`p[data-numbering-style="${style}"]`);
    const styleConfig = {
      'bullet-circle': { icon: '◦' },
      'bullet-square': { icon: '◾' },
      'bullet-dash': { icon: '–' },
      'number-123': { format: 'decimal' },
      'number-abc': { format: 'alpha' },
      'number-roman': { format: 'roman' },
      'custom-1.1': { format: 'hierarchical' }
    };

    let counter = 1;
    const customHierarchy = {};

    allParagraphs.forEach((p, idx) => {
      if (styleConfig[style].icon) {
        p.setAttribute('data-numbering-icon', styleConfig[style].icon);
      }

      if (style === 'number-123') {
        p.setAttribute('data-number', counter);
      } else if (style === 'number-abc') {
        const letter = String.fromCharCode(96 + counter); // a, b, c, ...
        p.setAttribute('data-letter', letter);
      } else if (style === 'number-roman') {
        const roman = this.toRomanNumeral(counter);
        p.setAttribute('data-roman', roman);
      } else if (style === 'custom-1.1') {
        const customNum = this.generateCustomNumber(idx);
        p.setAttribute('data-custom', customNum);
      }

      counter++;
    });
  }

  generateCustomNumber(index) {
    // Generate hierarchical numbers like 1.1, 1.2, 2.1, etc.
    // This is simplified - tracks depth by analyzing the document structure
    const allNumberedElements = this.editor.querySelectorAll('[data-numbering-style]');
    const levels = {};

    for (let i = 0; i <= index && i < allNumberedElements.length; i++) {
      // Simple increment - could be enhanced with indent tracking
      if (!levels[0]) levels[0] = 0;
      levels[0]++;
    }

    return levels[0] ? `${Math.ceil(levels[0] / 2)}.${((levels[0] - 1) % 2) + 1}` : '1.1';
  }

  toRomanNumeral(num) {
    const romanNumerals = [
      { value: 1000, numeral: 'm' },
      { value: 900, numeral: 'cm' },
      { value: 500, numeral: 'd' },
      { value: 400, numeral: 'cd' },
      { value: 100, numeral: 'c' },
      { value: 90, numeral: 'xc' },
      { value: 50, numeral: 'l' },
      { value: 40, numeral: 'xl' },
      { value: 10, numeral: 'x' },
      { value: 9, numeral: 'ix' },
      { value: 5, numeral: 'v' },
      { value: 4, numeral: 'iv' },
      { value: 1, numeral: 'i' }
    ];

    let result = '';
    let remaining = num;

    for (const { value, numeral } of romanNumerals) {
      while (remaining >= value) {
        result += numeral;
        remaining -= value;
      }
    }

    return result;
  }

  autonumberDocument() {
    const headings = this.editor.querySelectorAll('h1, h2, h3, h4');
    const headingCounts = { h1: 0, h2: 0, h3: 0, h4: 0 };
    const headingHierarchy = { h1: [], h2: [], h3: [], h4: [] };

    headings.forEach((heading, idx) => {
      const level = parseInt(heading.tagName[1]);
      const tag = heading.tagName.toLowerCase();

      // Reset lower level counts when we encounter a higher level heading
      for (let i = level + 1; i <= 4; i++) {
        headingCounts[`h${i}`] = 0;
      }

      // Increment current level
      headingCounts[tag]++;

      // Build hierarchical number
      let number = '';
      for (let i = 1; i <= level; i++) {
        if (i > 1) number += '.';
        number += headingCounts[`h${i}`];
      }

      // Add styling attributes for CSS-based formatting
      heading.setAttribute('data-heading-level', level);
      heading.setAttribute('data-heading-number', number);

      // Remove existing number span if present
      const existingSpan = heading.querySelector('.auto-number');
      if (existingSpan) {
        existingSpan.remove();
      }

      // Create number span
      const numberSpan = document.createElement('span');
      numberSpan.className = 'auto-number';
      numberSpan.textContent = number + '. ';
      numberSpan.setAttribute('data-level', level);

      // Add unique ID for TOC links
      const headingId = `heading-${level}-${number.replace(/\./g, '-')}`;
      heading.id = headingId;
      heading.setAttribute('data-heading-id', headingId);

      heading.insertBefore(numberSpan, heading.firstChild);
    });
  }

  clearNumbering(target) {
    if (target === 'all') {
      // Clear paragraph numbering
      const numberedElements = this.editor.querySelectorAll('[data-numbering-style]');
      numberedElements.forEach(el => {
        el.removeAttribute('data-numbering-style');
        el.removeAttribute('data-numbering-type');
        el.removeAttribute('data-numbering-format');
        el.removeAttribute('data-numbering-icon');
        el.removeAttribute('data-number');
        el.removeAttribute('data-letter');
        el.removeAttribute('data-roman');
        el.removeAttribute('data-custom');
      });

      // Clear heading numbering
      const autoNumbers = this.editor.querySelectorAll('.auto-number');
      autoNumbers.forEach(el => el.remove());

      // Clear heading attributes
      const headings = this.editor.querySelectorAll('h1, h2, h3, h4');
      headings.forEach(h => {
        h.removeAttribute('data-heading-level');
        h.removeAttribute('data-heading-number');
        h.removeAttribute('data-heading-id');
      });

      // Clear TOC if exists
      const toc = this.editor.querySelector('.toc-container');
      if (toc) {
        toc.remove();
      }
    } else if (target === 'headings') {
      const autoNumbers = this.editor.querySelectorAll('.auto-number');
      autoNumbers.forEach(el => el.remove());

      const headings = this.editor.querySelectorAll('h1, h2, h3, h4');
      headings.forEach(h => {
        h.removeAttribute('data-heading-level');
        h.removeAttribute('data-heading-number');
        h.removeAttribute('data-heading-id');
      });
    }

    this.editor.focus();
  }

  generateTableOfContents() {
    const headings = this.editor.querySelectorAll('h1, h2, h3, h4');
    if (headings.length === 0) return '';

    let toc = '<div class="table-of-contents">\n';
    toc += '<div class="toc-header">\n';
    toc += '<h3 class="toc-title">Índice</h3>\n';
    toc += '<button class="toc-close-btn" onclick="this.closest(\'.table-of-contents\').remove()" title="Fechar índice" style="background: none; border: none; cursor: pointer; color: var(--muted); font-size: 1.2rem; padding: 0;">&times;</button>\n';
    toc += '</div>\n';
    toc += '<ul class="toc-list">\n';

    let currentLevel = 1;
    const levelStack = [];

    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName[1]);
      const numberSpan = heading.querySelector('.auto-number');
      const headingId = heading.getAttribute('data-heading-id') || `heading-${index}`;
      heading.id = headingId;

      // Extract title text without the number
      let titleText = heading.textContent;
      if (numberSpan) {
        titleText = titleText.replace(numberSpan.textContent, '').trim();
      }

      // Handle level changes with proper nesting
      while (currentLevel < level) {
        toc += '<ul class="toc-nested">\n';
        levelStack.push(currentLevel);
        currentLevel++;
      }
      while (currentLevel > level) {
        toc += '</ul>\n';
        currentLevel--;
        levelStack.pop();
      }

      // Build entry with number and title
      const displayText = numberSpan ? `${numberSpan.textContent}${titleText}` : titleText;
      const indentClass = `toc-level-${level}`;
      toc += `<li class="${indentClass}"><a href="#${headingId}" class="toc-link">${displayText}</a></li>\n`;
    });

    // Close remaining open lists
    while (currentLevel > 1) {
      toc += '</ul>\n';
      currentLevel--;
    }

    toc += '</ul>\n</div>\n';

    return toc;
  }

  insertTableOfContents() {
    // Check if TOC already exists
    if (this.editor.querySelector('.toc-container')) {
      alert('Índice já existe. Remova o anterior primeiro.');
      return;
    }

    const toc = this.generateTableOfContents();
    if (!toc) {
      alert('Adicione títulos antes de gerar o índice.');
      return;
    }

    const tocContainer = document.createElement('div');
    tocContainer.className = 'toc-container';
    tocContainer.innerHTML = toc;

    // Add as first child or after existing TOC
    this.editor.insertBefore(tocContainer, this.editor.firstChild);
    this.editor.focus();
    this.captureHistory();
  }

  updateTableOfContents() {
    const existingToc = this.editor.querySelector('.toc-container');
    if (existingToc) {
      const newToc = this.generateTableOfContents();
      if (newToc) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = newToc;
        existingToc.replaceWith(tempDiv.firstChild);
      }
    }
  }

  insertEndnote() {
    this.footnoteCounter++;
    const endnoteHTML = `<sup><a href="#en${this.footnoteCounter}" class="endnote-ref" data-endnote="${this.footnoteCounter}">[${this.footnoteCounter}]</a></sup>`;
    document.execCommand('insertHTML', false, endnoteHTML);
  }

  setSuperscript() {
    document.execCommand('superscript');
  }

  setSubscript() {
    document.execCommand('subscript');
  }

  increaseLineHeight() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedContent = range.extractContents();
      const span = document.createElement('span');
      span.style.lineHeight = '2';
      span.appendChild(selectedContent);
      range.insertNode(span);
    }
  }

  decreaseLineHeight() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedContent = range.extractContents();
      const span = document.createElement('span');
      span.style.lineHeight = '1.5';
      span.appendChild(selectedContent);
      range.insertNode(span);
    }
  }

  handleFileUpload(file) {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.borderRadius = '6px';
        img.style.margin = '12px 0';

        const div = document.createElement('div');
        div.style.textAlign = 'center';
        div.style.margin = '12px 0';
        div.appendChild(img);
        document.execCommand('insertHTML', false, div.outerHTML);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Por favor, faça upload de um arquivo de imagem');
    }
  }

  exportAsHTML() {
    return this.getContent();
  }

  exportAsText() {
    return this.getText();
  }

  downloadAsHTML(filename = 'document.html') {
    const content = this.getContent();
    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${filename}</title>
        <style>
          body {
            font-family: "Geist", -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.6;
            max-width: 900px;
            margin: 0 auto;
            padding: 40px 20px;
            color: #0f0d1e;
          }
          h1, h2, h3, h4, h5, h6 {
            font-family: "Instrument Serif", Georgia, serif;
            margin: 1.5em 0 0.5em 0;
            line-height: 1.3;
          }
          table { border-collapse: collapse; width: 100%; margin: 1em 0; }
          td, th { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background: #f3f2ec; font-weight: 600; }
          img { max-width: 100%; height: auto; border-radius: 6px; margin: 1em 0; }
          a { color: #7c3aed; text-decoration: none; }
          code { background: #f3f2ec; padding: 2px 6px; border-radius: 4px; }
          pre { background: #f3f2ec; padding: 12px; border-radius: 6px; overflow-x: auto; }
          blockquote { border-left: 3px solid #7c3aed; padding-left: 1em; margin: 1em 0; font-style: italic; }
        </style>
      </head>
      <body>
        ${content}
      </body>
      </html>
    `;
    this.downloadFile(html, filename, 'text/html');
  }

  downloadAsText(filename = 'document.txt') {
    const content = this.getText();
    this.downloadFile(content, filename, 'text/plain');
  }

  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  print() {
    const printWindow = window.open('', '', 'width=800,height=600');
    const title = document.querySelector('.editor-title-input')?.value || 'Documento';
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
          body {
            font-family: "Geist", -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.6;
            max-width: 900px;
            margin: 0 auto;
            padding: 40px 20px;
            color: #0f0d1e;
          }
          h1 { font-size: 2em; margin-top: 1.5em; margin-bottom: 0.5em; }
          h2 { font-size: 1.5em; margin-top: 1.3em; margin-bottom: 0.5em; }
          h3 { font-size: 1.2em; margin-top: 1.2em; margin-bottom: 0.4em; }
          table { border-collapse: collapse; width: 100%; margin: 1em 0; }
          td, th { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background: #f3f2ec; font-weight: 600; }
          img { max-width: 100%; height: auto; margin: 1em 0; }
          @media print {
            body { padding: 0; }
            img { page-break-inside: avoid; }
            table { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        ${this.getContent()}
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
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
    this.clearAutoSave();
    clearTimeout(this.debounceTimer);
    this.editor.contentEditable = false;
  }
}

// Export for use in both modules and scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RichTextEditor;
}
