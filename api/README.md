# Serverless API Functions

This directory contains serverless functions that run on Vercel (or other serverless platforms).

## Functions

### `download-attachments.js`

**Purpose**: Downloads Trello attachments with proper OAuth authentication, bypassing browser CORS restrictions.

**Endpoint**: `POST /api/download-attachments`

**Request Body**:
```json
{
  "attachments": [
    {
      "id": "attachment-id",
      "cardId": "card-id",
      "cardName": "Card Name",
      "name": "filename.jpg",
      "fileName": "filename.jpg",
      "url": "https://trello-attachments.s3.amazonaws.com/...",
      "isUpload": true,
      "bytes": 123456
    }
  ],
  "token": "trello-user-token"
}
```

**Response**: ZIP file (binary stream)

**Headers**:
- `Content-Type: application/zip`
- `Content-Disposition: attachment; filename="Trello_Attachments_2024-01-26.zip"`

**Features**:
- Downloads all attachments using authenticated Trello API requests
- Creates ZIP file with folder structure (card name → attachments)
- Handles errors gracefully (adds ERROR_*.txt files for failed downloads)
- Includes DOWNLOAD_SUMMARY.txt with statistics
- Supports redirects and large files
- Maximum compression (level 9)

**Error Handling**:
- 400: Missing attachments or token
- 401: Invalid Trello token
- 500: Server error (network, Trello API, etc.)

**Dependencies**:
- `archiver`: ZIP file creation

**Environment Variables**:
- None required (uses hardcoded API key from client)

**Limitations**:
- Vercel Hobby: 10-second timeout, 4.5 MB response size
- Vercel Pro: 60-second timeout, 4.5 MB response size
- For very large downloads, consider streaming or chunking

## Local Development

```bash
# Install dependencies
npm install

# Start local Vercel dev server
vercel dev

# Or use npm script
npm run dev
```

The function will be available at:
`http://localhost:3000/api/download-attachments`

## Testing

### Using curl:

```bash
curl -X POST http://localhost:3000/api/download-attachments \
  -H "Content-Type: application/json" \
  -d @test-request.json \
  --output test.zip
```

Where `test-request.json`:
```json
{
  "attachments": [
    {
      "id": "697525298829c86b7b6a8fad",
      "cardId": "696fb7c6600b2b935e3f9e06",
      "cardName": "Test Card",
      "name": "test.png",
      "fileName": "test.png",
      "url": "https://trello.com/1/cards/696fb7c6600b2b935e3f9e06/attachments/697525298829c86b7b6a8fad/download/test.png"
    }
  ],
  "token": "YOUR_TRELLO_TOKEN"
}
```

### Using JavaScript:

```javascript
const response = await fetch('http://localhost:3000/api/download-attachments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    attachments: [...],
    token: 'YOUR_TRELLO_TOKEN'
  })
});

const blob = await response.blob();
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'attachments.zip';
a.click();
```

## Deployment

See [BACKEND_DEPLOYMENT.md](../BACKEND_DEPLOYMENT.md) for detailed deployment instructions.

## Adding New Functions

To add a new serverless function:

1. Create `api/your-function.js`
2. Export handler: `module.exports = async (req, res) => { ... }`
3. It will automatically be available at `/api/your-function`

Example:
```javascript
// api/hello.js
module.exports = async (req, res) => {
  res.status(200).json({ message: 'Hello World' });
};
```

Access at: `https://your-project.vercel.app/api/hello`
