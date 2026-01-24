# Debug Mode - Attachment Downloader

Advanced debugging system for troubleshooting and monitoring the Attachment Downloader feature.

## Enabling Debug Mode

### Method 1: URL Parameter (Auto-enable)
Add `?debug=true` to the URL when opening the Attachment Downloader:
```
https://yoursite.com/html/attachment-downloader.html?source=board&debug=true
```

### Method 2: Keyboard Shortcut
Press `Ctrl + Shift + D` to toggle the debug panel on/off at any time.

### Method 3: UI Button
Click the 🐛 bug icon in the top-right corner of the interface.

## Debug Panel Features

### 📋 Logs Tab
- Real-time logging with timestamps
- Color-coded by category:
  - **Red** (System): System events, initialization
  - **Blue** (API): API requests and responses
  - **Red** (Error): Errors and failures
  - **Yellow** (Warning): Warnings and non-critical issues
  - **Green** (Success): Successful operations
  - **Purple** (Performance): Performance metrics
  - **Gray** (Info): General information
- Shows last 100 log entries
- Expandable data objects for detailed inspection

### 🌐 API Calls Tab
- Complete list of all Trello API calls
- Request details: Method, URL, Status Code
- Response time tracking
- Response data preview
- Last 50 API calls displayed

### ⚡ Performance Tab
- Operation timing statistics:
  - **Count**: Number of times operation was executed
  - **Avg**: Average execution time
  - **Min**: Fastest execution time
  - **Max**: Slowest execution time
- Tracked operations:
  - `init`: Application initialization
  - `loadLists`: Loading Trello lists
  - `getCardsFromCard`: Fetching single card
  - `getCardsFromBoard`: Fetching cards from board/list
  - `fetchAttachmentsForCards`: Fetching attachment metadata
  - `downloadAttachment`: Downloading individual files
  - `zipGeneration`: Creating ZIP archive
  - `fullDownload`: Complete download process

### 📊 State Tab
- State snapshots at critical points:
  - Initial context (board ID, card ID, source)
  - Pre-download state (cards to download, attachment count)
- JSON formatted state data
- Last 20 snapshots displayed

## Debug Controls

### 🗑️ Clear Logs
Clears all logs, API calls, and state snapshots. Performance metrics are preserved.

### 💾 Export Logs
Downloads a complete debug report as JSON file containing:
- All log entries with timestamps
- Complete API call history with responses
- Performance metrics
- State snapshots
- Session duration

File naming: `attachment-downloader-debug-[timestamp].json`

### ➖/➕ Minimize/Maximize
Collapse or expand the debug panel to save screen space while keeping it active.

## Debug Log Categories

### System Events
- Application initialization
- Debug mode activation
- Major state changes

Example:
```
[0ms] [SYSTEM] DEBUG MODE ENABLED
[234ms] [SYSTEM] === DOWNLOAD STARTED ===
[5678ms] [SYSTEM] === DOWNLOAD COMPLETE ===
```

### API Tracking
- Every Trello API request
- Response status codes
- Request duration
- Response data summaries

Example:
```
[456ms] [API] GET /1/boards/{id}/lists - 200 (123ms)
[789ms] [API] GET /1/cards/{id}/attachments - 200 (89ms)
```

### Performance Metrics
- Operation completion times
- Running averages
- Performance tracking

Example:
```
[1234ms] [PERFORMANCE] Performance: loadLists completed in 234ms
[5678ms] [PERFORMANCE] Performance: fullDownload completed in 4321ms
```

### Error Tracking
- API failures
- Download errors
- Exception stack traces

Example:
```
[2345ms] [ERROR] Failed to download attachment: Network timeout
[3456ms] [ERROR] DOWNLOAD FAILED: Insufficient permissions
```

## Interpreting Performance Data

### Good Performance Benchmarks
- `init`: < 500ms
- `loadLists`: < 300ms
- `getCardsFromBoard`: < 500ms (depends on card count)
- `fetchAttachmentsForCards`: < 2000ms (depends on card count)
- `downloadAttachment`: < 1000ms per file (depends on file size)
- `zipGeneration`: < 5000ms (depends on total size)

### Performance Bottlenecks
If you see slow operations:
1. **API Calls (> 1000ms)**: Network issues or Trello API throttling
2. **downloadAttachment (> 3000ms)**: Large files or slow network
3. **zipGeneration (> 10000ms)**: Too many files or large total size
4. **fullDownload (> 60000ms)**: Consider reducing scope or splitting downloads

## Troubleshooting with Debug Mode

### No Cards Found
Check logs for:
```
[INFO] Fetched 0 cards
```
- Verify board/list selection
- Check Trello permissions
- Ensure cards exist in selected scope

### API Errors
Look for API tab entries with status codes:
- **401**: Authentication failure
- **403**: Permission denied
- **404**: Resource not found
- **429**: Rate limit exceeded
- **500**: Trello server error

### Download Failures
Check for:
```
[ERROR] Failed to download: filename.pdf
```
- Attachment URL may be expired
- Network connectivity issues
- CORS restrictions

### ZIP Generation Issues
Monitor:
```
[PERFORMANCE] zipGeneration completed in Xms
```
- If > 30000ms: Files may be too large
- If fails: Browser memory limit exceeded

## Debug Log Export Structure

```json
{
  "timestamp": "2026-01-24T12:34:56.789Z",
  "duration": 12345,
  "logs": [
    {
      "timestamp": 123,
      "time": "2026-01-24T12:34:56.890Z",
      "category": "system",
      "message": "Initializing...",
      "data": {...}
    }
  ],
  "apiCalls": [
    {
      "timestamp": 456,
      "method": "GET",
      "url": "https://api.trello.com/...",
      "status": 200,
      "duration": 123,
      "response": {...}
    }
  ],
  "performance": {
    "init": {
      "count": 1,
      "totalTime": 234,
      "avgTime": 234,
      "minTime": 234,
      "maxTime": 234
    }
  },
  "stateSnapshots": [
    {
      "timestamp": 0,
      "label": "Initial Context",
      "state": {...}
    }
  ]
}
```

## Best Practices

1. **Enable debug mode before reproducing issues**
2. **Export logs immediately after errors occur**
3. **Include exported JSON in bug reports**
4. **Monitor performance tab for optimization opportunities**
5. **Clear logs between test runs for clarity**
6. **Check API tab for Trello service issues**

## Privacy Note

Debug logs may contain:
- Board IDs and names
- Card IDs and titles
- Attachment names and URLs
- API tokens (automatically redacted in exports)

Do not share debug exports publicly without reviewing sensitive data.
