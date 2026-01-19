# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Trello Power-Up that allows importing Excel data (.xlsx, .xls, .csv) and converting it into Trello cards with flexible field mapping. The Power-Up is client-side only (no backend) and uses Trello's iframe-based Power-Up architecture.

**Key Capabilities:**
- Upload and parse Excel files using SheetJS
- Visual query builder for mapping Excel columns to Trello card fields
- Custom syntax combining columns with text (e.g., `%[Column Name] + " - " + %[Other Column]`)
- Create Trello cards via REST API with labels, due dates, members, etc.

## Development Setup

This is a static web application with no build process. Simply host the files on any web server.

**Testing locally:**
```bash
# Use any static server, for example:
python -m http.server 8000
# or
npx serve
```

Then configure Trello Power-Up to point to `http://localhost:8000/html/main.html`

**Deployment locations:**
- Production: GitHub Pages at https://weinbenni.github.io/trello-excel-powerup/
- Manifest connector URL points to hosted `index.html`

## Architecture

### Power-Up Entry Points

**Power-Up Registration** (`js/powerup.js`):
- Initializes Trello Power-Up using `window.TrelloPowerUp.initialize()`
- Registers two capabilities:
  - `board-buttons`: Shows "Import Excel" button on board toolbar
  - `card-buttons`: Shows "Import Excel" button on individual cards
- Opens modal with `html/main.html` when clicked

**Main Application** (`js/main.js`):
- `ExcelToCardsImporter` class manages the entire import workflow
- Initialized with Trello iframe context and API key (currently: `c9df6f6f1cd31f277375aa5dd43041c8`)
- Uses `window.TrelloPowerUp.iframe()` for REST API access

### Core Components

**1. File Upload & Parsing** (`js/main.js:101-170`):
- Drag-and-drop zone with visual feedback
- Uses SheetJS library (`xlsx.full.min.js`) to parse Excel files
- Extracts column headers from first row
- Stores data in `this.excelData` (array of row objects)

**2. Query Builder System** (`js/main.js:234-482`):
This is the most complex part of the application.

**Data Structure:**
```javascript
this.queryParts = {
  cardName: [
    { type: 'column', value: 'Task Name' },
    { type: 'text', value: ' - ' },
    { type: 'column', value: 'Priority' }
  ],
  description: [...],
  // ... other fields
}
```

**Workflow:**
1. User clicks "+ Add Column" or "+ Add Text" buttons
2. `showColumnPicker()` or `showTextInput()` displays selection UI
3. `addToQuery()` adds part to `queryParts[fieldId]` array
4. `updateQueryDisplay()` renders parts as colored badges
5. `buildSyntax()` generates final expression using bracket notation
6. `parseSyntax()` evaluates expression against Excel row data

**Bracket Notation** (lines 436-449):
- Column references use `%[Column Name]` format (NOT `%ColumnName`)
- Handles spaces and special characters in column names
- Example: `%[Task Name] + " (" + %[Priority] + ")"`
- Regex pattern for parsing: `/%\[([^\]]+)\]/g`

**Syntax Evaluation** (lines 451-482):
- Replaces `%[Column]` with actual values from Excel row
- Uses `eval()` to execute JavaScript expression
- Text literals are JSON.stringify'd for safe escaping
- Result becomes the card field value

**3. Card Creation** (`js/main.js:484-589`):
- Iterates through Excel rows
- For each row, parses all field mappings using `parseSyntax()`
- Creates card via `POST /1/cards` REST API
- Handles labels (creates if missing), due dates, members
- Shows progress and error handling

### Field Mappings

Six Trello card fields are supported (defined in `this.availableFields`, lines 23-30):

| Field ID | Trello Field | Required | Notes |
|----------|--------------|----------|-------|
| `cardName` | Card title | Yes | Must be mapped |
| `description` | Card description | No | Supports multi-line with `\n` |
| `location` | Location | No | Text field |
| `dueDate` | Due date | No | Parsed as date string |
| `labels` | Labels | No | Comma-separated, creates missing labels |
| `members` | Members | No | Member IDs |

### UI Components

