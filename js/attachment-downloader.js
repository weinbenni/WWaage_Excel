// Attachment Downloader - Trello Power-Up Feature
const APP_KEY = 'c9df6f6f1cd31f277375aa5dd43041c8';
const t = window.TrelloPowerUp.iframe({
  appKey: APP_KEY,
  appName: 'Weinhäupl Attachment Downloader'
});

// Advanced Debug Logger
class DebugLogger {
  constructor() {
    this.logs = [];
    this.enabled = false;
    this.startTime = Date.now();
    this.apiCalls = [];
    this.performance = {};
    this.stateSnapshots = [];
    this.maxLogs = 1000;

    // Check for debug mode in URL
    const urlParams = new URLSearchParams(window.location.search);
    this.enabled = urlParams.get('debug') === 'true';

    if (this.enabled) {
      this.log('DEBUG MODE ENABLED', 'system');
      this.initDebugPanel();
    }

    // Keyboard shortcut: Ctrl+Shift+D to toggle debug panel
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        this.toggleDebugPanel();
      }
    });
  }

  log(message, category = 'info', data = null) {
    const timestamp = Date.now() - this.startTime;
    const logEntry = {
      timestamp,
      time: new Date().toISOString(),
      category,
      message,
      data: data ? JSON.parse(JSON.stringify(data)) : null
    };

    this.logs.push(logEntry);

    // Limit log size
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    if (this.enabled) {
      const style = this.getCategoryStyle(category);
      console.log(
        `%c[${timestamp}ms] [${category.toUpperCase()}] ${message}`,
        style,
        data || ''
      );
      this.updateDebugPanel();
    }
  }

  getCategoryStyle(category) {
    const styles = {
      system: 'color: #F71635; font-weight: bold;',
      api: 'color: #17a2b8; font-weight: bold;',
      error: 'color: #dc3545; font-weight: bold;',
      warning: 'color: #ffc107; font-weight: bold;',
      success: 'color: #28a745; font-weight: bold;',
      performance: 'color: #8300E9; font-weight: bold;',
      info: 'color: #6c757d;'
    };
    return styles[category] || styles.info;
  }

  logAPI(method, url, status, duration, response = null) {
    const apiCall = {
      timestamp: Date.now() - this.startTime,
      method,
      url,
      status,
      duration,
      response: response ? JSON.parse(JSON.stringify(response)) : null
    };

    this.apiCalls.push(apiCall);
    this.log(`${method} ${url} - ${status} (${duration}ms)`, 'api', { status, duration });
  }

  trackPerformance(operation, duration) {
    if (!this.performance[operation]) {
      this.performance[operation] = {
        count: 0,
        totalTime: 0,
        avgTime: 0,
        minTime: Infinity,
        maxTime: 0
      };
    }

    const perf = this.performance[operation];
    perf.count++;
    perf.totalTime += duration;
    perf.avgTime = perf.totalTime / perf.count;
    perf.minTime = Math.min(perf.minTime, duration);
    perf.maxTime = Math.max(perf.maxTime, duration);

    this.log(`Performance: ${operation} completed in ${duration}ms`, 'performance', perf);
  }

  snapshot(label, state) {
    const snapshot = {
      timestamp: Date.now() - this.startTime,
      label,
      state: JSON.parse(JSON.stringify(state))
    };
    this.stateSnapshots.push(snapshot);
    this.log(`State snapshot: ${label}`, 'info', state);
  }

  initDebugPanel() {
    const panel = document.createElement('div');
    panel.id = 'debugPanel';
    panel.innerHTML = `
      <div class="debug-header">
        <h3>🐛 Debug Console</h3>
        <div class="debug-controls">
          <button id="debugClear" title="Clear logs">🗑️</button>
          <button id="debugExport" title="Export logs">💾</button>
          <button id="debugToggle" title="Minimize">➖</button>
        </div>
      </div>
      <div class="debug-tabs">
        <button class="debug-tab active" data-tab="logs">Logs</button>
        <button class="debug-tab" data-tab="api">API Calls</button>
        <button class="debug-tab" data-tab="performance">Performance</button>
        <button class="debug-tab" data-tab="state">State</button>
      </div>
      <div class="debug-content">
        <div id="debugLogs" class="debug-tab-content active"></div>
        <div id="debugAPI" class="debug-tab-content"></div>
        <div id="debugPerformance" class="debug-tab-content"></div>
        <div id="debugState" class="debug-tab-content"></div>
      </div>
    `;
    document.body.appendChild(panel);

    // Add CSS
    this.injectDebugStyles();

    // Event listeners
    document.getElementById('debugClear').addEventListener('click', () => this.clearLogs());
    document.getElementById('debugExport').addEventListener('click', () => this.exportLogs());
    document.getElementById('debugToggle').addEventListener('click', () => this.minimizePanel());

    // Tab switching
    document.querySelectorAll('.debug-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabName = e.target.dataset.tab;
        this.switchTab(tabName);
      });
    });
  }

  injectDebugStyles() {
    const style = document.createElement('style');
    style.textContent = `
      #debugPanel {
        position: fixed;
        bottom: 0;
        right: 0;
        width: 450px;
        max-height: 60vh;
        background: #1a1a1a;
        border: 2px solid #F71635;
        border-radius: 8px 0 0 0;
        color: #ffffff;
        font-family: 'Courier New', monospace;
        font-size: 11px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        box-shadow: 0 -4px 20px rgba(247, 22, 53, 0.3);
      }
      #debugPanel.minimized .debug-tabs,
      #debugPanel.minimized .debug-content {
        display: none;
      }
      .debug-header {
        background: #F71635;
        padding: 8px 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-radius: 6px 0 0 0;
      }
      .debug-header h3 {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
      }
      .debug-controls button {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 16px;
        margin-left: 8px;
        padding: 4px;
        opacity: 0.8;
        transition: opacity 0.2s;
      }
      .debug-controls button:hover {
        opacity: 1;
      }
      .debug-tabs {
        display: flex;
        background: #2a2a2a;
        border-bottom: 1px solid #444;
      }
      .debug-tab {
        flex: 1;
        background: none;
        border: none;
        color: #999;
        padding: 8px;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 11px;
      }
      .debug-tab:hover {
        background: #333;
        color: #fff;
      }
      .debug-tab.active {
        background: #1a1a1a;
        color: #F71635;
        border-bottom: 2px solid #F71635;
      }
      .debug-content {
        flex: 1;
        overflow-y: auto;
        padding: 8px;
        max-height: calc(60vh - 100px);
      }
      .debug-tab-content {
        display: none;
      }
      .debug-tab-content.active {
        display: block;
      }
      .debug-log-entry {
        padding: 4px 6px;
        margin: 2px 0;
        border-left: 3px solid;
        background: #222;
        font-size: 10px;
        line-height: 1.4;
      }
      .debug-log-entry.system { border-color: #F71635; }
      .debug-log-entry.api { border-color: #17a2b8; }
      .debug-log-entry.error { border-color: #dc3545; }
      .debug-log-entry.warning { border-color: #ffc107; }
      .debug-log-entry.success { border-color: #28a745; }
      .debug-log-entry.performance { border-color: #8300E9; }
      .debug-log-entry.info { border-color: #6c757d; }
      .debug-log-time {
        color: #666;
        font-size: 9px;
      }
      .debug-log-message {
        color: #fff;
      }
      .debug-log-data {
        color: #999;
        margin-top: 2px;
        font-size: 9px;
        max-height: 100px;
        overflow: auto;
      }
      .debug-metric {
        background: #222;
        padding: 8px;
        margin: 4px 0;
        border-radius: 4px;
      }
      .debug-metric-label {
        color: #F71635;
        font-weight: bold;
      }
      .debug-metric-value {
        color: #fff;
        margin-left: 8px;
      }
    `;
    document.head.appendChild(style);
  }

  updateDebugPanel() {
    if (!this.enabled) return;

    // Update logs tab
    const logsContainer = document.getElementById('debugLogs');
    if (logsContainer) {
      logsContainer.innerHTML = this.logs.slice(-100).reverse().map(log => `
        <div class="debug-log-entry ${log.category}">
          <div class="debug-log-time">[${log.timestamp}ms] ${log.time}</div>
          <div class="debug-log-message">${log.message}</div>
          ${log.data ? `<div class="debug-log-data">${JSON.stringify(log.data, null, 2)}</div>` : ''}
        </div>
      `).join('');
    }

    // Update API tab
    const apiContainer = document.getElementById('debugAPI');
    if (apiContainer) {
      apiContainer.innerHTML = this.apiCalls.slice(-50).reverse().map(call => `
        <div class="debug-log-entry api">
          <div class="debug-log-time">[${call.timestamp}ms]</div>
          <div class="debug-log-message">${call.method} ${call.url}</div>
          <div class="debug-log-data">Status: ${call.status} | Duration: ${call.duration}ms</div>
        </div>
      `).join('');
    }

    // Update performance tab
    const perfContainer = document.getElementById('debugPerformance');
    if (perfContainer) {
      perfContainer.innerHTML = Object.entries(this.performance).map(([op, perf]) => `
        <div class="debug-metric">
          <div class="debug-metric-label">${op}</div>
          <div class="debug-metric-value">
            Count: ${perf.count} |
            Avg: ${perf.avgTime.toFixed(2)}ms |
            Min: ${perf.minTime.toFixed(2)}ms |
            Max: ${perf.maxTime.toFixed(2)}ms
          </div>
        </div>
      `).join('');
    }

    // Update state tab
    const stateContainer = document.getElementById('debugState');
    if (stateContainer) {
      stateContainer.innerHTML = this.stateSnapshots.slice(-20).reverse().map(snap => `
        <div class="debug-metric">
          <div class="debug-metric-label">[${snap.timestamp}ms] ${snap.label}</div>
          <div class="debug-log-data">${JSON.stringify(snap.state, null, 2)}</div>
        </div>
      `).join('');
    }
  }

  switchTab(tabName) {
    // Update tabs
    document.querySelectorAll('.debug-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    // Update content
    const contentMap = {
      logs: 'debugLogs',
      api: 'debugAPI',
      performance: 'debugPerformance',
      state: 'debugState'
    };

    document.querySelectorAll('.debug-tab-content').forEach(content => {
      content.classList.remove('active');
    });

    const activeContent = document.getElementById(contentMap[tabName]);
    if (activeContent) {
      activeContent.classList.add('active');
    }
  }

  toggleDebugPanel() {
    if (!this.enabled) {
      this.enabled = true;
      this.log('Debug mode enabled via keyboard shortcut', 'system');
      this.initDebugPanel();
    } else {
      const panel = document.getElementById('debugPanel');
      if (panel) {
        panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
      }
    }
  }

  minimizePanel() {
    const panel = document.getElementById('debugPanel');
    if (panel) {
      panel.classList.toggle('minimized');
      const btn = document.getElementById('debugToggle');
      btn.textContent = panel.classList.contains('minimized') ? '➕' : '➖';
    }
  }

  clearLogs() {
    this.logs = [];
    this.apiCalls = [];
    this.stateSnapshots = [];
    this.updateDebugPanel();
    this.log('Logs cleared', 'system');
  }

  exportLogs() {
    const exportData = {
      timestamp: new Date().toISOString(),
      duration: Date.now() - this.startTime,
      logs: this.logs,
      apiCalls: this.apiCalls,
      performance: this.performance,
      stateSnapshots: this.stateSnapshots
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attachment-downloader-debug-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    this.log('Debug logs exported', 'success');
  }
}

// Global debug logger instance
const debugLogger = new DebugLogger();

class AttachmentDownloader {
  constructor() {
    this.t = t;
    this.source = null; // 'board' or 'card'
    this.boardId = null;
    this.cardId = null;
    this.lists = [];
    this.debug = debugLogger;
    this.init();
  }

  async init() {
    const startTime = performance.now();
    try {
      this.debug.log('Initializing Attachment Downloader', 'system');

      // Determine source from URL params
      const urlParams = new URLSearchParams(window.location.search);
      this.source = urlParams.get('source') || 'board';
      this.debug.log(`Source determined: ${this.source}`, 'info');

      // Get context
      const context = await this.t.getContext();
      this.boardId = context.board;
      this.cardId = context.card;
      this.debug.snapshot('Initial Context', { boardId: this.boardId, cardId: this.cardId, source: this.source });

      // Update UI based on source
      this.updateUIForSource();

      // Load lists if from board
      if (this.source === 'board') {
        await this.loadLists();
      }

      // Set up event listeners
      this.setupEventListeners();

      const duration = performance.now() - startTime;
      this.debug.trackPerformance('init', duration);
      this.debug.log('Initialization complete', 'success');
    } catch (error) {
      console.error('Initialization error:', error);
      this.debug.log(`Initialization failed: ${error.message}`, 'error', error);
      this.showStatus('Failed to initialize downloader', 'error');
    }
  }

  updateUIForSource() {
    const sourceDescription = document.getElementById('sourceDescription');
    const sourceSelection = document.getElementById('sourceSelection');

    if (this.source === 'card') {
      sourceDescription.textContent = 'Download all attachments from this card';
      sourceSelection.style.display = 'none';
    } else {
      sourceDescription.textContent = 'Select cards to download attachments from';
      sourceSelection.style.display = 'block';
    }
  }

  async loadLists() {
    const startTime = performance.now();
    try {
      this.debug.log('Loading board lists', 'info');
      const token = await this.t.getRestApi().getToken();
      const url = `https://api.trello.com/1/boards/${this.boardId}/lists?key=${APP_KEY}&token=${token}`;

      const apiStart = performance.now();
      const response = await fetch(url);
      const apiDuration = performance.now() - apiStart;

      if (!response.ok) {
        this.debug.logAPI('GET', url, response.status, apiDuration);
        throw new Error('Failed to load lists');
      }

      this.lists = await response.json();
      this.debug.logAPI('GET', url, response.status, apiDuration, { count: this.lists.length });
      this.debug.log(`Loaded ${this.lists.length} lists`, 'success');

      this.populateListSelector();

      const duration = performance.now() - startTime;
      this.debug.trackPerformance('loadLists', duration);
    } catch (error) {
      console.error('Error loading lists:', error);
      this.debug.log(`Failed to load lists: ${error.message}`, 'error', error);
      this.showStatus('Failed to load board lists', 'error');
    }
  }

  populateListSelector() {
    const listSelect = document.getElementById('listSelect');

    // Clear existing options except "Entire Board"
    listSelect.innerHTML = '<option value="all">Entire Board</option>';

    // Add list options
    this.lists.forEach(list => {
      const option = document.createElement('option');
      option.value = list.id;
      option.textContent = list.name;
      listSelect.appendChild(option);
    });
  }

  setupEventListeners() {
    const downloadBtn = document.getElementById('downloadBtn');
    downloadBtn.addEventListener('click', () => this.handleDownload());

    // Debug toggle button
    const debugToggleBtn = document.getElementById('debugToggleBtn');
    if (debugToggleBtn) {
      debugToggleBtn.addEventListener('click', () => {
        this.debug.toggleDebugPanel();
        debugToggleBtn.classList.toggle('active', this.debug.enabled);
      });

      // Set initial state
      if (this.debug.enabled) {
        debugToggleBtn.classList.add('active');
      }
    }
  }

  async handleDownload() {
    const downloadStartTime = performance.now();
    const downloadBtn = document.getElementById('downloadBtn');
    const progressSection = document.getElementById('progressSection');
    const statusSection = document.getElementById('statusSection');

    this.debug.log('=== DOWNLOAD STARTED ===', 'system');
    this.debug.snapshot('Download Start', { source: this.source, boardId: this.boardId, cardId: this.cardId });

    // Reset UI
    statusSection.innerHTML = '';
    downloadBtn.disabled = true;

    try {
      // Show progress
      progressSection.style.display = 'block';
      this.updateProgress(0, 'Fetching cards...');

      // Get cards based on source
      let cards = [];
      if (this.source === 'card') {
        cards = await this.getCardsFromCard();
      } else {
        cards = await this.getCardsFromBoard();
      }

      this.debug.log(`Retrieved ${cards.length} cards`, 'info', { cardIds: cards.map(c => c.id) });

      if (cards.length === 0) {
        this.debug.log('No cards found', 'warning');
        this.showStatus('No cards found', 'warning');
        downloadBtn.disabled = false;
        progressSection.style.display = 'none';
        return;
      }

      this.updateProgress(20, `Found ${cards.length} card(s). Fetching attachments...`);

      // Fetch all attachments
      const cardsWithAttachments = await this.fetchAttachmentsForCards(cards);

      // Filter cards that have attachments
      const cardsToDownload = cardsWithAttachments.filter(card =>
        card.attachments && card.attachments.length > 0
      );

      this.debug.log(`${cardsToDownload.length} cards have attachments`, 'info');

      if (cardsToDownload.length === 0) {
        this.debug.log('No attachments found', 'warning');
        this.showStatus('No attachments found in selected cards', 'info');
        downloadBtn.disabled = false;
        progressSection.style.display = 'none';
        return;
      }

      const totalAttachments = cardsToDownload.reduce(
        (sum, card) => sum + card.attachments.length,
        0
      );

      this.debug.log(`Total attachments to download: ${totalAttachments}`, 'info');
      this.debug.snapshot('Pre-Download State', {
        cardsToDownload: cardsToDownload.length,
        totalAttachments,
        cards: cardsToDownload.map(c => ({ name: c.name, attachments: c.attachments.length }))
      });

      this.updateProgress(40, `Found ${totalAttachments} attachment(s). Preparing download...`);

      // Prepare attachment metadata for backend
      const attachmentList = [];
      for (const card of cardsToDownload) {
        for (const attachment of card.attachments) {
          attachmentList.push({
            id: attachment.id,
            cardId: card.id,
            cardName: card.name,
            name: attachment.name,
            fileName: attachment.fileName || attachment.name,
            url: attachment.url,
            isUpload: attachment.isUpload || false,
            bytes: attachment.bytes || 0
          });
        }
      }

      this.debug.log('Prepared attachment list for backend', 'info', { count: attachmentList.length });
      this.debug.snapshot('Attachment List', { attachments: attachmentList.slice(0, 5) }); // Sample first 5

      // Get Trello token for backend authentication
      const token = await this.t.getRestApi().getToken();
      if (!token) {
        throw new Error('Failed to get Trello authentication token');
      }

      this.updateProgress(50, 'Sending request to server...');

      // Call backend serverless function
      const backendUrl = this.getBackendUrl();
      this.debug.log(`Calling backend: ${backendUrl}`, 'info');

      const backendStartTime = performance.now();
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          attachments: attachmentList,
          token: token
        })
      });

      const backendDuration = performance.now() - backendStartTime;
      this.debug.logAPI('POST', backendUrl, response.status, backendDuration);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Backend error: ${response.status} - ${errorText}`);
      }

      this.updateProgress(70, 'Receiving ZIP file from server...');
      this.debug.log('Backend request successful, receiving ZIP...', 'success');

      // Get the ZIP blob from response
      const zipBlob = await response.blob();
      const zipSize = (zipBlob.size / 1024 / 1024).toFixed(2);
      this.debug.log(`ZIP file received: ${zipSize} MB`, 'success');

      // Download ZIP
      const zipFileName = this.source === 'card'
        ? `${this.sanitizeFileName(cardsToDownload[0].name)}_attachments.zip`
        : `Trello_Board_Attachments_${new Date().toISOString().split('T')[0]}.zip`;

      this.updateProgress(95, 'Saving file...');
      saveAs(zipBlob, zipFileName);

      // Success
      this.updateProgress(100, 'Download complete!');
      const totalDuration = performance.now() - downloadStartTime;
      this.debug.trackPerformance('fullDownload', totalDuration);

      this.debug.log('=== DOWNLOAD COMPLETE ===', 'system', {
        totalCards: cardsToDownload.length,
        totalAttachments,
        zipSize: `${zipSize} MB`,
        duration: `${(totalDuration / 1000).toFixed(2)}s`,
        method: 'backend'
      });

      this.showStatus(
        `✅ Successfully downloaded ${totalAttachments} attachments from ${cardsToDownload.length} card(s) (${zipSize} MB)`,
        'success'
      );
      this.showStatus(
        `Check DOWNLOAD_SUMMARY.txt inside the ZIP for details`,
        'info'
      );

      setTimeout(() => {
        progressSection.style.display = 'none';
      }, 3000);

    } catch (error) {
      console.error('Download error:', error);
      this.debug.log(`DOWNLOAD FAILED: ${error.message}`, 'error', error);
      this.showStatus(`Error: ${error.message}`, 'error');
      progressSection.style.display = 'none';
    } finally {
      downloadBtn.disabled = false;
    }
  }

  async getCardsFromCard() {
    const startTime = performance.now();
    try {
      this.debug.log(`Fetching single card: ${this.cardId}`, 'info');
      const token = await this.t.getRestApi().getToken();
      const url = `https://api.trello.com/1/cards/${this.cardId}?key=${APP_KEY}&token=${token}`;

      const apiStart = performance.now();
      const response = await fetch(url);
      const apiDuration = performance.now() - apiStart;

      if (!response.ok) {
        this.debug.logAPI('GET', url, response.status, apiDuration);
        throw new Error('Failed to fetch card');
      }

      const card = await response.json();
      this.debug.logAPI('GET', url, response.status, apiDuration, { cardName: card.name });
      this.debug.log(`Card fetched: ${card.name}`, 'success');

      const duration = performance.now() - startTime;
      this.debug.trackPerformance('getCardsFromCard', duration);
      return [card];
    } catch (error) {
      console.error('Error fetching card:', error);
      this.debug.log(`Failed to fetch card: ${error.message}`, 'error', error);
      throw error;
    }
  }

  async getCardsFromBoard() {
    const startTime = performance.now();
    try {
      const listSelect = document.getElementById('listSelect');
      const selectedListId = listSelect.value;

      this.debug.log(`Fetching cards from ${selectedListId === 'all' ? 'entire board' : 'list ' + selectedListId}`, 'info');

      const token = await this.t.getRestApi().getToken();
      let url;

      if (selectedListId === 'all') {
        // Get all cards from board
        url = `https://api.trello.com/1/boards/${this.boardId}/cards?key=${APP_KEY}&token=${token}`;
      } else {
        // Get cards from specific list
        url = `https://api.trello.com/1/lists/${selectedListId}/cards?key=${APP_KEY}&token=${token}`;
      }

      const apiStart = performance.now();
      const response = await fetch(url);
      const apiDuration = performance.now() - apiStart;

      if (!response.ok) {
        this.debug.logAPI('GET', url, response.status, apiDuration);
        throw new Error('Failed to fetch cards');
      }

      const cards = await response.json();
      this.debug.logAPI('GET', url, response.status, apiDuration, { count: cards.length });
      this.debug.log(`Fetched ${cards.length} cards`, 'success');

      const duration = performance.now() - startTime;
      this.debug.trackPerformance('getCardsFromBoard', duration);
      return cards;
    } catch (error) {
      console.error('Error fetching cards:', error);
      this.debug.log(`Failed to fetch cards: ${error.message}`, 'error', error);
      throw error;
    }
  }

  async fetchAttachmentsForCards(cards) {
    const startTime = performance.now();
    this.debug.log(`Fetching attachments for ${cards.length} cards`, 'info');

    const token = await this.t.getRestApi().getToken();

    const cardsWithAttachments = await Promise.all(
      cards.map(async (card) => {
        try {
          const url = `https://api.trello.com/1/cards/${card.id}/attachments?key=${APP_KEY}&token=${token}`;
          const apiStart = performance.now();
          const response = await fetch(url);
          const apiDuration = performance.now() - apiStart;

          if (!response.ok) {
            console.error(`Failed to fetch attachments for card ${card.id}`);
            this.debug.logAPI('GET', url, response.status, apiDuration);
            this.debug.log(`No attachments for card: ${card.name}`, 'warning');
            return { ...card, attachments: [] };
          }

          const attachments = await response.json();
          this.debug.logAPI('GET', url, response.status, apiDuration, { count: attachments.length });
          this.debug.log(`Card "${card.name}": ${attachments.length} attachment(s)`, 'info', {
            attachments: attachments.map(a => ({ name: a.name, isUpload: a.isUpload, bytes: a.bytes }))
          });
          return { ...card, attachments };
        } catch (error) {
          console.error(`Error fetching attachments for card ${card.id}:`, error);
          this.debug.log(`Error fetching attachments for card ${card.name}: ${error.message}`, 'error', error);
          return { ...card, attachments: [] };
        }
      })
    );

    const duration = performance.now() - startTime;
    this.debug.trackPerformance('fetchAttachmentsForCards', duration);

    const totalAttachments = cardsWithAttachments.reduce((sum, c) => sum + c.attachments.length, 0);
    this.debug.log(`Fetched ${totalAttachments} total attachments from ${cards.length} cards`, 'success');

    return cardsWithAttachments;
  }

  async downloadAttachment(url, attachmentInfo = null) {
    const startTime = performance.now();
    try {
      this.debug.log(`Attempting to download from: ${url}`, 'info', attachmentInfo);

      let blob = null;
      let response = null;

      // Detect if this is an external URL or Trello-hosted attachment
      const isTrelloUpload = attachmentInfo?.isUpload === true;
      const isTrelloHosted = url.includes('trello.com') || url.includes('trello-attachments') || isTrelloUpload;
      const isExternalUrl = !isTrelloHosted;

      this.debug.log(`Attachment type: ${isExternalUrl ? 'External Link' : (isTrelloUpload ? 'Trello Upload' : 'Trello-hosted')}`, 'info');

      // Strategy 1: External URLs - try direct download
      if (isExternalUrl) {
        try {
          response = await fetch(url, {
            mode: 'cors',
            credentials: 'omit'
          });

          if (response.ok) {
            blob = await response.blob();
            this.debug.log('Strategy 1 (external URL) succeeded', 'success');
          }
        } catch (e) {
          this.debug.log(`Strategy 1 failed: ${e.message}`, 'warning');
        }
      }

      // Strategy 2: For Trello attachments, use Trello REST API with proper authentication
      if (!blob && isTrelloHosted && attachmentInfo) {
        try {
          const token = await this.t.getRestApi().getToken();

          // Use Trello's REST API to fetch attachment data
          const apiUrl = `https://api.trello.com/1/cards/${attachmentInfo.cardId}/attachments/${attachmentInfo.id}`;

          this.debug.log('Fetching attachment metadata from API', 'info');
          const metaResponse = await fetch(`${apiUrl}?key=${APP_KEY}&token=${token}`);

          if (metaResponse.ok) {
            const attachmentMeta = await metaResponse.json();
            this.debug.log('Attachment metadata received', 'info', attachmentMeta);

            // Try to download from the url in metadata
            const downloadUrl = attachmentMeta.url;

            // Check if URL is a direct link (some attachments have public URLs)
            if (downloadUrl && !downloadUrl.includes('/download/')) {
              try {
                response = await fetch(downloadUrl, {
                  mode: 'cors',
                  credentials: 'omit'
                });

                if (response.ok) {
                  blob = await response.blob();
                  this.debug.log('Strategy 2a (public URL from metadata) succeeded', 'success');
                }
              } catch (e) {
                this.debug.log(`Strategy 2a failed: ${e.message}`, 'warning');
              }
            }

            // Try authenticated download URL
            if (!blob && downloadUrl) {
              try {
                const separator = downloadUrl.includes('?') ? '&' : '?';
                const authUrl = `${downloadUrl}${separator}key=${APP_KEY}&token=${token}`;

                response = await fetch(authUrl);

                if (response.ok) {
                  blob = await response.blob();
                  this.debug.log('Strategy 2b (authenticated URL) succeeded', 'success');
                }
              } catch (e) {
                this.debug.log(`Strategy 2b failed: ${e.message}`, 'warning');
              }
            }
          }
        } catch (e) {
          this.debug.log(`Strategy 2 (API metadata) failed: ${e.message}`, 'warning');
        }
      }

      // Strategy 3: Try original URL with no-cors (for compatibility)
      if (!blob) {
        try {
          response = await fetch(url, {
            mode: 'no-cors',
            credentials: 'omit'
          });

          blob = await response.blob();

          if (blob.size === 0) {
            this.debug.log('Strategy 3 (no-cors) returned empty blob', 'warning');
            blob = null;
          } else {
            this.debug.log('Strategy 3 (no-cors) succeeded', 'success');
          }
        } catch (e) {
          this.debug.log(`Strategy 3 failed: ${e.message}`, 'warning');
        }
      }

      // Strategy 4: Try using XMLHttpRequest with credentials (sometimes better than fetch)
      if (!blob && attachmentInfo) {
        try {
          const token = await this.t.getRestApi().getToken();
          const xhrUrl = `${url}${url.includes('?') ? '&' : '?'}key=${APP_KEY}&token=${token}`;

          blob = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', xhrUrl, true);
            xhr.responseType = 'blob';
            xhr.withCredentials = false;

            xhr.onload = function() {
              if (xhr.status === 200 && xhr.response && xhr.response.size > 0) {
                resolve(xhr.response);
              } else {
                reject(new Error(`XHR failed with status ${xhr.status}`));
              }
            };

            xhr.onerror = function() {
              reject(new Error('XHR network error'));
            };

            xhr.send();
          });

          this.debug.log('Strategy 4 (XMLHttpRequest) succeeded', 'success');
        } catch (e) {
          this.debug.log(`Strategy 4 failed: ${e.message}`, 'warning');
          blob = null;
        }
      }

      // Strategy 5: Try using Trello's iframe proxy capability
      if (!blob && attachmentInfo) {
        try {
          // Some Trello attachments can be accessed via a proxy method
          const token = await this.t.getRestApi().getToken();

          // Build proper API URL
          const proxyUrl = `https://api.trello.com/1/cards/${attachmentInfo.cardId}/attachments/${attachmentInfo.id}/download/${attachmentInfo.name}?key=${APP_KEY}&token=${token}`;

          response = await fetch(proxyUrl, {
            credentials: 'include',
            redirect: 'follow'
          });

          if (response.ok) {
            blob = await response.blob();
            this.debug.log('Strategy 5 (API proxy) succeeded', 'success');
          }
        } catch (e) {
          this.debug.log(`Strategy 5 failed: ${e.message}`, 'warning');
        }
      }

      if (!blob || blob.size === 0) {
        const duration = performance.now() - startTime;
        this.debug.logAPI('GET', url, response?.status || 0, duration);
        throw new Error('All download strategies failed - likely CORS restriction. Trello may block downloads from this origin.');
      }

      const duration = performance.now() - startTime;
      const sizeKB = (blob.size / 1024).toFixed(2);
      this.debug.logAPI('GET', url, response?.status || 200, duration, { size: `${sizeKB} KB` });
      this.debug.trackPerformance('downloadAttachment', duration);

      return blob;
    } catch (error) {
      console.error('Error downloading attachment:', error);
      this.debug.log(`Failed to download attachment: ${error.message}`, 'error', error);
      throw error;
    }
  }

  getBackendUrl() {
    // Determine backend URL based on environment
    const hostname = window.location.hostname;

    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3000/api/download-attachments';
    }

    // Production on Vercel or GitHub Pages
    // If deployed to Vercel, use Vercel domain
    // If on GitHub Pages, use Vercel deployment URL
    if (hostname.includes('vercel.app')) {
      return `https://${hostname}/api/download-attachments`;
    }

    // Default: GitHub Pages deployment with separate Vercel backend
    // You'll need to set this to your Vercel deployment URL
    return 'https://YOUR_VERCEL_DEPLOYMENT_URL/api/download-attachments';
  }

  generateFailedDownloadsReadme(failedAttachments) {
    let content = '# Failed Downloads\n\n';
    content += `The following ${failedAttachments.length} attachment(s) could not be downloaded automatically due to CORS restrictions.\n`;
    content += 'You can download them manually using the links below:\n\n';
    content += '---\n\n';

    failedAttachments.forEach((item, index) => {
      content += `${index + 1}. ${item.name}\n`;
      content += `   Card: ${item.cardName}\n`;
      content += `   URL: ${item.url}\n`;
      content += `   Error: ${item.error}\n\n`;
    });

    content += '---\n\n';
    content += 'CORS Information:\n';
    content += 'Trello restricts direct file downloads from external domains for security.\n';
    content += 'To download these files:\n';
    content += '1. Click the URL links above (they will open in your browser)\n';
    content += '2. Your browser will handle the authentication and download\n';
    content += '3. Or access them directly from the Trello cards\n';

    return content;
  }

  sanitizeFileName(fileName) {
    // Remove or replace invalid characters for file/folder names
    return fileName
      .replace(/[<>:"/\\|?*]/g, '_') // Replace invalid chars with underscore
      .replace(/\s+/g, '_')           // Replace spaces with underscore
      .replace(/_{2,}/g, '_')         // Replace multiple underscores with single
      .substring(0, 200);             // Limit length
  }

  updateProgress(percentage, text) {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    progressFill.style.width = `${percentage}%`;
    progressText.textContent = text;
  }

  showStatus(message, type = 'info') {
    const statusSection = document.getElementById('statusSection');

    const statusMessage = document.createElement('p');
    statusMessage.className = type;
    statusMessage.textContent = message;

    statusSection.appendChild(statusMessage);
  }
}

// Initialize downloader when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new AttachmentDownloader();
});
