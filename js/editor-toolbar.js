/**
 * Editor Toolbar Component
 * Builds and manages the rich text editor toolbar
 */

class EditorToolbar {
  constructor(editor, containerId) {
    this.editor = editor;
    this.container = document.getElementById(containerId);
    this.colorPickerOpen = false;
    this.highlightPickerOpen = false;
  }

  build() {
    if (!this.container) return;

    const html = `
      <div class="editor-toolbar">
        <!-- Undo/Redo -->
        <div class="toolbar-group">
          <button class="toolbar-btn" id="btn-undo" title="Desfazer (Ctrl+Z)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 7 3 13 9 13"/>
              <path d="M23 1v6h-6"/>
              <path d="M20.49 15a9 9 0 1 1-2-8.83"/>
            </svg>
          </button>
          <button class="toolbar-btn" id="btn-redo" title="Refazer (Ctrl+Y)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="21 7 21 13 15 13"/>
              <path d="M1 1v6h6"/>
              <path d="M3.51 15a9 9 0 0 0 14.85-4.95"/>
            </svg>
          </button>
        </div>

        <div class="toolbar-divider"></div>

        <!-- Text Formatting -->
        <div class="toolbar-group">
          <button class="toolbar-btn" id="btn-bold" title="Negrito (Ctrl+B)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 4h8a6 6 0 0 1 6 6 6 6 0 0 1-6 6H6V4zm10 10a2 2 0 1 0 0-4H6v4h10z"/>
            </svg>
          </button>
          <button class="toolbar-btn" id="btn-italic" title="Itálico (Ctrl+I)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="19" y1="4" x2="10" y2="4"/>
              <line x1="14" y1="20" x2="5" y2="20"/>
              <line x1="15" y1="4" x2="9" y2="20"/>
            </svg>
          </button>
          <button class="toolbar-btn" id="btn-underline" title="Sublinhado (Ctrl+U)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/>
              <line x1="4" y1="21" x2="20" y2="21"/>
            </svg>
          </button>
          <button class="toolbar-btn" id="btn-strikethrough" title="Tachado">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17.3 13.61a6.3 6.3 0 0 0-.02-2.61m-2.65-2.61a6 6 0 1 0 10.3 6.84"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
            </svg>
          </button>
        </div>

        <div class="toolbar-divider"></div>

        <!-- Font Controls -->
        <div class="toolbar-group">
          <select class="toolbar-select" id="font-family" title="Fonte">
            <option value="">Fonte padrão</option>
            <option value="Arial">Arial</option>
            <option value="'Times New Roman'">Times New Roman</option>
            <option value="'Courier New'">Courier New</option>
            <option value="Georgia">Georgia</option>
            <option value="Verdana">Verdana</option>
            <option value="'Trebuchet MS'">Trebuchet MS</option>
            <option value="'Comic Sans MS'">Comic Sans MS</option>
            <option value="'Segoe UI'">Segoe UI</option>
          </select>

          <select class="toolbar-select" id="font-size" title="Tamanho">
            <option value="8">8px</option>
            <option value="10">10px</option>
            <option value="12">12px</option>
            <option value="14">14px</option>
            <option value="16">16px</option>
            <option value="18">18px</option>
            <option value="20">20px</option>
            <option value="24">24px</option>
            <option value="28">28px</option>
            <option value="32">32px</option>
            <option value="36">36px</option>
            <option value="48">48px</option>
          </select>
        </div>

        <div class="toolbar-divider"></div>

        <!-- Color Pickers -->
        <div class="toolbar-group">
          <div class="toolbar-color-wrapper">
            <button class="toolbar-btn toolbar-color-btn" id="btn-text-color" title="Cor do texto">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 20h5l1.12-3h6.76L15.88 20h5L12 2zm-2.5 9l2.5-6.5 2.5 6.5h-5z"/>
              </svg>
              <span class="color-indicator" id="text-color-indicator"></span>
            </button>
            <div class="color-picker" id="text-color-picker" style="display: none;">
              <div class="color-grid">
                ${this.buildColorGrid()}
              </div>
              <input type="color" id="text-color-input" class="color-input" title="Cor personalizada">
            </div>
          </div>

          <div class="toolbar-color-wrapper">
            <button class="toolbar-btn toolbar-color-btn" id="btn-highlight" title="Marca-texto">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 7l-1.8 3.6H1v2h1.2L4 17v2h2v-2l2.8-4.4H13v-2H8.8L7 10.6V9h-2V7H4z"/>
                <path d="M12 4v2h8v8h2V6h-10z"/>
              </svg>
              <span class="color-indicator" id="highlight-color-indicator"></span>
            </button>
            <div class="color-picker" id="highlight-color-picker" style="display: none;">
              <div class="color-grid">
                ${this.buildColorGrid(true)}
              </div>
              <input type="color" id="highlight-color-input" class="color-input" title="Cor personalizada">
            </div>
          </div>
        </div>

        <div class="toolbar-divider"></div>

        <!-- Alignment -->
        <div class="toolbar-group">
          <button class="toolbar-btn" id="btn-align-left" title="Alinhar à esquerda">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/>
              <line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/>
            </svg>
          </button>
          <button class="toolbar-btn" id="btn-align-center" title="Centralizar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="19" y1="10" x2="5" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/>
              <line x1="21" y1="14" x2="3" y2="14"/><line x1="19" y1="18" x2="5" y2="18"/>
            </svg>
          </button>
          <button class="toolbar-btn" id="btn-align-right" title="Alinhar à direita">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/>
              <line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="7" y2="18"/>
            </svg>
          </button>
          <button class="toolbar-btn" id="btn-align-justify" title="Justificar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/>
              <line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="toolbar-divider"></div>

        <!-- Numbering and Outline -->
        <div class="toolbar-group">
          <div class="toolbar-numbering-wrapper">
            <button class="toolbar-btn" id="btn-numbering" title="Estilos de numeração e títulos (Ctrl+Alt+1 para H1)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/>
                <line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/>
                <path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>
              </svg>
              <span class="toolbar-dropdown-arrow">▼</span>
            </button>
            <div class="numbering-menu" id="numbering-menu" style="display: none;">
              <div class="numbering-submenu">
                <div class="numbering-label">Estilos de Título</div>
                <button class="numbering-option" data-heading="1" title="Título 1 - Nível mais alto (Ctrl+Alt+1)">
                  <span class="heading-preview">1</span>
                  <div style="flex: 1;">
                    <div style="font-weight: 600;">Título 1</div>
                    <div style="font-size: 0.75rem; color: var(--muted); margin-top: 2px;">Nível principal</div>
                  </div>
                </button>
                <button class="numbering-option" data-heading="2" title="Título 2 - Subtítulo (Ctrl+Alt+2)">
                  <span class="heading-preview">1.1</span>
                  <div style="flex: 1;">
                    <div style="font-weight: 600;">Título 2</div>
                    <div style="font-size: 0.75rem; color: var(--muted); margin-top: 2px;">Subseção</div>
                  </div>
                </button>
                <button class="numbering-option" data-heading="3" title="Título 3 - Sub-subtítulo (Ctrl+Alt+3)">
                  <span class="heading-preview">1.1.1</span>
                  <div style="flex: 1;">
                    <div style="font-weight: 600;">Título 3</div>
                    <div style="font-size: 0.75rem; color: var(--muted); margin-top: 2px;">Menor destaque</div>
                  </div>
                </button>
                <button class="numbering-option" data-heading="4" title="Título 4 - Menor nível (Ctrl+Alt+4)">
                  <span class="heading-preview">1.1.1.1</span>
                  <div style="flex: 1;">
                    <div style="font-weight: 600;">Título 4</div>
                    <div style="font-size: 0.75rem; color: var(--muted); margin-top: 2px;">Detalhe</div>
                  </div>
                </button>
              </div>
              <div class="numbering-divider"></div>
              <div class="numbering-submenu">
                <div class="numbering-label">Numeração de Parágrafos</div>
                <button class="numbering-option" data-style="number-123" title="Numerar com 1, 2, 3...">
                  <span class="style-icon">①</span> 1, 2, 3
                </button>
                <button class="numbering-option" data-style="number-abc" title="Numerar com a, b, c...">
                  <span class="style-icon">ⓐ</span> a, b, c
                </button>
                <button class="numbering-option" data-style="number-roman" title="Numerar com i, ii, iii...">
                  <span class="style-icon">ⓘ</span> i, ii, iii
                </button>
                <button class="numbering-option" data-style="custom-1.1" title="Numeração hierárquica 1.1, 1.2, 2.1">
                  <span class="style-icon">§</span> 1.1, 1.2, 2.1
                </button>
              </div>
              <div class="numbering-divider"></div>
              <div class="numbering-submenu">
                <div class="numbering-label">Marcadores</div>
                <button class="numbering-option" data-style="bullet-circle" title="Pontos vazios">
                  <span class="style-icon">◦</span> Círculos
                </button>
                <button class="numbering-option" data-style="bullet-square" title="Quadrados sólidos">
                  <span class="style-icon">◾</span> Quadrados
                </button>
                <button class="numbering-option" data-style="bullet-dash" title="Traços">
                  <span class="style-icon">–</span> Traços
                </button>
              </div>
              <div class="numbering-divider"></div>
              <div class="numbering-submenu">
                <button class="numbering-option" id="btn-toc" title="Insere um índice automático com links para títulos">
                  <span class="style-icon">📑</span>
                  <div style="flex: 1;">
                    <div style="font-weight: 600;">Gerar Índice</div>
                    <div style="font-size: 0.75rem; color: var(--muted); margin-top: 2px;">Automático e navegável</div>
                  </div>
                </button>
                <button class="numbering-option" id="btn-clear-numbering" title="Remove todos os números e marcadores">
                  <span class="style-icon">✕</span>
                  <div style="flex: 1;">
                    <div style="font-weight: 600;">Limpar Tudo</div>
                    <div style="font-size: 0.75rem; color: var(--muted); margin-top: 2px;">Remove numeração</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="toolbar-divider"></div>

        <!-- Lists and Indentation -->
        <div class="toolbar-group">
          <button class="toolbar-btn" id="btn-list-ul" title="Lista com marcadores">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/>
              <line x1="9" y1="18" x2="20" y2="18"/><line x1="5" y1="6" x2="5" y2="6.01"/>
              <line x1="5" y1="12" x2="5" y2="12.01"/><line x1="5" y1="18" x2="5" y2="18.01"/>
            </svg>
          </button>
          <button class="toolbar-btn" id="btn-list-ol" title="Lista numerada">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/>
              <line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/>
              <path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>
            </svg>
          </button>
          <button class="toolbar-btn" id="btn-indent" title="Aumentar recuo">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 12 21 12"/><polyline points="7 6 21 6"/><polyline points="7 18 21 18"/>
              <path d="M3 12h4v4l-4-2z"/>
            </svg>
          </button>
          <button class="toolbar-btn" id="btn-outdent" title="Diminuir recuo">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 12 21 12"/><polyline points="7 6 21 6"/><polyline points="7 18 21 18"/>
              <path d="M6 12h-3v-3l3 1.5z"/>
            </svg>
          </button>
        </div>

        <div class="toolbar-divider"></div>

        <!-- Advanced -->
        <div class="toolbar-group">
          <button class="toolbar-btn" id="btn-superscript" title="Sobrescrito">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 7h10M3 13h18M6 19h12"/>
              <text x="16" y="5" font-size="8" font-weight="bold">x²</text>
            </svg>
          </button>
          <button class="toolbar-btn" id="btn-subscript" title="Subscrito">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 3h10M3 9h18M6 15h12"/>
              <text x="16" y="21" font-size="8" font-weight="bold">x₂</text>
            </svg>
          </button>
          <button class="toolbar-btn" id="btn-link" title="Inserir link (Ctrl+Shift+K)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
          </button>
          <button class="toolbar-btn" id="btn-image" title="Inserir imagem">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </button>
          <button class="toolbar-btn" id="btn-table" title="Inserir tabela">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/>
              <line x1="15" y1="3" x2="15" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/>
              <line x1="3" y1="15" x2="21" y2="15"/>
            </svg>
          </button>
          <button class="toolbar-btn" id="btn-footnote" title="Inserir nota de rodapé">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v15H6.5A2.5 2.5 0 0 1 4 14.5v-13A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </button>
          <button class="toolbar-btn" id="btn-clear" title="Limpar formatação">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M8 6v12M16 6v12M6 18h12"/>
            </svg>
          </button>
        </div>

        <div class="toolbar-divider"></div>

        <!-- Line Height -->
        <div class="toolbar-group">
          <select class="toolbar-select" id="line-height" title="Espaçamento de linha">
            <option value="1">1.0</option>
            <option value="1.5">1.5</option>
            <option value="2">2.0</option>
            <option value="2.5">2.5</option>
          </select>
        </div>

        <div class="toolbar-divider"></div>

        <!-- Export/Print -->
        <div class="toolbar-group">
          <button class="toolbar-btn" id="btn-print" title="Imprimir">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
          </button>
          <button class="toolbar-btn" id="btn-download-html" title="Baixar como HTML">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </button>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
    this.attachEventListeners();
  }

  buildColorGrid(isHighlight = false) {
    const colors = isHighlight
      ? [
          '#ffff00', '#ffeb3b', '#fdd835', '#ffca28', '#fbc02d', '#f9a825',
          '#ff9800', '#fb8c00', '#f57c00', '#e65100', '#ffb74d', '#ffb300',
          '#ff9100', '#ff6d00', '#ff3d00', '#dd2c00', '#ffcdd2', '#ef9a9a',
          '#e57373', '#ef5350', '#f44336', '#e53935', '#ffebee', '#ffcdd2'
        ]
      : [
          '#000000', '#424242', '#616161', '#757575', '#9e9e9e', '#bdbdbd',
          '#e0e0e0', '#f5f5f5', '#ffffff', '#ffebee', '#ffcdd2', '#ef9a9a',
          '#e57373', '#ef5350', '#f44336', '#e53935', '#fce4ec', '#f8bbd0',
          '#f48fb1', '#f06292', '#ec407a', '#e91e63', '#f3e5f5', '#e1bee7',
          '#ce93d8', '#ba68c8', '#ab47bc', '#9c27b0', '#ede7f6', '#d1c4e9',
          '#b39ddb', '#9575cd', '#7e57c2', '#673ab7', '#e8eaf6', '#c5cae9',
          '#9fa8da', '#7986cb', '#5c6bc0', '#3f51b5', '#e3f2fd', '#bbdefb',
          '#90caf9', '#64b5f6', '#42a5f5', '#2196f3', '#e0f2f1', '#b2dfdb',
          '#80cbc4', '#4db6ac', '#26a69a', '#009688', '#e8f5e9', '#c8e6c9',
          '#a5d6a7', '#81c784', '#66bb6a', '#4caf50', '#fff8e1', '#fff9c4',
          '#fff59d', '#fff176', '#ffee58', '#ffeb3b', '#fff3e0', '#ffe0b2',
          '#ffcc80', '#ffb74d', '#ffa726', '#ff9800'
        ];

    return colors.map(color => `
      <button class="color-option" style="background-color: ${color}; border-color: ${color === '#ffffff' ? '#bdbdbd' : 'transparent'};" data-color="${color}" title="${color}"></button>
    `).join('');
  }

  attachEventListeners() {
    // Numbering menu toggle
    const numberingBtn = document.getElementById('btn-numbering');
    const numberingMenu = document.getElementById('numbering-menu');

    if (numberingBtn && numberingMenu) {
      numberingBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = numberingMenu.style.display !== 'none';
        document.querySelectorAll('.numbering-menu').forEach(m => m.style.display = 'none');
        if (!isOpen) numberingMenu.style.display = 'block';
      });

      // Heading styles
      numberingMenu.querySelectorAll('[data-heading]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const level = parseInt(btn.dataset.heading);
          this.editor.applyHeadingStyle(level);
          numberingMenu.style.display = 'none';
        });
      });

      // Numbering styles
      numberingMenu.querySelectorAll('[data-style]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const style = btn.dataset.style;

          // Track which numbering style was applied for user feedback
          const icon = btn.querySelector('.style-icon');
          const label = btn.textContent.trim();

          this.editor.applyNumberingStyle(style);

          // Visual feedback
          btn.style.background = 'rgba(124, 58, 237, 0.15)';
          btn.style.color = 'var(--violet)';
          setTimeout(() => {
            btn.style.background = '';
            btn.style.color = '';
          }, 300);

          numberingMenu.style.display = 'none';
        });
      });

      // Table of contents
      document.getElementById('btn-toc')?.addEventListener('click', (e) => {
        e.preventDefault();
        this.editor.insertTableOfContents();
        numberingMenu.style.display = 'none';
      });

      // Clear numbering
      document.getElementById('btn-clear-numbering')?.addEventListener('click', (e) => {
        e.preventDefault();
        this.editor.clearNumbering('all');
        numberingMenu.style.display = 'none';
      });
    }

    // Close numbering menu on click outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.toolbar-numbering-wrapper')) {
        document.querySelectorAll('.numbering-menu').forEach(m => m.style.display = 'none');
      }
    });

    // Undo/Redo
    document.getElementById('btn-undo')?.addEventListener('click', () => this.editor.undo());
    document.getElementById('btn-redo')?.addEventListener('click', () => this.editor.redo());

    // Text formatting
    document.getElementById('btn-bold')?.addEventListener('click', () => this.editor.toggleFormat('bold'));
    document.getElementById('btn-italic')?.addEventListener('click', () => this.editor.toggleFormat('italic'));
    document.getElementById('btn-underline')?.addEventListener('click', () => this.editor.toggleFormat('underline'));
    document.getElementById('btn-strikethrough')?.addEventListener('click', () => this.editor.toggleFormat('strikeThrough'));

    // Font controls
    document.getElementById('font-family')?.addEventListener('change', (e) => {
      if (e.target.value) this.editor.setFontFamily(e.target.value);
    });

    document.getElementById('font-size')?.addEventListener('change', (e) => {
      if (e.target.value) this.editor.setFontSize(e.target.value);
    });

    // Color pickers
    this.setupColorPicker('text-color', 'foreColor');
    this.setupColorPicker('highlight-color', 'backColor');

    // Alignment
    document.getElementById('btn-align-left')?.addEventListener('click', () => this.editor.setAlignment('left'));
    document.getElementById('btn-align-center')?.addEventListener('click', () => this.editor.setAlignment('center'));
    document.getElementById('btn-align-right')?.addEventListener('click', () => this.editor.setAlignment('right'));
    document.getElementById('btn-align-justify')?.addEventListener('click', () => this.editor.formatText('justifyFull'));

    // Lists
    document.getElementById('btn-list-ul')?.addEventListener('click', () => this.editor.insertList('unordered'));
    document.getElementById('btn-list-ol')?.addEventListener('click', () => this.editor.insertList('ordered'));
    document.getElementById('btn-indent')?.addEventListener('click', () => this.editor.formatText('indent'));
    document.getElementById('btn-outdent')?.addEventListener('click', () => this.editor.formatText('outdent'));

    // Advanced
    document.getElementById('btn-superscript')?.addEventListener('click', () => this.editor.setSuperscript());
    document.getElementById('btn-subscript')?.addEventListener('click', () => this.editor.setSubscript());
    document.getElementById('btn-link')?.addEventListener('click', () => this.editor.insertLink());
    document.getElementById('btn-image')?.addEventListener('click', () => this.editor.insertImage());
    document.getElementById('btn-table')?.addEventListener('click', () => {
      const rows = prompt('Número de linhas:', '3');
      const cols = prompt('Número de colunas:', '3');
      if (rows && cols) {
        this.editor.insertTable(parseInt(rows), parseInt(cols));
      }
    });
    document.getElementById('btn-footnote')?.addEventListener('click', () => this.editor.insertFootnote());
    document.getElementById('btn-clear')?.addEventListener('click', () => this.editor.clearFormatting());

    // Line height
    document.getElementById('line-height')?.addEventListener('change', (e) => {
      if (e.target.value) {
        const lineHeight = e.target.value;
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const commonAncestor = range.commonAncestorContainer;
          const parentElement = commonAncestor.nodeType === 3
            ? commonAncestor.parentElement
            : commonAncestor;
          if (parentElement) {
            parentElement.style.lineHeight = lineHeight;
          }
        }
      }
    });

    // Print
    document.getElementById('btn-print')?.addEventListener('click', () => this.editor.print());

    // Download HTML
    document.getElementById('btn-download-html')?.addEventListener('click', () => {
      const title = document.querySelector('.editor-title-input')?.value || 'document';
      const filename = `${title.toLowerCase().replace(/\s+/g, '-')}.html`;
      this.editor.downloadAsHTML(filename);
    });

    // Close color pickers on click outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.toolbar-color-wrapper')) {
        document.getElementById('text-color-picker').style.display = 'none';
        document.getElementById('highlight-color-picker').style.display = 'none';
      }
    });
  }

  setupColorPicker(baseName, command) {
    const btn = document.getElementById(`btn-${baseName}`);
    const picker = document.getElementById(`${baseName}-picker`);
    const input = document.getElementById(`${baseName}-input`);
    const indicator = document.getElementById(`${baseName}-indicator`);

    if (!btn || !picker || !input) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = picker.style.display !== 'none';
      document.querySelectorAll('.color-picker').forEach(p => p.style.display = 'none');
      if (!isOpen) picker.style.display = 'block';
    });

    picker.querySelectorAll('.color-option').forEach(option => {
      option.addEventListener('click', (e) => {
        e.preventDefault();
        const color = option.dataset.color;
        this.editor.formatText(command, color);
        indicator.style.backgroundColor = color;
        picker.style.display = 'none';
      });
    });

    input.addEventListener('change', (e) => {
      const color = e.target.value;
      this.editor.formatText(command, color);
      indicator.style.backgroundColor = color;
      picker.style.display = 'none';
    });
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = EditorToolbar;
}
