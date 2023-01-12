var game = game || {};

game.bj = {};
game.bj.player1 = {
  // player stores position but also score, active powerup, chains, xv/yv, basically anything player-related
};

game.bj.player2 = {
  // player2 is for multiplayer (not yet implemented)
};

game.bj.vegetables = [];

function handleKey(e) {

}

function initializePlayer(pl) {
  pl.width = 75;
  pl.height = 50;
  pl.x = game.width/2 - pl.width/2;
  pl.y = 50;
  pl.xv = 0;
  pl.yv = 0;
  pl.score = 0;
  pl.power = null;
  pl.item = null;
}

initializePlayer(game.bj.player1);

let availableVegetables = [ "carrot", "broccoli", "potato" ];

function populateVegetableProperties(v) {
  let type = v.type;
  let prop = {
    width: {
      carrot: 220,
      broccoli: 150,
      potato: 155
    },
    height: {
      carrot: 45,
      broccoli: 115,
      potato: 60
    },
    value: {
      carrot: 2000,
      broccoli: 1500,
      potato: 1000
    }
  };
  let keys = Object.keys(prop);
  for (let i = 0; i < keys.length; i++) {
    v[keys[i]] = prop[keys[i]][v.type];
  }
}

function tick() { // update literally everything



}

function spawnVegetable(seed) {
  let s = seed || Array.from({length: 10}, () => Math.random());

  let v = {};
  v.type = availableVegetables[Math.floor(s[0] * 3)];
  v.fromRight = Math.floor(s[1] * 2);
  populateVegetableProperties(v);

  return v;
}

//alert(JSON.stringify(spawnVegetable()));

// on server, this will send a list of objects back to the client to be displayed
// it's pretty similar on client actually
function makeDisplayList() {
  let dl = {};
  dl.vegetables = [];
  
  for (let i = 0; i < game.bj.vegetables.length; i++) {
    dl.vegetables[i] = JSON.parse(JSON.stringify(game.bj.vegetables[i]));
  }
  dl.player = JSON.parse(JSON.stringify(game.bj.player1));

  return dl;
}