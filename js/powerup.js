// Trello Power-Up Initialization
window.TrelloPowerUp.initialize({
  'board-buttons': function(t, options) {
    return [{
      icon: {
        dark: './assets/icon-dark.svg',
        light: './assets/icon-light.svg'
      },
      text: 'Import Excel',
      callback: function(t) {
        return t.modal({
          title: 'Excel to Cards Importer',
          url: './html/main.html',
          accentColor: '#0079BF',
          height: 650,
          width: 900
        });
      }
    }];
  },
  'card-buttons': function(t, options) {
    return [{
      icon: {
        dark: './assets/icon-dark.svg',
        light: './assets/icon-light.svg'
      },
      text: 'Import Excel',
      callback: function(t) {
        return t.modal({
          title: 'Excel to Cards Importer',
          url: './html/main.html',
          accentColor: '#0079BF',
          height: 650,
          width: 900
        });
      }
    }];
  }
}, {
  appKey: 'YOUR_TRELLO_APP_KEY',
  appName: 'Excel to Cards Importer',
  appAuthor: 'Excel PowerUp Developer'
});