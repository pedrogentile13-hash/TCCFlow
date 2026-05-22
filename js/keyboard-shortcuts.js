/**
 * Keyboard Shortcuts Manager
 * Manages and displays all keyboard shortcuts for the editor
 */

class KeyboardShortcutsManager {
  constructor(editor) {
    this.editor = editor;
    this.shortcuts = this.defineShortcuts();
    this.init();
  }

  defineShortcuts() {
    return {
      'Formatação de Texto': [
        { keys: 'Ctrl+B', action: 'Negrito', command: 'bold', icon: '𝐁' },
        { keys: 'Ctrl+I', action: 'Itálico', command: 'italic', icon: '𝑰' },
        { keys: 'Ctrl+U', action: 'Sublinhado', command: 'underline', icon: '𝐔̲' },
        { keys: 'Ctrl+Shift+M', action: 'Limpar formatação', command: 'clearFormatting', icon: '✕' },
      ],
      'Títulos e Numeração': [
        { keys: 'Ctrl+Alt+1', action: 'Título 1', command: 'heading1', icon: 'H₁' },
        { keys: 'Ctrl+Alt+2', action: 'Título 2', command: 'heading2', icon: 'H₂' },
        { keys: 'Ctrl+Alt+3', action: 'Título 3', command: 'heading3', icon: 'H₃' },
        { keys: 'Ctrl+Alt+4', action: 'Título 4', command: 'heading4', icon: 'H₄' },
        { keys: 'Ctrl+Shift+7', action: 'Lista numerada', command: 'orderedList', icon: '①②③' },
        { keys: 'Ctrl+Shift+8', action: 'Lista com marcadores', command: 'unorderedList', icon: '• • •' },
      ],
      'Citações e Notas': [
        { keys: 'Ctrl+Shift+C', action: 'Inserir citação', command: 'insertCitation', icon: '¹²³' },
        { keys: 'Ctrl+Alt+F', action: 'Inserir nota de rodapé', command: 'insertFootnote', icon: '†' },
      ],
      'Painel de Numeração': [
        { keys: 'Ctrl+Shift+N', action: 'Alternar painel de numeração', command: 'toggleNumberingPanel', icon: '≡' },
      ],
      'Desfazer/Refazer': [
        { keys: 'Ctrl+Z', action: 'Desfazer', command: 'undo', icon: '↶' },
        { keys: 'Ctrl+Y', action: 'Refazer', command: 'redo', icon: '↷' },
        { keys: 'Ctrl+Shift+Z', action: 'Refazer', command: 'redo', icon: '↷' },
      ],
      'Links e Mídia': [
        { keys: 'Ctrl+Shift+K', action: 'Inserir link', command: 'insertLink', icon: '🔗' },
      ],
    };
  }

  init() {
    this.setupKeyboardListeners();
  }

  setupKeyboardListeners() {
    // These will be integrated into the main editor keyboard setup
    // This method just defines the structure for the shortcuts
  }

  getShortcutByCommand(command) {
    for (const category in this.shortcuts) {
      const found = this.shortcuts[category].find(s => s.command === command);
      if (found) return found;
    }
    return null;
  }

  getShortcutsByCategory(category) {
    return this.shortcuts[category] || [];
  }

  getAllShortcuts() {
    return this.shortcuts;
  }

  getFormattedShortcutString(command) {
    const shortcut = this.getShortcutByCommand(command);
    return shortcut ? shortcut.keys : '';
  }

  isValidShortcut(keys) {
    for (const category in this.shortcuts) {
      if (this.shortcuts[category].some(s => s.keys === keys)) {
        return true;
      }
    }
    return false;
  }
}

// Export for use in both modules and scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = KeyboardShortcutsManager;
}
