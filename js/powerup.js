// Trello Power-Up Initialization
window.TrelloPowerUp.initialize({
  'board-buttons': function(t, options) {
    return [{
      icon: {
        dark: 'https://weinbenni.github.io/WWaage_Excel/assets/icon-dark.svg',
        light: 'https://weinbenni.github.io/WWaage_Excel/assets/icon-light.svg'
      },
      text: 'Weinhäupl Suite',
      callback: function(t) {
        return t.modal({
          title: 'Weinhäupl Power-Up Suite',
          url: t.signUrl('./html/app-hub.html'),
          accentColor: '#F71635',
          height: 600,
          width: 800
        });
      }
    }];
  },
  'card-buttons': function(t, options) {
    return [{
      icon: {
        dark: 'https://weinbenni.github.io/WWaage_Excel/assets/icon-dark.svg',
        light: 'https://weinbenni.github.io/WWaage_Excel/assets/icon-light.svg'
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
});