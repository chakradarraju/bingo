var game;
define(["game", "utils"], function(Game, utils) {
  var id = utils.getParam("id");
  var peerid = utils.getParam("peerid");
  if (!id || !peerid) {
    utils.reloadWithGetParams('id=' + utils.generateRandomId() + '&peerid=' + utils.generateRandomId());
  }
  game = new Game(id, peerid);
  document.getElementById('peerlink').value = utils.getBase() + '?id=' + peerid + '&peerid=' + id;

});
