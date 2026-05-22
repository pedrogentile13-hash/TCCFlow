/**
 * Help & Guide Modal Component
 * Comprehensive guide with searchable keyboard shortcuts and feature documentation
 */

class HelpGuide {
  constructor(triggerId = 'help-trigger') {
    this.triggerId = triggerId;
    this.searchQuery = '';
    this.currentTab = 'shortcuts';
    this.init();
  }

  init() {
    this.render();
    this.attachEventListeners();
  }

  render() {
    const html = `
      <div class="help-modal-overlay" id="help-modal-overlay" style="display: none;">
        <div class="help-modal">
          <div class="help-modal-header">
            <h2>Guia de Atalhos e Recursos</h2>
            <button class="help-modal-close" id="help-modal-close" title="Fechar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="help-modal-body">
            <div class="help-search-container">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input
                type="text"
                id="help-search"
                class="help-search-input"
                placeholder="Buscar atalhos ou recursos..."
                autocomplete="off"
              />
            </div>

            <div class="help-tabs">
              <button class="help-tab-btn active" data-tab="shortcuts" title="Atalhos de teclado">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="3" x2="9" y2="21"></line>
                </svg>
                Atalhos
              </button>
              <button class="help-tab-btn" data-tab="features" title="Recursos disponíveis">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2v20M2 12h20"></path>
                  <circle cx="12" cy="12" r="10"></circle>
                </svg>
                Recursos
              </button>
              <button class="help-tab-btn" data-tab="citations" title="Sistema de citações">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 21c0 0 7-1 11-6s6-11 6-11-4 1-9 6C4 20 3 21 3 21"></path>
                  <path d="M15 6h.01"></path>
                </svg>
                Citações
              </button>
              <button class="help-tab-btn" data-tab="tips" title="Dicas e truques">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                Dicas
              </button>
            </div>

            <div class="help-content">
              <!-- Shortcuts Tab -->
              <div class="help-tab-content" id="shortcuts-tab" data-tab="shortcuts">
                <div class="shortcuts-container" id="shortcuts-container">
                  ${this.renderShortcuts()}
                </div>
              </div>

              <!-- Features Tab -->
              <div class="help-tab-content" id="features-tab" data-tab="features" style="display: none;">
                <div class="features-container">
                  ${this.renderFeatures()}
                </div>
              </div>

              <!-- Citations Tab -->
              <div class="help-tab-content" id="citations-tab" data-tab="citations" style="display: none;">
                <div class="citations-guide">
                  ${this.renderCitationsGuide()}
                </div>
              </div>

              <!-- Tips Tab -->
              <div class="help-tab-content" id="tips-tab" data-tab="tips" style="display: none;">
                <div class="tips-container">
                  ${this.renderTips()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Create a container for the modal if it doesn't exist
    if (!document.getElementById('help-modal-overlay')) {
      const container = document.createElement('div');
      container.innerHTML = html;
      document.body.appendChild(container.firstChild);
    }
  }

  renderShortcuts() {
    const shortcuts = {
      'Formatação de Texto': [
        { keys: 'Ctrl+B', action: 'Negrito', icon: '𝐁' },
        { keys: 'Ctrl+I', action: 'Itálico', icon: '𝑰' },
        { keys: 'Ctrl+U', action: 'Sublinhado', icon: '𝐔̲' },
        { keys: 'Ctrl+Shift+M', action: 'Limpar formatação', icon: '✕' },
      ],
      'Títulos e Numeração': [
        { keys: 'Ctrl+Alt+1', action: 'Título 1', icon: 'H₁' },
        { keys: 'Ctrl+Alt+2', action: 'Título 2', icon: 'H₂' },
        { keys: 'Ctrl+Alt+3', action: 'Título 3', icon: 'H₃' },
        { keys: 'Ctrl+Alt+4', action: 'Título 4', icon: 'H₄' },
        { keys: 'Ctrl+Shift+7', action: 'Lista numerada', icon: '①②③' },
        { keys: 'Ctrl+Shift+8', action: 'Lista com marcadores', icon: '•••' },
      ],
      'Citações e Notas': [
        { keys: 'Ctrl+Shift+C', action: 'Inserir citação', icon: '¹²³' },
        { keys: 'Ctrl+Alt+F', action: 'Inserir nota de rodapé', icon: '†' },
      ],
      'Desfazer/Refazer': [
        { keys: 'Ctrl+Z', action: 'Desfazer', icon: '↶' },
        { keys: 'Ctrl+Y', action: 'Refazer', icon: '↷' },
        { keys: 'Ctrl+Shift+Z', action: 'Refazer alternativo', icon: '↷' },
      ],
      'Links e Mídia': [
        { keys: 'Ctrl+Shift+K', action: 'Inserir link', icon: '🔗' },
      ],
    };

    let html = '';
    for (const category in shortcuts) {
      html += `
        <div class="shortcuts-category">
          <h3 class="shortcuts-category-title">${category}</h3>
          <div class="shortcuts-list">
      `;
      shortcuts[category].forEach(shortcut => {
        html += `
          <div class="shortcut-item">
            <div class="shortcut-keys">
              <kbd>${shortcut.keys.replace(/\+/g, '</kbd> + <kbd>')}</kbd>
            </div>
            <div class="shortcut-action">${shortcut.action}</div>
          </div>
        `;
      });
      html += `
          </div>
        </div>
      `;
    }
    return html;
  }

  renderFeatures() {
    return `
      <div class="features-list">
        <div class="feature-item">
          <div class="feature-icon">📝</div>
          <div class="feature-content">
            <h4>Formatação Rich Text</h4>
            <p>Negrito, itálico, sublinhado e muito mais. Use os atalhos ou a barra de ferramentas.</p>
          </div>
        </div>

        <div class="feature-item">
          <div class="feature-icon">📚</div>
          <div class="feature-content">
            <h4>Títulos e Índice</h4>
            <p>Crie títulos automáticos com numeração hierárquica e gere um índice navegável.</p>
          </div>
        </div>

        <div class="feature-item">
          <div class="feature-icon">①</div>
          <div class="feature-content">
            <h4>Listas Numeradas</h4>
            <p>Suporte para números, letras, romanos e hierarquias customizadas.</p>
          </div>
        </div>

        <div class="feature-item">
          <div class="feature-icon">¹²³</div>
          <div class="feature-content">
            <h4>Sistema de Citações</h4>
            <p>Insira citações automáticas com superscript e notas de rodapé automáticas.</p>
          </div>
        </div>

        <div class="feature-item">
          <div class="feature-icon">🎨</div>
          <div class="feature-content">
            <h4>Cores e Estilos</h4>
            <p>Customize cores de texto e fundo com seletor visual de cores.</p>
          </div>
        </div>

        <div class="feature-item">
          <div class="feature-icon">💾</div>
          <div class="feature-content">
            <h4>Auto-salvamento</h4>
            <p>Seu conteúdo é salvo automaticamente a cada 30 segundos no navegador.</p>
          </div>
        </div>

        <div class="feature-item">
          <div class="feature-icon">📥</div>
          <div class="feature-content">
            <h4>Importação/Exportação</h4>
            <p>Exporte seu documento como HTML ou texto plano. Imprima com um clique.</p>
          </div>
        </div>

        <div class="feature-item">
          <div class="feature-icon">📊</div>
          <div class="feature-content">
            <h4>Estatísticas</h4>
            <p>Contagem de palavras, caracteres e tempo de leitura estimado.</p>
          </div>
        </div>
      </div>
    `;
  }

  renderCitationsGuide() {
    return `
      <div class="guide-section">
        <h3>Como Usar o Sistema de Citações</h3>
        <ol class="guide-steps">
          <li>
            <strong>Selecione o texto:</strong> Clique e arraste para selecionar o texto que deseja citar
          </li>
          <li>
            <strong>Insira a citação:</strong> Pressione <kbd>Ctrl+Shift+C</kbd> ou clique no botão de citação
          </li>
          <li>
            <strong>Superscript aparece:</strong> Um número superscrito será adicionado ao texto (ex: ¹)
          </li>
          <li>
            <strong>Edite a nota:</strong> Role até o final e edite o texto da citação
          </li>
          <li>
            <strong>Auto-numeração:</strong> Se deletar uma citação, as outras são renumeradas automaticamente
          </li>
        </ol>

        <div class="guide-preview">
          <h4>Exemplo:</h4>
          <div class="preview-box">
            <p>
              Este é um exemplo de texto com uma citação<sup class="example-citation">1</sup>.
            </p>
            <div class="preview-footnotes">
              <div class="preview-footnote-divider"></div>
              <div class="preview-footnote">
                <sup>1</sup> Smith, John. "Example Citation." Journal of Examples, 2024.
              </div>
            </div>
          </div>
        </div>

        <div class="guide-features">
          <h4>Recursos das Citações:</h4>
          <ul>
            <li>Superscript clicável que leva até a nota de rodapé</li>
            <li>Cor azul para fácil identificação</li>
            <li>Auto-renumeração ao deletar citações</li>
            <li>Salvo no localStorage junto com o documento</li>
            <li>Exportação com citações incluídas</li>
          </ul>
        </div>
      </div>
    `;
  }

  renderTips() {
    return `
      <div class="tips-list">
        <div class="tip-item">
          <span class="tip-icon">💡</span>
          <div class="tip-content">
            <h4>Dica 1: Atalhos Rápidos</h4>
            <p>Aprenda os atalhos de teclado mais usados para aumentar sua produtividade significativamente.</p>
          </div>
        </div>

        <div class="tip-item">
          <span class="tip-icon">🎯</span>
          <div class="tip-content">
            <h4>Dica 2: Painel de Numeração</h4>
            <p>Use o painel de numeração (Ctrl+Shift+N) para visualizar todos os estilos disponíveis de uma vez.</p>
          </div>
        </div>

        <div class="tip-item">
          <span class="tip-icon">📌</span>
          <div class="tip-content">
            <h4>Dica 3: Títulos Estruturados</h4>
            <p>Sempre use títulos para estruturar seu documento - assim pode gerar um índice automático depois.</p>
          </div>
        </div>

        <div class="tip-item">
          <span class="tip-icon">🔗</span>
          <div class="tip-content">
            <h4>Dica 4: Links Internos</h4>
            <p>Os títulos recebem IDs automáticos, permitindo links internos via índice.</p>
          </div>
        </div>

        <div class="tip-item">
          <span class="tip-icon">💾</span>
          <div class="tip-content">
            <h4>Dica 5: Auto-salvamento</h4>
            <p>O editor salva automaticamente. Você pode fechar com segurança sem perder seu trabalho.</p>
          </div>
        </div>

        <div class="tip-item">
          <span class="tip-icon">⌨️</span>
          <div class="tip-content">
            <h4>Dica 6: Copiar Formatação</h4>
            <p>Use Ctrl+Shift+M para limpar toda a formatação de um texto selecionado.</p>
          </div>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    // Trigger button to open modal
    const trigger = document.getElementById(this.triggerId);
    if (trigger) {
      trigger.addEventListener('click', () => this.open());
    }

    // Close modal
    const closeBtn = document.getElementById('help-modal-close');
    const overlay = document.getElementById('help-modal-overlay');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) this.close();
      });
    }

    // Tab switching
    document.querySelectorAll('.help-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = btn.dataset.tab;
        this.switchTab(tab);
      });
    });

    // Search functionality
    const searchInput = document.getElementById('help-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.search(e.target.value);
      });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay && overlay.style.display !== 'none') {
        this.close();
      }
    });
  }

  switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.help-tab-content').forEach(tab => {
      tab.style.display = 'none';
    });

    // Remove active from all buttons
    document.querySelectorAll('.help-tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });

    // Show selected tab
    const selectedTab = document.getElementById(`${tabName}-tab`);
    if (selectedTab) {
      selectedTab.style.display = 'block';
    }

    // Add active to selected button
    const selectedBtn = document.querySelector(`[data-tab="${tabName}"]`);
    if (selectedBtn) {
      selectedBtn.classList.add('active');
    }

    this.currentTab = tabName;
  }

  search(query) {
    this.searchQuery = query.toLowerCase();

    if (this.currentTab === 'shortcuts') {
      this.filterShortcuts();
    }
  }

  filterShortcuts() {
    const items = document.querySelectorAll('.shortcut-item');
    items.forEach(item => {
      const text = item.textContent.toLowerCase();
      if (text.includes(this.searchQuery)) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });

    // Hide empty categories
    document.querySelectorAll('.shortcuts-category').forEach(category => {
      const visibleItems = Array.from(category.querySelectorAll('.shortcut-item'))
        .filter(item => item.style.display !== 'none');
      category.style.display = visibleItems.length > 0 ? 'block' : 'none';
    });
  }

  open() {
    const overlay = document.getElementById('help-modal-overlay');
    if (overlay) {
      overlay.style.display = 'flex';
    }
  }

  close() {
    const overlay = document.getElementById('help-modal-overlay');
    if (overlay) {
      overlay.style.display = 'none';
    }
  }

  toggle() {
    const overlay = document.getElementById('help-modal-overlay');
    if (overlay) {
      overlay.style.display = overlay.style.display === 'none' ? 'flex' : 'none';
    }
  }
}

// Export for use in both modules and scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HelpGuide;
}
