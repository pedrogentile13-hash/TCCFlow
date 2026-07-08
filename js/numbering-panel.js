/**
 * Numbering Panel Component
 * Beautiful collapsible panel showing all numbering styles with previews
 */

class NumberingPanel {
  constructor(editor, containerId) {
    this.editor = editor;
    this.container = document.getElementById(containerId);
    this.isOpen = true;
    this.init();
  }

  init() {
    this.render();
    this.attachEventListeners();
  }

  render() {
    if (!this.container) return;

    const html = `
      <div class="numbering-panel">
        <div class="numbering-panel-header">
          <div class="numbering-panel-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/>
              <line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/>
              <path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>
            </svg>
            Estilos de Formatação
          </div>
          <button class="numbering-panel-toggle" id="numbering-panel-toggle" title="Ocultar painel">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 6 15 12 9 18"></polyline>
            </svg>
          </button>
        </div>

        <div class="numbering-panel-content" id="numbering-panel-content">
          <!-- Headings Category -->
          <div class="numbering-category">
            <div class="numbering-category-header">
              <span class="category-title">Títulos</span>
            </div>
            <div class="numbering-category-items">
              <button class="numbering-style-btn heading-style" data-heading="1" title="Título 1 - Ctrl+Alt+1">
                <div class="style-preview">
                  <div class="preview-number">1</div>
                  <div class="preview-text">
                    <div class="preview-title">Título Principal</div>
                    <div class="preview-desc">Maior destaque</div>
                  </div>
                </div>
              </button>
              <button class="numbering-style-btn heading-style" data-heading="2" title="Título 2 - Ctrl+Alt+2">
                <div class="style-preview">
                  <div class="preview-number">1.1</div>
                  <div class="preview-text">
                    <div class="preview-title">Subtítulo</div>
                    <div class="preview-desc">Segundo nível</div>
                  </div>
                </div>
              </button>
              <button class="numbering-style-btn heading-style" data-heading="3" title="Título 3 - Ctrl+Alt+3">
                <div class="style-preview">
                  <div class="preview-number">1.1.1</div>
                  <div class="preview-text">
                    <div class="preview-title">Sub-subtítulo</div>
                    <div class="preview-desc">Terceiro nível</div>
                  </div>
                </div>
              </button>
              <button class="numbering-style-btn heading-style" data-heading="4" title="Título 4 - Ctrl+Alt+4">
                <div class="style-preview">
                  <div class="preview-number">1.1.1.1</div>
                  <div class="preview-text">
                    <div class="preview-title">Título 4</div>
                    <div class="preview-desc">Quarto nível</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- Lists Category -->
          <div class="numbering-category">
            <div class="numbering-category-header">
              <span class="category-title">Listas Numeradas</span>
            </div>
            <div class="numbering-category-items">
              <button class="numbering-style-btn list-style" data-style="number-123" title="1, 2, 3, 4...">
                <div class="style-preview">
                  <div class="preview-icon">①</div>
                  <div class="preview-text">
                    <div class="preview-title">Números</div>
                    <div class="preview-desc">1, 2, 3, 4...</div>
                  </div>
                </div>
              </button>
              <button class="numbering-style-btn list-style" data-style="number-abc" title="a, b, c, d...">
                <div class="style-preview">
                  <div class="preview-icon">ⓐ</div>
                  <div class="preview-text">
                    <div class="preview-title">Letras</div>
                    <div class="preview-desc">a, b, c, d...</div>
                  </div>
                </div>
              </button>
              <button class="numbering-style-btn list-style" data-style="number-roman" title="i, ii, iii, iv...">
                <div class="style-preview">
                  <div class="preview-icon">ⓘ</div>
                  <div class="preview-text">
                    <div class="preview-title">Romanos</div>
                    <div class="preview-desc">i, ii, iii, iv...</div>
                  </div>
                </div>
              </button>
              <button class="numbering-style-btn list-style" data-style="custom-1.1" title="1.1, 1.2, 2.1...">
                <div class="style-preview">
                  <div class="preview-icon">§</div>
                  <div class="preview-text">
                    <div class="preview-title">Hierárquico</div>
                    <div class="preview-desc">1.1, 1.2, 2.1...</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- Bullets Category -->
          <div class="numbering-category">
            <div class="numbering-category-header">
              <span class="category-title">Marcadores</span>
            </div>
            <div class="numbering-category-items">
              <button class="numbering-style-btn bullet-style" data-style="bullet-circle" title="Círculos">
                <div class="style-preview">
                  <div class="preview-icon">◦</div>
                  <div class="preview-text">
                    <div class="preview-title">Círculos</div>
                    <div class="preview-desc">◦ ◦ ◦</div>
                  </div>
                </div>
              </button>
              <button class="numbering-style-btn bullet-style" data-style="bullet-square" title="Quadrados">
                <div class="style-preview">
                  <div class="preview-icon">◾</div>
                  <div class="preview-text">
                    <div class="preview-title">Quadrados</div>
                    <div class="preview-desc">◾ ◾ ◾</div>
                  </div>
                </div>
              </button>
              <button class="numbering-style-btn bullet-style" data-style="bullet-dash" title="Traços">
                <div class="style-preview">
                  <div class="preview-icon">–</div>
                  <div class="preview-text">
                    <div class="preview-title">Traços</div>
                    <div class="preview-desc">– – –</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- Tools Category -->
          <div class="numbering-category">
            <div class="numbering-category-header">
              <span class="category-title">Ferramentas</span>
            </div>
            <div class="numbering-category-items">
              <button class="numbering-style-btn tool-btn" id="numbering-panel-toc" title="Gerar índice automático">
                <div class="style-preview">
                  <div class="preview-icon">📑</div>
                  <div class="preview-text">
                    <div class="preview-title">Gerar Índice</div>
                    <div class="preview-desc">Automático com links</div>
                  </div>
                </div>
              </button>
              <button class="numbering-style-btn tool-btn" id="numbering-panel-clear" title="Limpar todas as numerações">
                <div class="style-preview">
                  <div class="preview-icon">✕</div>
                  <div class="preview-text">
                    <div class="preview-title">Limpar Tudo</div>
                    <div class="preview-desc">Remove numeração</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
  }

  attachEventListeners() {
    // Toggle panel visibility
    const toggleBtn = document.getElementById('numbering-panel-toggle');
    const content = document.getElementById('numbering-panel-content');

    if (toggleBtn && content) {
      toggleBtn.addEventListener('click', () => {
        this.isOpen = !this.isOpen;
        content.style.display = this.isOpen ? 'block' : 'none';
        toggleBtn.style.transform = this.isOpen ? 'rotate(0deg)' : 'rotate(-180deg)';
      });
    }

    // Heading style buttons
    document.querySelectorAll('.heading-style').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const level = parseInt(btn.dataset.heading);
        this.editor.applyHeadingStyle(level);
        this.highlightButton(btn);
      });
    });

    // List style buttons
    document.querySelectorAll('.list-style').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const style = btn.dataset.style;
        this.editor.applyNumberingStyle(style);
        this.highlightButton(btn);
      });
    });

    // Bullet style buttons
    document.querySelectorAll('.bullet-style').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const style = btn.dataset.style;
        this.editor.applyNumberingStyle(style);
        this.highlightButton(btn);
      });
    });

    // Tool buttons
    document.getElementById('numbering-panel-toc')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.editor.insertTableOfContents();
      this.highlightButton(e.target.closest('.tool-btn'));
    });

    document.getElementById('numbering-panel-clear')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.editor.clearNumbering('all');
      this.highlightButton(e.target.closest('.tool-btn'));
    });
  }

  highlightButton(btn) {
    // Remove previous highlight
    document.querySelectorAll('.numbering-style-btn').forEach(b => {
      b.classList.remove('active');
    });

    // Add highlight to clicked button
    btn.classList.add('active');

    // Remove highlight after 300ms
    setTimeout(() => {
      btn.classList.remove('active');
    }, 300);
  }

  toggle() {
    const content = document.getElementById('numbering-panel-content');
    if (content) {
      this.isOpen = !this.isOpen;
      content.style.display = this.isOpen ? 'block' : 'none';
    }
  }

  setOpen(isOpen) {
    const content = document.getElementById('numbering-panel-content');
    const toggleBtn = document.getElementById('numbering-panel-toggle');
    if (content && toggleBtn) {
      this.isOpen = isOpen;
      content.style.display = isOpen ? 'block' : 'none';
      toggleBtn.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(-180deg)';
    }
  }
}

// Export for use in both modules and scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NumberingPanel;
}
