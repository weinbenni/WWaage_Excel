// Serverless function to download Trello attachments with proper authentication
// This bypasses CORS restrictions by running server-side

const https = require('https');
const archiver = require('archiver');

// Trello API key
const APP_KEY = 'c9df6f6f1cd31f277375aa5dd43041c8';

module.exports = async (req, res) => {
  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { attachments, token } = req.body;

    if (!attachments || !Array.isArray(attachments) || attachments.length === 0) {
      return res.status(400).json({ error: 'No attachments provided' });
    }

    if (!token) {
      return res.status(400).json({ error: 'Trello token required' });
    }

    console.log(`Processing ${attachments.length} attachments`);
    console.log(`Token received: ${token.substring(0, 20)}...${token.substring(token.length - 10)}`);

    // Set response headers for ZIP download
    const timestamp = new Date().toISOString().split('T')[0];
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="Trello_Attachments_${timestamp}.zip"`);

    // Create ZIP archive
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });

    // Pipe archive to response
    archive.pipe(res);

    // Track progress
    let processed = 0;
    let failed = 0;

    // Process each attachment
    for (const attachment of attachments) {
      try {
        console.log(`Downloading: ${attachment.name} from card ${attachment.cardName}`);

        let downloadUrl = attachment.url;
        console.log(`Original URL: ${downloadUrl}`);

        // For Trello download URLs, fetch attachment metadata to get proper download URL
        if (downloadUrl.includes('trello.com') && downloadUrl.includes('/download/')) {
          console.log(`Trello download URL detected, fetching attachment metadata...`);

          // Get attachment metadata from Trello API
          const metadataUrl = `https://api.trello.com/1/cards/${attachment.cardId}/attachments/${attachment.id}?key=${APP_KEY}&token=${token}`;
          console.log(`Fetching metadata from: ${metadataUrl.substring(0, 100)}...`);

          try {
            const metadata = await fetchJson(metadataUrl);
            console.log(`Metadata fetched. URL in metadata: ${metadata.url?.substring(0, 100)}`);

            // Use the URL from metadata (might be S3 signed URL)
            if (metadata.url) {
              downloadUrl = metadata.url;
              console.log(`Using URL from metadata`);
            }
          } catch (metaError) {
            console.error(`Failed to fetch metadata: ${metaError.message}`);
            // Fall back to original URL with auth params
            downloadUrl = `https://api.trello.com${downloadUrl.substring(downloadUrl.indexOf('/1/'))}?key=${APP_KEY}&token=${token}`;
            console.log(`Falling back to direct API URL with auth`);
          }
        }

        console.log(`Final download URL: ${downloadUrl.substring(0, 150)}...`);

        // Download attachment
        const fileBuffer = await downloadFile(downloadUrl);

        // Sanitize folder and file names
        const folderName = sanitizeFileName(attachment.cardName);
        const fileName = sanitizeFileName(attachment.name);

        // Add to archive
        archive.append(fileBuffer, { name: `${folderName}/${fileName}` });

        processed++;
        console.log(`✓ Downloaded ${processed}/${attachments.length}: ${attachment.name}`);
      } catch (error) {
        failed++;
        console.error(`✗ Failed to download ${attachment.name}:`, error.message);

        // Add error note to ZIP
        const errorNote = `Failed to download: ${attachment.name}\nError: ${error.message}\nURL: ${attachment.url}\n`;
        archive.append(Buffer.from(errorNote), { name: `${sanitizeFileName(attachment.cardName)}/ERROR_${sanitizeFileName(attachment.name)}.txt` });
      }
    }

    // Add summary file
    const summary = `Trello Attachment Download Summary
=====================================
Total attachments: ${attachments.length}
Successfully downloaded: ${processed}
Failed: ${failed}
Downloaded on: ${new Date().toISOString()}

${failed > 0 ? '\nNote: Check individual ERROR_*.txt files for failed downloads.' : ''}
`;
    archive.append(Buffer.from(summary), { name: 'DOWNLOAD_SUMMARY.txt' });

    // Finalize archive
    await archive.finalize();

    console.log(`✓ ZIP created successfully: ${processed} files, ${failed} errors`);
  } catch (error) {
    console.error('Server error:', error);

    // If headers not sent yet, send error response
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
};

/**
 * Fetch JSON data from URL
 */
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        return;
      }

      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(new Error('Failed to parse JSON'));
        }
      });

      response.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Download file from URL and return as Buffer
 */
function downloadFile(url, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    // Prevent infinite redirect loops
    if (redirectCount > 5) {
      reject(new Error('Too many redirects'));
      return;
    }

    console.log(`Downloading from: ${url.substring(0, 150)}...`);

    https.get(url, (response) => {
      console.log(`Response status: ${response.statusCode}`);

      // Follow redirects
      if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 307) {
        const redirectUrl = response.headers.location;
        console.log(`Following redirect to: ${redirectUrl.substring(0, 150)}...`);
        return downloadFile(redirectUrl, redirectCount + 1)
          .then(resolve)
          .catch(reject);
      }

      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        return;
      }

      const chunks = [];

      response.on('data', (chunk) => {
        chunks.push(chunk);
      });

      response.on('end', () => {
        const buffer = Buffer.concat(chunks);
        console.log(`Downloaded ${buffer.length} bytes`);
        resolve(buffer);
      });

      response.on('error', reject);
    }).on('error', (error) => {
      console.error(`Download error: ${error.message}`);
      reject(error);
    });
  });
}

/**
 * Sanitize file/folder names for cross-platform compatibility
 */
function sanitizeFileName(name) {
  return name
    .replace(/[<>:"/\\|?*]/g, '_') // Replace invalid chars
    .replace(/\s+/g, '_')           // Replace spaces
    .replace(/_{2,}/g, '_')         // Collapse multiple underscores
    .replace(/^_|_$/g, '')          // Trim underscores
    .substring(0, 200);             // Limit length
}
