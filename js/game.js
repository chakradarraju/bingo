define(["messenger", "domcontroller"], function(Messenger, DomController) {

  function Game(id, peerid) {
    // ID data
    this.id_ = id;
    this.peerid_ = peerid;

    // Game data
    this.empty_ = true;
    this.order_ = [];
    this.selected_ = this.emptySelected_();
    this.isMyTurn_ = true;
    this.gameOver_ = false;
    this.won_ = true;

    // Components
    this.messenger_ = new Messenger(id, peerid);
    this.domController_ = new DomController();

    // Init
    this.init_();
  }

  Game.prototype.init_ = function() {
    this.messenger_.setCallback('sync', this.sendSyncData_.bind(this));
    this.messenger_.setCallback('syncdata', this.sync_.bind(this));
    this.messenger_.setCallback('select', this.onPeerSelect_.bind(this));
    this.messenger_.setCallback('gameover', this.onGameOver_.bind(this));
    this.domController_.onElemClick(this.onElemClick_.bind(this));
    this.messenger_.send('sync', '');
    if (!localStorage.getItem(this.id_)) localStorage.setItem(this.id_, this.randomPermutation_().join(','));
    this.order_ = this.parseArrayOfInt_(localStorage.getItem(this.id_));
    this.refreshDom_();
  };

  Game.prototype.onGameOver_ = function(message) {
    var shouldSend = !this.gameOver_;
    var parts = message.split('/');
    this.setGameOver_(parts[0] === 'lost');
    if (shouldSend) this.sendGameOver_();
    this.domController_.showOpponentBoard(this.parseArrayOfInt_(parts[1]), this.selected_);
  };

  Game.prototype.setGameData_ = function(isMyTurn, selected) {
    this.empty_ = false;
    this.selected_ = selected;
    this.isMyTurn_ = isMyTurn;
    this.refreshDom_();
  };

  Game.prototype.onElemClick_ = function(i) {
    if (!this.isMyTurn_ || this.selected_[this.order_[i]]) return;
    this.messenger_.send('select', this.order_[i]);
    this.select_(this.order_[i]);
    this.isMyTurn_ = false;
  };

  Game.prototype.onPeerSelect_ = function(value) {
    var val = parseInt(value);
    console.assert(!this.gameOver_, 'Got select after game over.');
    console.assert(!this.isMyTurn_, 'Got select when it is your turn to play.');
    console.assert(!this.selected_[val], 'Got select for already selected number.');
    this.select_(val);
    this.isMyTurn_ = true;
    this.updateMessage_();
  };

  Game.prototype.select_ = function(val) {
    console.assert(val < 25, 'Got invalid value');
    this.selected_[val] = true;
    this.domController_.setSelected(this.order_.indexOf(val), true);
    this.updateBingo_();
  };

  Game.prototype.updateBingo_ = function() {
    var x = [0, 5, 10, 15, 20, 0, 1, 2, 3, 4, 0, 4];
    var dx = [1, 1, 1, 1, 1, 5, 5, 5, 5, 5, 6, 4];
    var count = 0;
    console.assert(x.length === dx.length, 'x and dx should have same number of elements');
    for (var i = 0; i < x.length; i++) {
      var full = true;
      for (var j = 0; j < 5 && full; j++) full &= this.selected_[this.order_[x[i] + dx[i] * j]];
      if (full) count++;
    }
    this.domController_.bingo(count);
    if (count > 4 && this.isMyTurn_) {
      this.setGameOver_(true);
      this.sendGameOver_();
    }
  };

  Game.prototype.refreshDom_ = function() {
    for (var i = 0; i < 25; i++) {
      this.domController_.setLabel(i, this.order_[i] + 1);
      this.domController_.setSelected(i, this.selected_[this.order_[i]]);
    }
    this.updateBingo_();
    this.updateMessage_();
  };

  Game.prototype.updateMessage_ = function() {
    this.domController_.showMessage(this.isMyTurn_ ? 'Your turn' : 'Opponent turn');
  };

  Game.prototype.sendSyncData_ = function() {
    if (this.empty_) this.setGameData_(true, this.emptySelected_());
    this.messenger_.send('syncdata', this.serialize_());
    if (this.gameOver_) this.sendGameOver_();
  };

  Game.prototype.sync_ = function(value) {
    this.deserialize_(value);
  };

  Game.prototype.serialize_ = function() {
    var selectedElems = [];
    for (var i = 0; i < 25; i++) if (this.selected_[i]) selectedElems.push(i);
    return [this.isMyTurn_ ? 'M' : 'Y', selectedElems.join(',')].join('/');
  };

  Game.prototype.deserialize_ = function(serialized) {
    console.log('deserializing: ' + serialized);
    var parts = serialized.split('/');
    console.assert(parts.length === 2, 'Invalid sync data');
    var selectedElems = this.parseArrayOfInt_(parts[1]);
    console.assert(selectedElems.length < 26, 'Wrong number of selected: ' + serialized);
    var selected = this.emptySelected_();
    selectedElems.forEach(function(elem) { selected[elem] = true; });
    console.assert(parts[0] === 'M' || parts[0] === 'Y', 'Invalid serialized data: ' + serialized);
    this.setGameData_(parts[0] === 'Y', selected);
  };

  Game.prototype.randomPermutation_ = function() {
    var arr = [];
    for (var i = 0; i < 25; i++) arr.push(i);
    for (var i = 0; i < 25; i++) {
      var ni = i + Math.floor(Math.random() * (25 - i));
      var t = arr[i];
      arr[i] = arr[ni];
      arr[ni] = t;
    }
    return arr;
  };

  Game.prototype.emptySelected_ = function() {
    var arr = [];
    for (var i = 0; i < 25; i++) arr.push(false);
    return arr;
  };

  Game.prototype.parseArrayOfInt_ = function(str) {
    return str.split(',').map(function(e) { return parseInt(e); });
  };

  Game.prototype.sendGameOver_ = function() {
    this.messenger_.send('gameover', [this.won_ ? 'won' : 'lost', this.order_.join(',')].join('/'));
  };

  Game.prototype.setGameOver_ = function(win) {
    this.gameOver_ = true;
    this.won_ = win;
    this.domController_.showMessage(this.won_ ? 'You won' : 'Opponent won');
  };

  return Game;
});

