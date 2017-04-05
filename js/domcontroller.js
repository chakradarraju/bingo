define([], function() {
  function DomController() {
    this.message_ = document.getElementById('message');
    this.board_ = document.getElementById('board');
    this.opponent_ = document.getElementById('opponent');
		this.bingo_ = document.getElementById('bingo');
    this.elems_ = [];
    this.callback_ = null;

    this.init_();
  };

  DomController.prototype.init_ = function() {
    this.buildBoard_(this.board_, true);
    this.buildBoard_(this.opponent_, false);
    var bingo = "BINGO";
		for (var i = 0; i < 5; i++) {
      var c = document.createElement('div');
      c.innerHTML = bingo[i];
      c.classList.add('bingo');
      this.bingo_.appendChild(c);
    }
  };

  DomController.prototype.buildBoard_ = function(container, clickable) {
    for (var i = 0; i < 5; i++) {
      var row = document.createElement('div');
      container.appendChild(row);
      for (var j = 0; j < 5; j++) {
        var cell = document.createElement('div');
        cell.classList.add('cell');
        if (clickable) {
          cell.addEventListener('click', function (i) {
            return this.handleClick_.bind(this, i);
          }.bind(this)(this.elems_.length));
        }
        row.appendChild(cell);
        this.elems_.push(cell);
      }
    }
  };

  DomController.prototype.bingo = function(n) {
    if (n > 5) n = 5;
    for (var i = 0; i < n; i++) this.bingo_.childNodes[i].classList.add('done');
  };

  DomController.prototype.showOpponentBoard = function(order, selected) {
    this.opponent_.classList.remove('hidden');
    var cells = this.opponent_.getElementsByClassName('cell');
    console.assert(cells.length === 25, 'broken opponent board');
    for (var i = 0; i < 25; i++) {
      cells[i].innerHTML = order[i] + 1;
      if (selected[order[i]]) cells[i].classList.add('selected');
    }
  };

  DomController.prototype.setLabel = function(i, label) {
    this.elems_[i].innerHTML = label;
  };

  DomController.prototype.setSelected = function(i, selected) {
    if (selected) {
      this.elems_[i].classList.add('selected');
    } else {
      this.elems_[i].classList.remove('selected');
    }
  };

  DomController.prototype.showMessage = function(message) {
    this.message_.innerHTML = message;
  };

  DomController.prototype.onElemClick = function(callback) {
    this.callback_ = callback;
  };

  DomController.prototype.handleClick_ = function(i) {
    this.callback_(i);
  };

  return DomController;
});
