// App Hub - Feature Navigation Logic
const APP_KEY = 'c9df6f6f1cd31f277375aa5dd43041c8';
const t = window.TrelloPowerUp.iframe({
  appKey: APP_KEY,
  appName: 'Weinhäupl Power-Up Suite'
});

document.addEventListener('DOMContentLoaded', () => {
  const featureCards = document.querySelectorAll('.feature-card:not(.feature-coming-soon)');

  featureCards.forEach(card => {
    card.addEventListener('click', () => {
      const feature = card.dataset.feature;

      if (feature === 'excel-import') {
        // Open Excel Import modal
        t.modal({
          title: 'Excel to Cards Importer',
          url: t.signUrl('./main.html'),
          height: 650,
          width: 900
        });
      } else if (feature === 'attachment-downloader') {
        // Open Attachment Downloader modal
        t.modal({
          title: 'Attachment Downloader',
          url: t.signUrl('./attachment-downloader.html?source=board'),
          height: 500,
          width: 700
        });
      }
    });
  });
});
