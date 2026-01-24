// Attachment Downloader - Trello Power-Up Feature
const t = window.TrelloPowerUp.iframe();
const APP_KEY = 'c9df6f6f1cd31f277375aa5dd43041c8';

class AttachmentDownloader {
  constructor() {
    this.t = t;
    this.source = null; // 'board' or 'card'
    this.boardId = null;
    this.cardId = null;
    this.lists = [];
    this.init();
  }

  async init() {
    try {
      // Determine source from URL params
      const urlParams = new URLSearchParams(window.location.search);
      this.source = urlParams.get('source') || 'board';

      // Get context
      const context = await this.t.getContext();
      this.boardId = context.board;
      this.cardId = context.card;

      // Update UI based on source
      this.updateUIForSource();

      // Load lists if from board
      if (this.source === 'board') {
        await this.loadLists();
      }

      // Set up event listeners
      this.setupEventListeners();
    } catch (error) {
      console.error('Initialization error:', error);
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
    try {
      const token = await this.t.getRestApi().getToken();
      const response = await fetch(
        `https://api.trello.com/1/boards/${this.boardId}/lists?key=${APP_KEY}&token=${token}`
      );

      if (!response.ok) {
        throw new Error('Failed to load lists');
      }

      this.lists = await response.json();
      this.populateListSelector();
    } catch (error) {
      console.error('Error loading lists:', error);
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
  }

  async handleDownload() {
    const downloadBtn = document.getElementById('downloadBtn');
    const progressSection = document.getElementById('progressSection');
    const statusSection = document.getElementById('statusSection');

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

      if (cards.length === 0) {
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

      if (cardsToDownload.length === 0) {
        this.showStatus('No attachments found in selected cards', 'info');
        downloadBtn.disabled = false;
        progressSection.style.display = 'none';
        return;
      }

      const totalAttachments = cardsToDownload.reduce(
        (sum, card) => sum + card.attachments.length,
        0
      );

      this.updateProgress(40, `Found ${totalAttachments} attachment(s). Downloading...`);

      // Create ZIP file
      const zip = new JSZip();
      let downloadedCount = 0;

      for (const card of cardsToDownload) {
        const cardFolderName = this.sanitizeFileName(card.name);
        const cardFolder = zip.folder(cardFolderName);

        for (const attachment of card.attachments) {
          try {
            // Download attachment
            const blob = await this.downloadAttachment(attachment.url);

            // Add to ZIP
            const fileName = this.sanitizeFileName(attachment.name);
            cardFolder.file(fileName, blob);

            downloadedCount++;
            const progress = 40 + (downloadedCount / totalAttachments) * 50;
            this.updateProgress(
              progress,
              `Downloading ${downloadedCount}/${totalAttachments} attachments...`
            );
          } catch (error) {
            console.error(`Failed to download ${attachment.name}:`, error);
            this.showStatus(`Failed to download: ${attachment.name}`, 'warning');
          }
        }
      }

      // Generate and save ZIP
      this.updateProgress(95, 'Creating ZIP file...');
      const zipBlob = await zip.generateAsync({ type: 'blob' });

      // Download ZIP
      const zipFileName = this.source === 'card'
        ? `${this.sanitizeFileName(cardsToDownload[0].name)}_attachments.zip`
        : `Trello_Board_Attachments_${new Date().toISOString().split('T')[0]}.zip`;

      saveAs(zipBlob, zipFileName);

      // Success
      this.updateProgress(100, 'Download complete!');
      this.showStatus(
        `✅ Successfully downloaded ${downloadedCount} attachments from ${cardsToDownload.length} card(s)`,
        'success'
      );

      setTimeout(() => {
        progressSection.style.display = 'none';
      }, 3000);

    } catch (error) {
      console.error('Download error:', error);
      this.showStatus(`Error: ${error.message}`, 'error');
      progressSection.style.display = 'none';
    } finally {
      downloadBtn.disabled = false;
    }
  }

  async getCardsFromCard() {
    try {
      const token = await this.t.getRestApi().getToken();
      const response = await fetch(
        `https://api.trello.com/1/cards/${this.cardId}?key=${APP_KEY}&token=${token}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch card');
      }

      const card = await response.json();
      return [card];
    } catch (error) {
      console.error('Error fetching card:', error);
      throw error;
    }
  }

  async getCardsFromBoard() {
    try {
      const listSelect = document.getElementById('listSelect');
      const selectedListId = listSelect.value;

      const token = await this.t.getRestApi().getToken();
      let url;

      if (selectedListId === 'all') {
        // Get all cards from board
        url = `https://api.trello.com/1/boards/${this.boardId}/cards?key=${APP_KEY}&token=${token}`;
      } else {
        // Get cards from specific list
        url = `https://api.trello.com/1/lists/${selectedListId}/cards?key=${APP_KEY}&token=${token}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch cards');
      }

      const cards = await response.json();
      return cards;
    } catch (error) {
      console.error('Error fetching cards:', error);
      throw error;
    }
  }

  async fetchAttachmentsForCards(cards) {
    const token = await this.t.getRestApi().getToken();

    const cardsWithAttachments = await Promise.all(
      cards.map(async (card) => {
        try {
          const response = await fetch(
            `https://api.trello.com/1/cards/${card.id}/attachments?key=${APP_KEY}&token=${token}`
          );

          if (!response.ok) {
            console.error(`Failed to fetch attachments for card ${card.id}`);
            return { ...card, attachments: [] };
          }

          const attachments = await response.json();
          return { ...card, attachments };
        } catch (error) {
          console.error(`Error fetching attachments for card ${card.id}:`, error);
          return { ...card, attachments: [] };
        }
      })
    );

    return cardsWithAttachments;
  }

  async downloadAttachment(url) {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error('Error downloading attachment:', error);
      throw error;
    }
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
