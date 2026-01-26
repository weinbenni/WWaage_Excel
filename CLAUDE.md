# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Trello Power-Up with two main features:

1. **Excel to Cards Importer**: Import Excel/CSV files and convert rows into Trello cards with flexible field mapping
2. **Attachment Downloader**: Bulk download attachments from Trello cards using a serverless backend

**Key Capabilities:**
- Upload and parse Excel files using SheetJS
- Visual query builder for mapping Excel columns to Trello card fields
- Custom syntax combining columns with text (e.g., `%[Column Name] + " - " + %[Other Column]`)
- **Address parsing**: Automatic detection and extraction of address components (PLZ, City, Street, Number)
- **Address merging**: Automatically combine separate Straße, Ort, PLZ columns into complete addresses
- Create Trello cards via REST API with labels, due dates, members, etc.
- **Bulk download attachments**: Download hundreds of attachments at once, bypassing CORS restrictions via serverless backend

## Development Setup

The Power-Up has two components:

**Frontend (Static)**: HTML/CSS/JavaScript hosted on GitHub Pages
**Backend (Serverless)**: Node.js functions hosted on Vercel (for attachment downloads)

### Frontend Development

This is a static web application with no build process. Simply host the files on any web server.

**Testing locally:**
```bash
# Use any static server, for example:
python -m http.server 8000
# or
npx serve
```

Then configure Trello Power-Up to point to `http://localhost:8000/html/main.html`

### Backend Development

For local backend testing:

```bash
# Install dependencies
npm install

# Start Vercel dev server
vercel dev

# Or use npm script
npm run dev
```

Backend will be available at `http://localhost:3000/api/download-attachments`

**Deployment locations:**
- Frontend: GitHub Pages at https://weinbenni.github.io/trello-excel-powerup/
- Backend: Vercel at `https://YOUR_VERCEL_URL/api/download-attachments`
- Manifest connector URL points to hosted `index.html`

**See [BACKEND_DEPLOYMENT.md](BACKEND_DEPLOYMENT.md) for complete deployment guide.**

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

### Address Parsing Feature (NEW)

The Power-Up now automatically detects address columns and allows extraction of specific components.

**Address Detection** (`isAddressColumn()` at line ~102):
- Checks column names for keywords: `adresse`, `address`, `anschrift`, `standort`, `location`
- Samples first 5 rows and checks if they look like addresses
- Uses 60% threshold for automatic detection

**Address Component Syntax**:
- `%[AddressColumn:plz]` - Extracts postal code (4-5 digits)
- `%[AddressColumn:city]` - Extracts city name
- `%[AddressColumn:street]` - Extracts street name
- `%[AddressColumn:number]` - Extracts street number (handles variants like 12a, 15/2)

**Supported Address Formats**:
```
Hauptstraße 15, 5020 Salzburg
Mozartstraße 12a
5020 Salzburg
Salzburg, PLZ 5020

// Multi-line formats:
Hauptstraße 15
5020 Salzburg
```

