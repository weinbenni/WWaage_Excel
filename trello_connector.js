// This file should be referenced in your manifest.json
// Place this code in a separate connector.js file

window.TrelloPowerUps.initialize({
  'board-buttons': function(t, options) {
    return [{
      icon: {
        dark: 'https://cdn-icons-png.flaticon.com/512/732/732220.png',
        light: 'https://cdn-icons-png.flaticon.com/512/732/732220.png'
      },
      text: 'Import Excel',
      callback: function(t) {
        return t.modal({
          title: 'Import Excel Data',
          url: './index.html',
          fullscreen: false,
          height: 600
        });
      }
    }];
  },
  
  'show-settings': function(t, options) {
    return t.popup({
      title: 'Excel Importer Settings',
      items: [
        {
          text: 'About this Power-Up',
          callback: function(t) {
            return t.alert({
              message: 'Excel Card Importer v1.0\n\nImport Excel spreadsheets as Trello cards.',
              duration: 5
            });
          }
        }
      ]
    });
  }
});