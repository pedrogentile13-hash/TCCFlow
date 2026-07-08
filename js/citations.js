/**
 * Citation Management System
 * Handles automatic citations with superscript numbers and footnotes
 * CRITICAL FEATURE: Select text → Ctrl+Shift+C → superscript appears → footnote auto-created
 */

class CitationManager {
  constructor(editor) {
    this.editor = editor;
    this.citations = [];
    this.citationCounter = 0;
    this.init();
  }

  init() {
    // Load citations from localStorage if they exist
    this.loadCitations();
    // Setup keyboard shortcut for inserting citations (Ctrl+Shift+C)
    this.setupKeyboardShortcuts();
  }

  setupKeyboardShortcuts() {
    // This will be called from the main editor's keyboard setup
    // The shortcut Ctrl+Shift+C will trigger insertCitationAtSelection()
  }

  /**
   * CRITICAL: Insert citation when user presses Ctrl+Shift+C with selected text
   */
  insertCitationAtSelection() {
    const selection = window.getSelection();
    if (selection.toString().length === 0) {
      alert('Por favor, selecione o texto para adicionar uma citação');
      return;
    }

    // Get the selected text
    const selectedText = selection.toString();
    this.insertCitation(selectedText);
  }

  /**
   * CRITICAL: Create superscript number in text and auto-create footnote at bottom
   */
  insertCitation(selectedText) {
    this.citationCounter++;
    const citationId = `citation-${this.citationCounter}`;
    const citationNum = this.citationCounter;

    // Create superscript citation marker - BLUE COLOR, CLICKABLE
    const citationHTML = `<sup class="citation-marker" data-citation-id="${citationId}" data-citation-num="${citationNum}"><a href="#${citationId}" class="citation-link">${citationNum}</a></sup>`;

    // Insert into document at cursor position
    document.execCommand('insertHTML', false, citationHTML);

    // Store citation data with timestamp
    const citation = {
      id: citationId,
      number: citationNum,
      selectedText: selectedText,
      citationText: '',
      timestamp: new Date().toISOString()
    };

    this.citations.push(citation);

    // Add citation to footnote area
    this.renderFootnotes();
    this.saveCitations();

    // Focus on the footnote text area for immediate editing
    const footnoteInput = document.querySelector(`[data-citation-id="${citationId}"] .citation-text-input`);
    if (footnoteInput) {
      setTimeout(() => footnoteInput.focus(), 100);
    }
  }

  deleteCitation(citationId) {
    // Find citation index
    const index = this.citations.findIndex(c => c.id === citationId);
    if (index === -1) return;

    // Remove citation from HTML
    const marker = document.querySelector(`[data-citation-id="${citationId}"]`);
    if (marker) {
      marker.remove();
    }

    // Remove from citations array
    this.citations.splice(index, 1);

    // Renumber all citations
    this.renumberCitations();
    this.renderFootnotes();
    this.saveCitations();
  }

  renumberCitations() {
    // Re-number all citations after deletion
    this.citations.forEach((citation, index) => {
      citation.number = index + 1;
      citation.id = `citation-${index + 1}`;
    });

    // Update HTML markers
    const markers = document.querySelectorAll('.citation-marker');
    markers.forEach((marker, index) => {
      const citation = this.citations[index];
      if (citation) {
        marker.setAttribute('data-citation-id', citation.id);
        marker.setAttribute('data-citation-num', citation.number);
        marker.querySelector('a').textContent = citation.number;
        marker.querySelector('a').href = `#${citation.id}`;
      }
    });

    this.citationCounter = this.citations.length;
  }

  updateCitationText(citationId, text) {
    const citation = this.citations.find(c => c.id === citationId);
    if (citation) {
      citation.citationText = text;
      this.saveCitations();
    }
  }

