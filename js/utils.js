define([], function() {
  return {
    getParam: function(name) {
      var url = location.href;
      name = name.replace(/[\[\]]/g, "\\$&");
      var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
          results = regex.exec(url);
      if (!results) return null;
      if (!results[2]) return '';
      return decodeURIComponent(results[2].replace(/\+/g, " "));
    },

    reloadWithGetParams: function(params) {
      location.replace(this.getBase() + '?' + params);
    },

    getBase: function() {
      return window.location.href.split('?')[0];
    },

    generateRandomId: function() {
      var result = '';
      for (var i = 0; i < this._ID_SIZE; i++) result += this._ID_CHARS[Math.floor(Math.random() * this._ID_CHARS.length)];
      return result;
    },

    _ID_SIZE: 5,
    _ID_CHARS: '0123456789abcdefghijklmnopqrstuvwxyz',
  };
});