**Styling** (`css/styles.css`):
- Query builder badges: Lines 732-862
  - `.column-badge`: Blue (#2ea3f2) for column references
  - `.text-badge`: Green (#28a745) for text literals
- Modal overlays for column picker, text input, preview, results
- Drag-and-drop zone styling with hover states
- Responsive design with mobile support

**HTML Structure** (`html/main.html`):
- Header with title and help section
- Drop zone for file upload
- Field mappings grid (6 cards)
- Action buttons (Preview, Import, Reset)
- Modal templates (hidden by default)

## Important Implementation Details

### Query Builder State Management

**DO NOT** store state in the query builder DOM elements directly. Always update `this.queryParts` first, then call `updateQueryDisplay()` to sync the UI.

**Correct pattern:**
```javascript
// 1. Update state
this.queryParts[fieldId].push({ type: 'column', value: columnName });

// 2. Update display
this.updateQueryDisplay(fieldId);

// 3. Build syntax
this.buildSyntax(fieldId);
```

### Reset Functionality

The Reset button (`resetForm()` at line 591) must clear THREE things:
1. File input value
2. `this.queryParts` object
3. Query builder display areas

**Recent bug fix** (commit 994bcc2): Reset was not clearing `queryParts` state, causing old mappings to persist visually despite being cleared in the DOM.

### Bracket Notation for Column Names

**Always use bracket notation** when building syntax (commit e055842):
- `%[Column Name]` NOT `%ColumnName`
- Handles spaces: `%[Task Name]`, `%[Assigned To]`
- Handles special chars: `%[Name-1]`, `%[Column (Draft)]`

When parsing, use regex: `/%\[([^\]]+)\]/g` to extract column name between brackets.

### Trello API Authentication

The Power-Up uses Trello's OAuth flow automatically. When making REST API calls:

```javascript
// Get token from Trello
const token = await this.t.getRestApi().getToken();

// Make authenticated request
const response = await fetch(`https://api.trello.com/1/cards?key=${APP_KEY}&token=${token}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(cardData)
});
```

**API Key location:** `js/main.js:6` and must match key in Trello Power-Up admin portal.

## Common Tasks

### Adding a New Field Type

1. Add field definition to `this.availableFields` (line 23)
2. Add property to `this.fieldMappings` (line 14)
3. UI automatically renders based on `availableFields`
4. Update `importCards()` method to handle new field in REST API call

### Modifying Query Builder UI

Query builder rendering happens in these methods:
- `renderFieldMappings()`: Creates initial structure (lines 234-293)
- `updateQueryDisplay()`: Renders current parts as badges (lines 385-410)
- `showColumnPicker()`: Popup for selecting columns (lines 295-309)
- `showTextInput()`: Modal for text input (lines 311-362)

CSS classes to modify are in `css/styles.css` lines 732-862.

### Debugging Query Builder Issues

Enable console logging to inspect state:

```javascript
console.log('Query Parts:', this.queryParts);
console.log('Field Mappings:', this.fieldMappings);
console.log('Parsed Value:', this.parseSyntax(mapping, rowData));
```

Common issues:
- **Parts not displaying**: Check `updateQueryDisplay()` is called after state change
- **Syntax errors**: Verify bracket notation `%[...]` is used consistently
- **Reset not working**: Ensure all three state locations are cleared

### Testing with Sample Data

Use sample files in `examples/` directory:
- `examples/sample_tasks.xlsx`: Example project tasks
- `examples/sample_tasks.csv`: CSV version

Test cases to verify:
1. Column names with spaces
2. Multi-line descriptions (with `\n`)
3. Label creation (new labels)
4. Due date parsing (various formats)
5. Reset clears all state

## File Structure Reference

```
├── index_powerup.html          # Legacy entry point (unused)
├── manifest.json               # Power-Up configuration for Trello
├── js/
│   ├── powerup.js              # Trello Power-Up registration (39 lines)
│   └── main.js                 # Main application logic (700+ lines)
├── html/
│   └── main.html               # UI interface (modal content)
├── css/
│   └── styles.css              # Complete styling (~900 lines)
├── assets/
│   ├── icon-dark.svg           # Power-Up icon (dark theme)
│   └── icon-light.svg          # Power-Up icon (light theme)
├── examples/
│   ├── sample_tasks.xlsx       # Example Excel file
│   ├── sample_tasks.csv        # Example CSV file
│   └── usage_examples.md       # Usage documentation
├── README.md                   # User documentation
├── PROJECT_SUMMARY.md          # Feature overview
└── DEPLOYMENT_GUIDE.md         # Deployment instructions
```

## Known Issues & Limitations

**Current limitations:**
- No template saving (mappings must be recreated each time)
- No bulk card updates (only creation)
- Labels are assigned random colors when auto-created
- Member assignment requires member IDs (not names)
- No support for Trello Custom Fields Power-Up

**Browser compatibility:**
- Requires modern browser with ES6 support
- Uses `eval()` for syntax parsing (consider sandboxing for future)
- FileReader API required for file upload

## Configuration

**Trello API Key:**
Located in `js/main.js:6`. Update when deploying to new Trello Power-Up.

**Modal dimensions:**
Configured in `js/powerup.js:15-16` (height: 650px, width: 900px).

**Connector URL:**
Set in `manifest.json:12` - must point to hosted location of `index.html`.

## Recent Git History Context

- **0ad703a**: UI updated to fit "Weinhaeupl Waagen" aesthetics (brand-specific styling)
- **e055842**: Fixed query string building with bracket notation for column names
- **340cc30**: Fixed Add Column popup positioning error
- **994bcc2**: Fixed Reset button not clearing query builder state and drop zone UI
- **570245b**: Added query builder (initial implementation)

The most recent work focused on query builder bug fixes and bracket notation improvements.