  renderFootnotes() {
    let footnotesHTML = '';

    if (this.citations.length > 0) {
      footnotesHTML = '<div class="footnote-area">';
      footnotesHTML += '<div class="footnote-divider"></div>';
      footnotesHTML += '<div class="footnotes-container">';

      this.citations.forEach(citation => {
        footnotesHTML += `
          <div class="footnote-item" data-citation-id="${citation.id}" id="${citation.id}">
            <div class="footnote-header">
              <span class="footnote-number">${citation.number}</span>
              <span class="footnote-context">"${citation.selectedText.substring(0, 50)}${citation.selectedText.length > 50 ? '...' : ''}"</span>
              <button class="footnote-delete-btn" data-citation-id="${citation.id}" title="Excluir citação">×</button>
            </div>
            <div class="footnote-content">
              <input
                type="text"
                class="citation-text-input"
                placeholder="Digite a referência bibliográfica..."
                value="${citation.citationText}"
                data-citation-id="${citation.id}"
              />
            </div>
          </div>
        `;
      });

      footnotesHTML += '</div></div>';
    }

    // Insert or update footnote area
    let footnoteArea = this.editor.querySelector('.footnote-area');
    if (footnoteArea) {
      footnoteArea.remove();
    }

    if (footnotesHTML) {
      const footnoteDiv = document.createElement('div');
      footnoteDiv.innerHTML = footnotesHTML;
      this.editor.appendChild(footnoteDiv.firstChild);
      this.attachFootnoteListeners();
    }
  }

  attachFootnoteListeners() {
    // Save citation text on input
    document.querySelectorAll('.citation-text-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const citationId = e.target.dataset.citationId;
        this.updateCitationText(citationId, e.target.value);
      });
    });

    // Delete button listeners
    document.querySelectorAll('.footnote-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const citationId = btn.dataset.citationId;
        if (confirm('Excluir esta citação?')) {
          this.deleteCitation(citationId);
        }
      });
    });

    // Click on superscript to scroll to footnote
    document.querySelectorAll('.citation-marker').forEach(marker => {
      marker.addEventListener('click', (e) => {
        e.preventDefault();
        const citationId = marker.dataset.citationId;
        const footnote = document.getElementById(citationId);
        if (footnote) {
          footnote.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          footnote.classList.add('highlight-footnote');
          setTimeout(() => footnote.classList.remove('highlight-footnote'), 1000);
        }
      });
    });
  }

  saveCitations() {
    try {
      const storageKey = `citations_${this.editor.options?.storageKey || 'default'}`;
      localStorage.setItem(storageKey, JSON.stringify(this.citations));
    } catch (e) {
      console.error('Failed to save citations:', e);
    }
  }

  loadCitations() {
    try {
      const storageKey = `citations_${this.editor.options?.storageKey || 'default'}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        this.citations = JSON.parse(saved);
        this.citationCounter = this.citations.length;
      }
    } catch (e) {
      console.error('Failed to load citations:', e);
    }
  }

  getCitationsHTML() {
    return this.renderFootnotes();
  }

  exportWithCitations() {
    // Export document with citations included
    let html = this.editor.innerHTML;

    // Convert superscript links to proper footnote format
    html = html.replace(/<sup[^>]*data-citation-num="(\d+)"[^>]*>.*?<\/sup>/g,
      '<sup>[$1]</sup>');

    return html;
  }

  getFormattedCitations(format = 'APA') {
    const formatted = [];

    this.citations.forEach((citation, index) => {
      let formatted_text = '';

      switch (format) {
        case 'APA':
          formatted_text = `[${citation.number}] ${citation.citationText}`;
          break;
        case 'MLA':
          formatted_text = `${index + 1}. ${citation.citationText}`;
          break;
        case 'Chicago':
          formatted_text = `${citation.number}. ${citation.citationText}`;
          break;
        default:
          formatted_text = `${citation.number}. ${citation.citationText}`;
      }

      formatted.push(formatted_text);
    });

    return formatted;
  }

  clearAllCitations() {
    if (!confirm('Remover todas as citações? Isso não pode ser desfeito.')) return;

    // Remove all citation markers from HTML
    document.querySelectorAll('.citation-marker').forEach(marker => marker.remove());

    // Clear citations array
    this.citations = [];
    this.citationCounter = 0;

    // Remove footnote area
    const footnoteArea = this.editor.querySelector('.footnote-area');
    if (footnoteArea) {
      footnoteArea.remove();
    }

    this.saveCitations();
  }
}

// Export for use in both modules and scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CitationManager;
}