**UI Elements**:
- Address columns show with 🏠 icon in column picker
- Submenu with component options: Full Address, PLZ, City, Street, Street Number
- Purple badges (#8300E9) for address components in query builder
- Format: `🏠 ColumnName.📮 PLZ` or `🏠 ColumnName.🏙️ City`

**Implementation Details**:
- `isAddressColumn()`: Detection logic (line ~102)
- `looksLikeAddress()`: Pattern matching (line ~122)
- `parseAddress()`: Component extraction (line ~133)
- `showAddressComponentPicker()`: UI for selecting components (line ~422)
- `parseSyntax()`: Handles `%[Column:component]` syntax when evaluating (line ~624)

**Common Patterns**:
```javascript
// Extract full address with PLZ and City on separate line
%[Address:street] + " " + %[Address:number] + "\n" + %[Address:plz] + " " + %[Address:city]

// Just postal code and city
%[Address:plz] + " " + %[Address:city]

// Location field combining components
"📍 " + %[Address:street] + " " + %[Address:number] + ", " + %[Address:city]
```

### Address Merging Feature (NEW)

When Excel has separate columns for address components (common in Austrian/German databases), the Power-Up automatically detects and offers to merge them.

**Detected Column Names** (`detectAddressComponentColumns()` at line ~154):
- **Straße/Street**: `straße`, `strasse`, `street`
- **Ort/City**: `ort`, `city`, `stadt`, `place`
- **PLZ**: `plz`, `postleitzahl`, `postal`, `zip`
- **Number**: `hausnummer`, `hausnr`, `number`, `nr`

**Merge Format**:
```
"Hauptstraße 15, 5020 Salzburg"
(Street Number, PLZ City)
```

**UI Behavior**:
- If address components detected, "🏠 Merged Address" appears at top of column picker
- Shows which columns will be merged: `🏠 Merged Address (from Straße, Ort)`
- Purple badge with component indicator in query builder
- Separator line between merged option and individual columns

**Technical Details**:
- Type: `merged-address`
- Syntax: `%[MERGE:{JSON-encoded components}]`
- Component mapping stored as JSON: `{"street":"Straße","city":"Ort","plz":"PLZ","number":"Hausnummer"}`
- `buildAddressFromComponents()`: Combines available components (line ~167)
- Handles missing components gracefully (e.g., if no PLZ column exists)

**Example Usage**:
```javascript
// Excel has columns: Straße, Hausnummer, PLZ, Ort
// User selects "Merged Address" option
// Result: "Hauptstraße 15, 5020 Salzburg"

// If some columns missing (only Straße and Ort):
// Result: "Hauptstraße, Salzburg"
```

**Common Patterns**:
```javascript
// Use merged address as location
Location: [Select Merged Address option]

// Combine with custom text
"📍 " + %[MERGE:...] + "\n" + "Austria"
```

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

## Attachment Downloader Architecture

### Overview

The Attachment Downloader allows bulk downloading of attachments from Trello cards. Due to Trello's CORS restrictions on their S3 bucket, direct client-side downloads are impossible. The solution uses a **serverless backend proxy**.

**Location**: `js/attachment-downloader.js` (client), `api/download-attachments.js` (backend)

### Why a Backend is Required

**CORS Limitation**: Trello's attachment S3 bucket (`trello-attachments.s3.amazonaws.com`) lacks `Access-Control-Allow-Origin` headers, preventing browser JavaScript from downloading files directly.

**Authentication Change (2021)**: Trello now requires OAuth 1.0 Authorization headers (not query parameters) for downloads. Browsers cannot set these headers for CORS requests.

**Official Statement**: Per Atlassian staff (2022): "Currently, there is no other way" to download attachments from a client-side Power-Up without a backend proxy.

### Architecture Flow

```
Client (Power-Up)                    Backend (Vercel)                Trello API
─────────────────                    ────────────────                ──────────
1. Collect attachments
2. Get Trello token
3. POST /api/download-attachments
   { attachments: [...], token }
                                4. Receive request
                                5. For each attachment:
                                   - Build download URL
                                   - Add OAuth headers
                                   - Download file         ────────> 6. Authenticate
                                                          <──────── 7. Return file
                                8. Create ZIP
9. Receive ZIP blob           <──── 9. Stream ZIP
10. Save to disk
```

### Client-Side Implementation

**Key Method**: `handleDownload()` at line ~560

**Workflow**:
1. Fetch cards (from board or single card)
2. Fetch attachments for each card
3. Prepare attachment metadata array
4. Get Trello token via `t.getRestApi().getToken()`
5. POST to backend with attachments + token
6. Receive ZIP blob
7. Trigger browser download with `saveAs()`

**Backend URL Detection**: `getBackendUrl()` method determines endpoint:
- Local dev: `http://localhost:3000/api/download-attachments`
- Vercel deployment: `https://YOUR_PROJECT.vercel.app/api/download-attachments`
- GitHub Pages: Points to separate Vercel deployment

### Backend Implementation

**File**: `api/download-attachments.js`

**Technology**:
- Node.js serverless function (Vercel)
- `https` module for downloads
- `archiver` for ZIP creation

**Process**:
1. Validate request (attachments array + token)
2. Set response headers for ZIP download
3. Create ZIP archive stream
4. For each attachment:
   - Build Trello API download URL: `/cards/{cardId}/attachments/{id}/download/{fileName}?key=...&token=...`
   - Download file using `https.get()`
   - Add to ZIP under `{cardName}/{fileName}`
   - Handle errors (add ERROR_*.txt)
5. Add `DOWNLOAD_SUMMARY.txt`
6. Finalize and stream ZIP to client

**Error Handling**:
- Individual file failures don't stop the batch
- Failed downloads create `ERROR_{filename}.txt` with details
- Summary includes success/failure counts

### Configuration

**Backend URL**: Update in `js/attachment-downloader.js` → `getBackendUrl()`:
```javascript
return 'https://YOUR_VERCEL_URL/api/download-attachments';
```

**API Key**: Hardcoded in both client and backend (`c9df6f6f1cd31f277375aa5dd43041c8`)

**CORS**: Configured in `vercel.json` with wildcard origin

### Deployment

See [BACKEND_DEPLOYMENT.md](BACKEND_DEPLOYMENT.md) for complete guide.

**Quick Start (Vercel)**:
1. Push to GitHub
2. Import in Vercel dashboard
3. Deploy automatically
4. Update `getBackendUrl()` with Vercel URL
5. Test in Trello

### Limitations

**Vercel Hobby Plan**:
- 10-second function timeout
- 4.5 MB response size limit (for very large ZIPs)

**Workarounds**:
- Upgrade to Pro (60-second timeout)
- Implement chunked downloads
- Use cloud storage (S3, GCS) for large ZIPs

### Debug System

The attachment downloader includes an advanced debug panel:

**Activation**:
- Add `?debug=true` to URL
- Or press `Ctrl+Shift+D`

**Features**:
- Real-time logging with categories (system, API, error, performance)
- API call tracking with timing
- Performance metrics (avg/min/max)
- State snapshots
- Export logs as JSON

**Debug Panel Tabs**:
- **Logs**: All console output with timestamps
- **API Calls**: HTTP requests with status/duration
- **Performance**: Operation timing statistics
- **State**: Snapshots of application state

### Common Issues

**"Backend error: 500"**:
- Check Vercel function logs
- Verify Trello token is valid
- Check network connectivity to Trello API

**"Failed to get Trello authentication token"**:
- User hasn't authorized Power-Up
- Call `t.getRestApi().authorize()` first

**Empty ZIP or Missing Files**:
- Check Vercel logs for download errors
- Verify attachment URLs are accessible
- Check DOWNLOAD_SUMMARY.txt for details

**CORS Errors**:
- Ensure `vercel.json` includes CORS headers
- Verify backend URL is correct
- Check browser console for specific errors

## File Structure Reference

```
├── index_powerup.html          # Legacy entry point (unused)
├── manifest.json               # Power-Up configuration for Trello
├── js/
│   ├── powerup.js              # Trello Power-Up registration (39 lines)
│   ├── main.js                 # Excel importer logic (700+ lines)
│   └── attachment-downloader.js # Attachment downloader client (~1000 lines)
├── html/
│   ├── main.html               # Excel importer UI
│   └── attachment-downloader.html # Attachment downloader UI
├── css/
│   └── styles.css              # Complete styling (~900 lines)
├── assets/
│   ├── icon-dark.svg           # Power-Up icon (dark theme)
│   └── icon-light.svg          # Power-Up icon (light theme)
├── api/                        # ⭐ Serverless backend functions
│   ├── download-attachments.js # Attachment download proxy (~200 lines)
│   └── README.md               # Backend API documentation
├── examples/
│   ├── sample_tasks.xlsx       # Example Excel file
│   ├── sample_tasks.csv        # Example CSV file
│   └── usage_examples.md       # Usage documentation
├── package.json                # ⭐ Node.js dependencies (backend)
├── vercel.json                 # ⭐ Vercel deployment config
├── .gitignore                  # Git ignore rules
├── README.md                   # User documentation
├── PROJECT_SUMMARY.md          # Feature overview
├── DEPLOYMENT_GUIDE.md         # Frontend deployment
├── BACKEND_DEPLOYMENT.md       # ⭐ Backend deployment guide
└── CLAUDE.md                   # This file
```

⭐ = New files for backend functionality

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
