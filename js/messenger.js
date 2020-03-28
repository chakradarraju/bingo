define(function() {
  function Messenger(id, otherid) {
    this.id_ = id;
    this.otherid_ = otherid;
    this.peer_ = new Peer(id, {secure: true});
    this.connection_ = null;
    this.callback_ = {};
    this.buffer_ = [];
    this.init_();
  }

  Messenger.prototype.send = function(type, value) {
    if (this.connection_) {
      this.connection_.send(type + '/' + value);
      console.log('Sending message: ' + type + '/' + value);
    } else {
      this.buffer_.push(type + '/' + value);
    }
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

  Messenger.prototype.init_ = function() {
    this.peer_.on('open', function(id) {
      console.log('on open connecting to: ' + this.otherid_);
      this.setConnection_(this.peer_.connect(this.otherid_));
    }.bind(this));
    this.peer_.on('connection', function(connection) {
      this.buffer_ = [];
      console.log('on connection');
      this.setConnection_(connection);
    }.bind(this));
    this.peer_.on('error', function(err) {
      console.error('peer error: ' + err);
    });
  };

  Messenger.prototype.setConnection_ = function(connection) {
    console.log('connection set');
    this.connection_ = connection;
    this.connection_.on('error', this.onError_.bind(this));
    this.connection_.on('open', this.onOpen_.bind(this));
  };

  Messenger.prototype.onOpen_ = function() {
    this.connection_.on('data', this.onData_.bind(this));
    console.log('Sending buffered messages: ' + this.buffer_.join(','));
    this.buffer_.forEach(function(message) {
      this.connection_.send(message);
    }.bind(this));
    this.buffer_ = [];
  }

  Messenger.prototype.onData_ = function(data) {
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

  Messenger.prototype.onError_ = function(err) {
    console.error('error while connecting to ' + this.otherid_ + ': ' + err);
  };

  return Messenger;
});
