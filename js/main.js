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
    this.queryParts = {}; // Track query builder parts
    this.uploadedFileName = null; // Track uploaded file name
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
      { syntax: '%[Column Name]', description: 'Single column value' },
      { syntax: '%[Column1] + "; " + %[Column2]', description: 'Combine two columns with separator' },
      { syntax: '%[Column1] + "\\n" + %[Column2]', description: 'Combine with line break' },
      { syntax: '"Location: " + %[Location] + "\\nDate: " + %[Date]', description: 'Add custom text with column values' },
      { syntax: 'Merged Address', description: 'Auto-merge Straße, Ort, PLZ columns (if detected)' },
      { syntax: '%[Address:plz] + " " + %[Address:city]', description: 'Extract PLZ and City from address column' }
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
      <div class="syntax-help-header" id="syntaxHelpToggle">
        <h4>Syntax Help</h4>
        <span class="toggle-icon">▼</span>
      </div>
      <div class="syntax-examples" id="syntaxExamplesContent" style="display: none;">
        ${this.syntaxExamples.map(example => `
          <div class="syntax-example">
            <code>${example.syntax}</code>
            <span>${example.description}</span>
          </div>
        `).join('')}
      </div>
    `;

    // Add click handler for toggle
    const toggleBtn = document.getElementById('syntaxHelpToggle');
    const content = document.getElementById('syntaxExamplesContent');
    const icon = toggleBtn.querySelector('.toggle-icon');

    toggleBtn.addEventListener('click', () => {
      const isHidden = content.style.display === 'none';
      content.style.display = isHidden ? 'block' : 'none';
      icon.textContent = isHidden ? '▲' : '▼';
      toggleBtn.classList.toggle('expanded', isHidden);
    });
  }

  // Check if a column contains address data
  isAddressColumn(columnName) {
    if (!this.excelData || this.excelData.length === 0) return false;

    // Check column name for address keywords
    const nameMatch = /adresse|address|anschrift|standort|location/i.test(columnName);

    // Sample first few non-empty values
    const sampleSize = Math.min(5, this.excelData.length);
    let addressCount = 0;

    for (let i = 0; i < sampleSize; i++) {
      const value = String(this.excelData[i][columnName] || '').trim();
      if (this.looksLikeAddress(value)) {
        addressCount++;
      }
    }

    // If column name matches OR more than 60% of samples look like addresses
    return nameMatch || (addressCount / sampleSize) > 0.6;
  }

  // Detect if a string looks like an address
  looksLikeAddress(text) {
    if (!text || text.length < 10) return false;

    // Austrian/German address patterns:
    // - Contains numbers (street number or PLZ)
    // - Contains street indicators (Straße, str., -gasse, etc.)
    // - Has postal code pattern (4-5 digits)
    const hasNumber = /\d/.test(text);
    const hasStreetIndicator = /(straße|strasse|str\.|gasse|weg|platz|allee|ring)/i.test(text);
    const hasPostalCode = /\b\d{4,5}\b/.test(text);
    const hasCommaOrNewline = /[,\n]/.test(text);

    return hasNumber && (hasStreetIndicator || hasPostalCode || hasCommaOrNewline);
  }

  // Detect if we have separate address component columns
  detectAddressComponentColumns() {
    if (!this.columns || this.columns.length === 0) return null;

    const components = {
      street: null,
      number: null,
      plz: null,
      city: null
    };

    // Common German column names for address components
    const patterns = {
      street: /^(stra(ß|ss)e|street|strasse)$/i,
      number: /^(haus(nr|nummer)|number|nr\.?)$/i,
      plz: /^(plz|postleitzahl|postal|zip)$/i,
      city: /^(ort|city|stadt|place)$/i
    };

    // Check each column against patterns
    this.columns.forEach(col => {
      for (const [component, pattern] of Object.entries(patterns)) {
        if (pattern.test(col.trim())) {
          components[component] = col;
          break;
        }
      }
    });

    // Return components if we found at least street or city
    if (components.street || components.city) {
      return components;
    }

    return null;
  }

  // Build address from separate components
  buildAddressFromComponents(rowData, components) {
    const parts = [];

    // Format: "Street Number, PLZ City"
    if (components.street && rowData[components.street]) {
      let streetPart = String(rowData[components.street]).trim();
      if (components.number && rowData[components.number]) {
        streetPart += ' ' + String(rowData[components.number]).trim();
      }
      parts.push(streetPart);
    }

    if (components.plz && rowData[components.plz]) {
      let cityPart = String(rowData[components.plz]).trim();
      if (components.city && rowData[components.city]) {
        cityPart += ' ' + String(rowData[components.city]).trim();
      }
      parts.push(cityPart);
    } else if (components.city && rowData[components.city]) {
      parts.push(String(rowData[components.city]).trim());
    }

    return parts.join(', ');
  }

  // Parse address into components
  parseAddress(addressString) {
    const address = {
      plz: '',
      city: '',
      street: '',
      number: ''
    };

    if (!addressString) return address;

    const text = String(addressString).trim();

    // Pattern 1: "Street Number, PLZ City" or "Street Number\nPLZ City"
    // Pattern 2: "PLZ City, Street Number"

    // Split by comma or newline
    const parts = text.split(/[,\n]+/).map(p => p.trim()).filter(p => p);

    for (const part of parts) {
      // Try to extract PLZ (4-5 digit postal code) and city
      const plzCityMatch = part.match(/^(\d{4,5})\s+(.+)$/);
      if (plzCityMatch) {
        address.plz = plzCityMatch[1];
        address.city = plzCityMatch[2];
        continue;
      }

      // Try to extract street and number
      const streetMatch = part.match(/^(.+?)\s+(\d+[a-zA-Z]?(?:\/\d+)?)$/);
      if (streetMatch) {
        address.street = streetMatch[1];
        address.number = streetMatch[2];
        continue;
      }

      // If no pattern matched, try to guess based on content
      if (/^\d{4,5}/.test(part)) {
        // Starts with PLZ
        const match = part.match(/^(\d{4,5})\s*(.*)$/);
        if (match) {
          address.plz = match[1];
          if (match[2]) address.city = match[2];
        }
      } else if (/\d+[a-zA-Z]?$/.test(part)) {
        // Ends with number (likely street + number)
        const match = part.match(/^(.+?)\s+(\d+[a-zA-Z]?(?:\/\d+)?)$/);
        if (match) {
          address.street = match[1];
          address.number = match[2];
        }
      }
    }

    return address;
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
      this.uploadedFileName = file.name;

      if (this.columns.length === 0) {
        throw new Error('No data found in the Excel file');
      }

      // Debug: Output first 5 rows to console
      console.log('=== EXCEL DATA DEBUG ===');
      console.log('File:', file.name);
      console.log('Total rows:', data.length);
      console.log('Columns:', this.columns);
      console.log('\nFirst 5 rows:');
      data.slice(0, 5).forEach((row, index) => {
        console.log(`\nRow ${index + 1}:`, row);
        // Also log each column value separately for easier inspection
        Object.entries(row).forEach(([key, value]) => {
          console.log(`  ${key}: "${value}"`);
        });
      });
      console.log('=== END DEBUG ===\n');

      this.showFileInfo(file.name, data.length, this.columns.length);
      this.renderFieldMappings();
      this.showSuccess(`File processed successfully! Found ${data.length} rows and ${this.columns.length} columns.`);

    } catch (error) {
      console.error('File processing error:', error);
      this.showError(`Error processing file: ${error.message}`);
    } finally {
      this.hideLoading();
    }
  }
  
  showFileInfo(fileName, rowCount, columnCount) {
    const dropZone = document.getElementById('dropZone');
    dropZone.innerHTML = `
      <div class="file-info-display">
        <div class="file-icon">✅</div>
        <h3>File Uploaded Successfully</h3>
        <div class="file-details">
          <div class="file-detail-item">
            <span class="detail-label">📄 File Name:</span>
            <span class="detail-value">${fileName}</span>
          </div>
          <div class="file-detail-item">
            <span class="detail-label">📊 Rows:</span>
            <span class="detail-value">${rowCount}</span>
          </div>
          <div class="file-detail-item">
            <span class="detail-label">📋 Columns:</span>
            <span class="detail-value">${columnCount}</span>
          </div>
        </div>
        <div class="column-list">
          <strong>Available Columns:</strong>
          <div class="column-chips">
            ${this.columns.map(col => `<span class="column-chip">${col}</span>`).join('')}
          </div>
        </div>
        <button type="button" class="upload-another-btn">
          📁 Upload Different File
        </button>
        <input type="file" id="excelFile" accept=".xlsx,.xls,.csv" />
      </div>
    `;

    // Re-attach file input event listener after DOM replacement
    const fileInput = document.getElementById('excelFile');
    fileInput.addEventListener('change', (e) => this.handleFileUpload(e));

    // Attach click handler to the upload button
    const uploadBtn = dropZone.querySelector('.upload-another-btn');
    uploadBtn.addEventListener('click', () => fileInput.click());
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
            <small class="field-description">${field.description}</small>
            
            <div class="query-builder" id="builder-${field.id}">
              <div class="query-display" id="display-${field.id}" data-field="${field.id}">
                <span class="placeholder">Click + to add columns</span>
              </div>
              <div class="query-actions">
                <button type="button" class="add-column-btn" data-field="${field.id}" title="Add column">
                  + Add Column
                </button>
                <button type="button" class="add-text-btn" data-field="${field.id}" title="Add custom text">
                  + Add Text
                </button>
                <button type="button" class="clear-query-btn" data-field="${field.id}" title="Clear">
                  Clear
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    
    // Add event listeners for query builder buttons
    container.querySelectorAll('.add-column-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const fieldId = e.target.dataset.field;
        this.showColumnPicker(fieldId, e);
      });
    });
    
    container.querySelectorAll('.add-text-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const fieldId = e.target.dataset.field;
        this.showTextInput(fieldId);
      });
    });
    
    container.querySelectorAll('.clear-query-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const fieldId = e.target.dataset.field;
        this.clearQuery(fieldId);
      });
    });
    
    // Show mappings section
    document.getElementById('mappingsSection').style.display = 'block';
  }
  
  showColumnPicker(fieldId, event) {
    const items = [];

    // Check if we have separate address component columns
    const addressComponents = this.detectAddressComponentColumns();
    if (addressComponents) {
      items.push({
        text: '🏠 Merged Address (from ' +
              [addressComponents.street, addressComponents.city].filter(x => x).join(', ') + ')',
        callback: (t) => {
          this.addToQuery(fieldId, 'merged-address', JSON.stringify(addressComponents));
          return t.closePopup();
        }
      });
      items.push({
        text: '---' // Separator
      });
    }

    // Add regular column items
    this.columns.forEach(col => {
      const isAddress = this.isAddressColumn(col);

      if (isAddress) {
        // Create a parent item with submenu for address components
        items.push({
          text: `🏠 ${col} (Address)`,
          callback: (t) => {
            // Show address component picker - don't close, let new popup replace
            return this.showAddressComponentPicker(fieldId, col, event, t);
          }
        });
      } else {
        items.push({
          text: `📊 ${col}`,
          callback: (t) => {
            this.addToQuery(fieldId, 'column', col);
            return t.closePopup();
          }
        });
      }
    });

    this.t.popup({
      title: 'Select Column',
      items: items,
      mouseEvent: event
    });
  }

  showAddressComponentPicker(fieldId, columnName, event, t) {
    const components = [
      {
        text: '📊 Full Address',
        callback: (t) => {
          this.addToQuery(fieldId, 'column', columnName);
          return t.closePopup();
        }
      },
      {
        text: '📮 PLZ (Postal Code)',
        callback: (t) => {
          this.addToQuery(fieldId, 'address', `${columnName}:plz`);
          return t.closePopup();
        }
      },
      {
        text: '🏙️ City',
        callback: (t) => {
          this.addToQuery(fieldId, 'address', `${columnName}:city`);
          return t.closePopup();
        }
      },
      {
        text: '🛣️ Street',
        callback: (t) => {
          this.addToQuery(fieldId, 'address', `${columnName}:street`);
          return t.closePopup();
        }
      },
      {
        text: '🔢 Street Number',
        callback: (t) => {
          this.addToQuery(fieldId, 'address', `${columnName}:number`);
          return t.closePopup();
        }
      }
    ];

    return t.popup({
      title: `Address Components: ${columnName}`,
      items: components,
      mouseEvent: event
    });
  }
  
  showTextInput(fieldId) {
    const modal = document.createElement('div');
    modal.className = 'text-input-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Add Custom Text</h3>
          <button type="button" class="close-modal">&times;</button>
        </div>
        <div class="modal-body">
          <input type="text" id="customText" class="custom-text-input" placeholder='Enter text (e.g., ", " or "\\n" for new line)'>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary cancel-text">Cancel</button>
            <button type="button" class="btn btn-primary add-text">Add</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    const input = modal.querySelector('#customText');
    input.focus();
    
    const addText = () => {
      const text = input.value;
      if (text) {
        this.addToQuery(fieldId, 'text', text);
      }
      document.body.removeChild(modal);
    };
    
    modal.querySelector('.add-text').addEventListener('click', addText);
    modal.querySelector('.cancel-text').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    modal.querySelector('.close-modal').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        addText();
      }
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  }
  
  addToQuery(fieldId, type, value) {
    const display = document.getElementById(`display-${fieldId}`);
    
    // Initialize query parts if not exists
    if (!this.queryParts) {
      this.queryParts = {};
    }
    if (!this.queryParts[fieldId]) {
      this.queryParts[fieldId] = [];
    }
    
    // Add the new part
    this.queryParts[fieldId].push({ type, value });
    
    // Update display
    this.updateQueryDisplay(fieldId);
    
    // Build the syntax string
    this.buildSyntax(fieldId);
  }
  
  updateQueryDisplay(fieldId) {
    const display = document.getElementById(`display-${fieldId}`);
    const parts = this.queryParts[fieldId] || [];

    if (parts.length === 0) {
      display.innerHTML = '<span class="placeholder">Click + to add columns</span>';
      return;
    }

    display.innerHTML = parts.map((part, index) => {
      let badge;
      if (part.type === 'column') {
        badge = `<span class="query-badge column-badge">📊 ${part.value}</span>`;
      } else if (part.type === 'address') {
        const [columnName, component] = part.value.split(':');
        const componentLabels = {
          plz: '📮 PLZ',
          city: '🏙️ City',
          street: '🛣️ Street',
          number: '🔢 Number'
        };
        const label = componentLabels[component] || component;
        badge = `<span class="query-badge address-badge">🏠 ${columnName}.${label}</span>`;
      } else if (part.type === 'merged-address') {
        const components = JSON.parse(part.value);
        const componentNames = [components.street, components.city].filter(x => x).join(', ');
        badge = `<span class="query-badge address-badge">🏠 Merged (${componentNames})</span>`;
      } else {
        badge = `<span class="query-badge text-badge">"${part.value}"</span>`;
      }

      return `${badge}<button class="remove-part-btn" data-field="${fieldId}" data-index="${index}">×</button>`;
    }).join('');

    // Add remove listeners
    display.querySelectorAll('.remove-part-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const field = e.target.dataset.field;
        const index = parseInt(e.target.dataset.index);
        this.removeFromQuery(field, index);
      });
    });
  }
  
  removeFromQuery(fieldId, index) {
    if (this.queryParts[fieldId]) {
      this.queryParts[fieldId].splice(index, 1);
      this.updateQueryDisplay(fieldId);
      this.buildSyntax(fieldId);
    }
  }
  
  clearQuery(fieldId) {
    if (this.queryParts) {
      this.queryParts[fieldId] = [];
    }
    this.fieldMappings[fieldId] = '';
    this.updateQueryDisplay(fieldId);
  }
  
  buildSyntax(fieldId) {
    const parts = this.queryParts[fieldId] || [];

    if (parts.length === 0) {
      this.fieldMappings[fieldId] = '';
      return;
    }

    // Build syntax string using bracket notation: %[Column Name] + "text"
    const syntaxParts = parts.map(part => {
      if (part.type === 'column') {
        // Use brackets to clearly delimit column names with spaces
        return `%[${part.value}]`;
      } else if (part.type === 'address') {
        // Address components use special syntax: %[Column:component]
        return `%[${part.value}]`;
      } else if (part.type === 'merged-address') {
        // Merged address uses special syntax: %[MERGE:components]
        return `%[MERGE:${part.value}]`;
      } else {
        // Use JSON.stringify to properly escape all special characters
        return JSON.stringify(part.value);
      }
    });

    this.fieldMappings[fieldId] = syntaxParts.join(' + ');
    console.log(`Built syntax for ${fieldId}:`, this.fieldMappings[fieldId]);
  }
  
  parseSyntax(syntax, rowData) {
    // Early return for empty syntax
    if (!syntax || syntax.trim() === '') {
      return '';
    }

    try {
      let expression = syntax;

      // Find all column references in format %[Column Name], %[Column:component], or %[MERGE:...]
      const columnMatches = syntax.match(/%\[([^\]]+)\]/g) || [];
      console.log('Column matches found:', columnMatches);
      columnMatches.forEach(match => {
        // Extract content from %[...] format
        const content = match.slice(2, -1);

        let value = '';

        // Check if this is a merged address reference
        if (content.startsWith('MERGE:')) {
          const componentsJson = content.substring(6);
          try {
            const components = JSON.parse(componentsJson);
            value = this.buildAddressFromComponents(rowData, components);
          } catch (e) {
            console.error('Error parsing merged address components:', e);
            value = '';
          }
        }
        // Check if this is an address component reference (contains colon)
        else if (content.includes(':')) {
          const [columnName, component] = content.split(':');
          const addressString = rowData[columnName];

          if (addressString) {
            // Parse the address and extract the requested component
            const parsedAddress = this.parseAddress(addressString);
            value = parsedAddress[component] || '';
          }
        } else {
          // Regular column reference
          value = rowData[content] !== undefined ? rowData[content] : '';
        }

        // Safely escape the value for JavaScript string context
        const escapedValue = JSON.stringify(String(value));
        // Escape regex special chars in the match pattern for replacement
        const escapedMatch = match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        expression = expression.replace(new RegExp(escapedMatch, 'g'), escapedValue);
      });

      // Evaluate the expression
      // eslint-disable-next-line no-eval
      const result = eval(expression);
      return String(result || '');
    } catch (error) {
      console.error('Syntax parsing error:', error, 'Syntax:', syntax);
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
          await this.createTrelloCard(targetList.id, cardData);
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
      // Try to authorize the user first
      const token = await this.t.getRestApi().authorize({ scope: 'read,write' });
      
      console.log('Token retrieved:', token ? 'Yes' : 'No');
      
      if (!token) {
        throw new Error('Failed to get authorization token. Please authorize the Power-Up.');
      }
      
      // Build URL parameters (Trello API expects params in URL, not JSON body)
      const params = new URLSearchParams({
        key: 'c9df6f6f1cd31f277375aa5dd43041c8',
        token: token,
        name: cardData.cardName,
        desc: cardData.description || '',
        pos: 'bottom',
        idList: listId
      });

      if (cardData.dueDate) {
        params.append('due', cardData.dueDate);
      }

      if (cardData.location) {
        params.append('address', cardData.location);
      }

      const url = `https://api.trello.com/1/cards?${params.toString()}`;

      console.log('Attempting to create card:', {
        name: cardData.cardName,
        desc: cardData.description?.substring(0, 50) + '...',
        listId: listId
      });

      const response = await fetch(url, {
        method: 'POST'
      });

      console.log('Trello API Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Trello API Error Response:', errorText);
        throw new Error(`Trello API error: ${response.status} - ${errorText}`);
      }
      
      const card = await response.json();
      
      // Add labels if specified
      if (cardData.labels && card.id) {
        const labelNames = cardData.labels.split(',').map(l => l.trim()).filter(l => l);
        await this.addLabelsToCard(card.id, labelNames, token);
      }
      
      return card;
    } catch (error) {
      console.error('Full error:', error);
      throw new Error(`Failed to create card: ${error.message}`);
    }
  }
  
  async addLabelsToCard(cardId, labelNames, token) {
    try {
      const boardData = await this.t.board('id');
      
      // Get existing labels on the board
      const labelsResponse = await fetch(
        `https://api.trello.com/1/boards/${boardData.id}/labels?key=c9df6f6f1cd31f277375aa5dd43041c8&token=${token}`
      );
      const boardLabels = await labelsResponse.json();
      
      for (const labelName of labelNames) {
        // Find existing label or create new one
        let label = boardLabels.find(l => l.name.toLowerCase() === labelName.toLowerCase());
        
        if (!label) {
          // Create new label
          const colors = ['green', 'yellow', 'orange', 'red', 'purple', 'blue', 'sky', 'lime', 'pink', 'black'];
          const randomColor = colors[Math.floor(Math.random() * colors.length)];
          
          const createLabelResponse = await fetch(
            `https://api.trello.com/1/labels?key=c9df6f6f1cd31f277375aa5dd43041c8&token=${token}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: labelName,
                color: randomColor,
                idBoard: boardData.id
              })
            }
          );
          label = await createLabelResponse.json();
        }
        
        // Add label to card
        await fetch(
          `https://api.trello.com/1/cards/${cardId}/idLabels?key=c9df6f6f1cd31f277375aa5dd43041c8&token=${token}&value=${label.id}`,
          { method: 'POST' }
        );
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
  f
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
    this.queryParts = {};
    this.uploadedFileName = null;
    this.fieldMappings = {
      cardName: '',
      description: '',
      location: '',
      dueDate: '',
      labels: '',
      members: ''
    };

    document.getElementById('fieldMappings').innerHTML = '';
    document.getElementById('mappingsSection').style.display = 'none';

    // Restore original drop zone content
    const dropZone = document.getElementById('dropZone');
    dropZone.innerHTML = `
      <div class="upload-icon">📁</div>
      <h2>Upload Your Excel File</h2>
      <p>Drag and drop your Excel file here, or click to browse</p>
      <p><strong>Supported formats:</strong> .xlsx, .xls, .csv</p>
      <button type="button" class="upload-btn">Choose File</button>
      <input type="file" id="excelFile" accept=".xlsx,.xls,.csv" />
    `;

    // Re-attach file input event listener
    const fileInput = document.getElementById('excelFile');
    fileInput.addEventListener('change', (e) => this.handleFileUpload(e));

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