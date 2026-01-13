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
          url: t.signUrl('./html/main.html'),
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
          url: t.signUrl('./html/main.html'),
          accentColor: '#0079BF',
          height: 650,
          width: 900
        });
      }
    }];
  }
}, {
  appKey: 'ATTAe7aab23c74182ed4eb51f7ad8119aa2a67fef40401c693be11599ae157dd0e931A5F9174',
  appName: 'Excel to Cards Importer',
  appAuthor: 'BWN'
});