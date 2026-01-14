// Main application logic for Excel to Cards Importer
class ExcelToCardsImporter {
  constructor() {
    // Initialize with appKey and appName for REST API access
    this.t = window.TrelloPowerUp.iframe({
      appKey: 'c9df6f6f1cd31f277375aa5dd43041c8',
      appName: 'Excel to Cards Importer'
    });
    this.excelData = null;
    this.columns = [];
    this.fieldMappings = {
      cardName: '',
      description: '',
      location: '',
      dueDate: '',
      labels: '',
      members: ''
    };
    
    this.availableFields = [
      { id: 'cardName', label: 'Card Name', required: true, description: 'Main title of the card (required)' },
      { id: 'description', label: 'Description', required: false, description: 'Detailed card description' },
      { id: 'location', label: 'Location', required: false, description: 'Location or place information' },
      { id: 'dueDate', label: 'Due Date', required: false, description: 'Due date for the card' },
      { id: 'labels', label: 'Labels', required: false, description: 'Card labels (comma-separated)' },
      { id: 'members', label: 'Members', required: false, description: 'Assigned members' }
    ];
    
    this.syntaxExamples = [
      { syntax: '%ColumnName1', description: 'Single column value' },
      { syntax: '%ColumnName1 + "; " + %ColumnName2', description: 'Combine two columns with separator' },
      { syntax: '%ColumnName1 + "\\n" + %ColumnName2', description: 'Combine with line break' },
      { syntax: '"Location: " + %Location + "\\nDate: " + %Date', description: 'Add custom text with column values' }
    ];
    
    this.init();
  }
  
  init() {
    try {
      this.t.render(() => { 
        this.setupEventListeners();
        this.setupSyntaxHelp();
        console.log('Excel to Cards Importer initialized successfully!');
      });
    } catch (error) {
      console.error('Initialization error:', error);
      this.showError('Failed to initialize the Power-Up. Please refresh and try again.');
    }
  }

  
  setupEventListeners() {
    // File upload handler
    const fileInput = document.getElementById('excelFile');
    fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
    
    // Drag and drop handlers
    const dropZone = document.getElementById('dropZone');
    dropZone.addEventListener('dragover', (e) => this.handleDragOver(e));
    dropZone.addEventListener('drop', (e) => this.handleDrop(e));
    dropZone.addEventListener('click', () => fileInput.click());
    
    // Mapping change handlers
    document.addEventListener('change', (e) => {
      if (e.target.classList.contains('column-select')) {
        this.handleMappingChange(e);
      }
    });
    
    // Import button
    const importBtn = document.getElementById('importBtn');
    importBtn.addEventListener('click', () => this.importCards());
    
    // Preview button
    const previewBtn = document.getElementById('previewBtn');
    previewBtn.addEventListener('click', () => this.showPreview());
    
    // Reset button
    const resetBtn = document.getElementById('resetBtn');
    resetBtn.addEventListener('click', () => this.resetForm());
  }
  
  setupSyntaxHelp() {
    const helpContainer = document.getElementById('syntaxHelp');
    helpContainer.innerHTML = `
      <h4>Syntax Help</h4>
      <div class="syntax-examples">
        ${this.syntaxExamples.map(example => `
          <div class="syntax-example">
            <code>${example.syntax}</code>
            <span>${example.description}</span>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  }
  
  handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      this.processFile(files[0]);
    }
  }
  
  handleFileUpload(e) {
    const file = e.target.files[0];
    if (file) {
      this.processFile(file);
    }
  }
  
  async processFile(file) {
    try {
      this.showLoading('Processing Excel file...');
      
      const data = await this.readExcelFile(file);
      this.excelData = data;
      this.columns = Object.keys(data[0] || {});
      
      if (this.columns.length === 0) {
        throw new Error('No data found in the Excel file');
      }
      
      this.renderFieldMappings();
      this.showSuccess(`File processed successfully! Found ${data.length} rows and ${this.columns.length} columns.`);
      
    } catch (error) {
      console.error('File processing error:', error);
      this.showError(`Error processing file: ${error.message}`);
    } finally {
      this.hideLoading();
    }
  }
  
  readExcelFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1,
            defval: '' 
          });
          
          if (jsonData.length < 2) {
            throw new Error('Excel file must have at least a header row and one data row');
          }
          
          const headers = jsonData[0];
          const rows = jsonData.slice(1);
          
          const formattedData = rows.map(row => {
            const obj = {};
            headers.forEach((header, index) => {
              obj[header] = row[index] || '';
            });
            return obj;
          });
          
          resolve(formattedData);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  }
  
  renderFieldMappings() {
    const container = document.getElementById('fieldMappings');
    
    container.innerHTML = `
      <h3>Map Excel Columns to Card Fields</h3>
      <div class="mappings-grid">
        ${this.availableFields.map(field => `
          <div class="mapping-item ${field.required ? 'required' : ''}">
            <label for="field-${field.id}">
              ${field.label}
              ${field.required ? '<span class="required-indicator">*</span>' : ''}
            </label>
            <div class="mapping-controls">
              <select id="field-${field.id}" class="column-select" data-field="${field.id}">
                <option value="">-- Select Column --</option>
                ${this.columns.map(col => `
                  <option value="${col}">${col}</option>
                `).join('')}
              </select>
              <button type="button" class="syntax-btn" data-field="${field.id}" title="Use syntax editor">
                📝
              </button>
            </div>
            <small class="field-description">${field.description}</small>
            <div class="syntax-editor" id="syntax-${field.id}" style="display: none;">
              <textarea 
                class="syntax-input" 
                placeholder="e.g., %ColumnName1 + '; ' + %ColumnName2"
                rows="2"
              ></textarea>
              <button type="button" class="apply-syntax-btn" data-field="${field.id}">Apply</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    
    // Add event listeners for syntax editors
    container.querySelectorAll('.syntax-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const fieldId = e.target.dataset.field;
        this.toggleSyntaxEditor(fieldId);
      });
    });
    
    container.querySelectorAll('.apply-syntax-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const fieldId = e.target.dataset.field;
        this.applySyntax(fieldId);
      });
    });
    
    // Show mappings section
    document.getElementById('mappingsSection').style.display = 'block';
  }
  
  toggleSyntaxEditor(fieldId) {
    const editor = document.getElementById(`syntax-${fieldId}`);
    const isVisible = editor.style.display !== 'none';
    editor.style.display = isVisible ? 'none' : 'block';
    
    if (!isVisible) {
      const textarea = editor.querySelector('.syntax-input');
      const select = document.getElementById(`field-${fieldId}`);
      if (select.value && !textarea.value) {
        textarea.value = `%${select.value}`;
      }
      textarea.focus();
    }
  }
  
  applySyntax(fieldId) {
    const editor = document.getElementById(`syntax-${fieldId}`);
    const textarea = editor.querySelector('.syntax-input');
    const syntax = textarea.value.trim();
    
    if (syntax) {
      this.fieldMappings[fieldId] = syntax;
      this.showSuccess(`Syntax applied to ${this.availableFields.find(f => f.id === fieldId)?.label}`);
      editor.style.display = 'none';
    }
  }
  
  handleMappingChange(e) {
    const field = e.target.dataset.field;
    const value = e.target.value;
    
    if (value) {
      this.fieldMappings[field] = `%${value}`;
    } else {
      delete this.fieldMappings[field];
    }
  }
  
  parseSyntax(syntax, rowData) {
    try {
      // Replace %ColumnName patterns with actual values
      let expression = syntax;
      
      // Find all column references
      const columnMatches = syntax.match(/%([a-zA-Z0-9_\s]+)/g) || [];
      
      columnMatches.forEach(match => {
        const columnName = match.substring(1); // Remove %
        const value = rowData[columnName] || '';
        // Escape quotes in the value
        const escapedValue = JSON.stringify(value);
        expression = expression.replace(new RegExp(match.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&'), 'g'), escapedValue);
      });
      
      // Evaluate the expression
      // eslint-disable-next-line no-eval
      const result = eval(expression);
      return String(result || '');
    } catch (error) {
      console.error('Syntax parsing error:', error);
      return `Error: ${error.message}`;
    }
  }
  
  async importCards() {
    try {
      if (!this.excelData || this.excelData.length === 0) {
        throw new Error('No data to import. Please upload an Excel file first.');
      }
      
      if (!this.fieldMappings.cardName) {
        throw new Error('Card Name is required. Please map at least one column to Card Name.');
      }
      
      this.showLoading('Creating Trello cards...');
      
      const boardData = await this.t.board('all');
      const lists = await this.t.lists('all');
      
      if (lists.length === 0) {
        throw new Error('No lists found on this board. Please create at least one list.');
      }
      
      // Use the first list as default
      const targetList = lists[0];
      
      const results = {
        success: 0,
        failed: 0,
        errors: []
      };
      
      // Process each row
      for (let i = 0; i < this.excelData.length; i++) {
        const row = this.excelData[i];
        
        try {
          const cardData = {};
          
          // Apply field mappings
          Object.keys(this.fieldMappings).forEach(field => {
            const syntax = this.fieldMappings[field];
            cardData[field] = this.parseSyntax(syntax, row);
          });
          
          // Create card via Trello REST API
          const card = await this.createTrelloCard(targetList.id, cardData);
          results.success++;
          
        } catch (error) {
          results.failed++;
          results.errors.push(`Row ${i + 1}: ${error.message}`);
          console.error(`Error creating card for row ${i + 1}:`, error);
        }
      }
      
      this.showImportResults(results);
      
    } catch (error) {
      console.error('Import error:', error);
      this.showError(`Import failed: ${error.message}`);
    } finally {
      this.hideLoading();
    }
  }
  
  async createTrelloCard(listId, cardData) {
    try {
      const restApi = await this.t.getRestApi();
      
      const cardPayload = {
        name: cardData.cardName,
        desc: cardData.description || '',
        pos: 'bottom',
        due: cardData.dueDate || null
      };
      
      const response = await restApi.post(`/lists/${listId}/cards`, cardPayload);
      
      // Add labels if specified
      if (cardData.labels) {
        const labelNames = cardData.labels.split(',').map(l => l.trim()).filter(l => l);
        await this.addLabelsToCard(response.id, labelNames);
      }
      
      return response;
    } catch (error) {
      throw new Error(`Failed to create card: ${error.message}`);
    }
  }
  
  async addLabelsToCard(cardId, labelNames) {
    try {
      const boardData = await this.t.board('all');
      const restApi = await this.t.getRestApi();
      
      // Get existing labels on the board
      const boardLabels = await restApi.get(`/boards/${boardData.id}/labels`);
      
      for (const labelName of labelNames) {
        // Find existing label or create new one
        let label = boardLabels.find(l => l.name.toLowerCase() === labelName.toLowerCase());
        
        if (!label) {
          // Create new label
          const colors = ['green', 'yellow', 'orange', 'red', 'purple', 'blue', 'sky', 'lime', 'pink', 'black'];
          const randomColor = colors[Math.floor(Math.random() * colors.length)];
          
          label = await restApi.post(`/boards/${boardData.id}/labels`, {
            name: labelName,
            color: randomColor
          });
        }
        
        // Add label to card
        await restApi.post(`/cards/${cardId}/idLabels`, {
          value: label.id
        });
      }
    } catch (error) {
      console.error('Error adding labels:', error);
    }
  }
  
  showPreview() {
    if (!this.excelData || this.excelData.length === 0) {
      this.showError('No data to preview. Please upload an Excel file first.');
      return;
    }
    
    if (!this.fieldMappings.cardName) {
      this.showError('Card Name is required for preview. Please map at least one column to Card Name.');
      return;
    }
    
    const previewData = this.excelData.slice(0, 5).map((row, index) => {
      const preview = { row: index + 1 };
      
      Object.keys(this.fieldMappings).forEach(field => {
        const syntax = this.fieldMappings[field];
        preview[field] = this.parseSyntax(syntax, row);
      });
      
      return preview;
    });
    
    this.renderPreviewModal(previewData);
  }
  
  renderPreviewModal(previewData) {
    const modal = document.createElement('div');
    modal.className = 'preview-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Card Preview (First ${previewData.length} rows)</h3>
          <button type="button" class="close-modal">&times;</button>
        </div>
        <div class="modal-body">
          ${previewData.map(preview => `
            <div class="preview-card">
              <h4>Row ${preview.row}</h4>
              ${Object.keys(preview).filter(key => key !== 'row').map(field => `
                <div class="preview-field">
                  <strong>${this.availableFields.find(f => f.id === field)?.label || field}:</strong>
                  <span>${preview[field] || '(empty)'}</span>
                </div>
              `).join('')}
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal handlers
    modal.querySelector('.close-modal').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  }
  
  showImportResults(results) {
    const modal = document.createElement('div');
    modal.className = 'results-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Import Results</h3>
          <button type="button" class="close-modal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="results-summary">
            <div class="result-item success">
              <span class="result-number">${results.success}</span>
              <span class="result-label">Cards Created Successfully</span>
            </div>
            <div class="result-item failed">
              <span class="result-number">${results.failed}</span>
              <span class="result-label">Failed</span>
            </div>
          </div>
          
          ${results.errors.length > 0 ? `
            <div class="errors-section">
              <h4>Errors:</h4>
              <ul class="error-list">
                ${results.errors.map(error => `<li>${error}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          
          <div class="modal-actions">
            <button type="button" class="btn btn-primary close-results">Close</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close handlers
    modal.querySelector('.close-modal').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    modal.querySelector('.close-results').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  }
  
  resetForm() {
    this.excelData = null;
    this.columns = [];
    this.fieldMappings = {
      cardName: '',
      description: '',
      location: '',
      dueDate: '',
      labels: '',
      members: ''
    };
    
    document.getElementById('excelFile').value = '';
    document.getElementById('fieldMappings').innerHTML = '';
    document.getElementById('mappingsSection').style.display = 'none';
    
    this.showSuccess('Form reset successfully!');
  }
  
  showLoading(message) {
    const loader = document.getElementById('loadingIndicator');
    loader.querySelector('.loading-message').textContent = message;
    loader.style.display = 'flex';
  }
  
  hideLoading() {
    document.getElementById('loadingIndicator').style.display = 'none';
  }
  
  showSuccess(message) {
    this.showNotification(message, 'success');
  }
  
  showError(message) {
    this.showNotification(message, 'error');
  }
  
  showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 5000);
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ExcelToCardsImporter();
});