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

        // Use the attachment URL directly
        // Backend can access S3 URLs without CORS restrictions
        // The attachment.url from Trello already contains necessary authentication/signature
        const downloadUrl = attachment.url;

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
 * Download file from URL and return as Buffer
 */
function downloadFile(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      // Follow redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        return downloadFile(response.headers.location)
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
        resolve(Buffer.concat(chunks));
      });

      response.on('error', reject);
    }).on('error', reject);
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
