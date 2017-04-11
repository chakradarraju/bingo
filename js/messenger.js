define([], function() {
  var domain = '@chakradarraju.onsip.com';

  function Messenger(id, otherid) {
    this.id_ = id + domain;
    this.otherid_ = otherid + domain;
    this.userAgent_ = new SIP.UA({uri: this.id_});
    this.userAgent_.on('message', this.onData_.bind(this));
    this.userAgent_.on('registered', function() {
      console.log('registed ' + this.id_);
    }.bind(this));
    this.userAgent_.on('registrationFailed', function() {
      console.log('registration failed ' + this.id_);
    }.bind(this));
    this.callback_ = {};
  }

  Messenger.prototype.send = function(type, value) {
    this.userAgent_.message(this.otherid_, type + '/' + value);
    console.log('Sending message: ' + type + '/' + value);
  };

  Messenger.prototype.setCallback = function(type, fn) {
    if (!this.callback_[type]) this.callback_[type] = [];
    this.callback_[type].push(fn);
  };

  Messenger.prototype.clearCallbacks = function(type) {
    if (type) {
      delete this.callback_[type];
    } else {
      this.callback_ = {};
    }
  };

  Messenger.prototype.onData_ = function(message) {
    var data = message.body;
    console.log('Received message: ' + data);
    var pos = data.indexOf('/');
    console.assert(pos !== -1, 'Unable to determine type of message');
    var type = data.substr(0, pos);
    var value = data.substr(pos + 1);
    if (!this.callback_[type]) return;
    this.callback_[type].forEach(function(e) {
      e(value);
    });
  };

  return Messenger;
});
