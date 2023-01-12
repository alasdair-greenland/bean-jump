// this file is for the code for the SINGLEPLAYER mode
// none of this stuff relates to MULTIPLAYER at all
// look in server_multiplayer_game for that

const { achievements } = require("./achievements.js");

let univ = {

  makeGame: function(socket) {

    let game = {};

    game.socket = socket;

    game.width = 1350;
    game.height = 650;

    game.bj = {};

    game.bj.powerups = [];

    game.bj.player1 = {
      // player stores position but also score, active powerup, chains, xv/yv, basically anything player-related
    };

    

    game.bj.player2 = {
      // player2 is for multiplayer (not yet implemented)
    };

    game.bj.vegetables = [];

    game.initializePlayer = function(pl) {
      pl.width = 75;
      pl.height = 50;
      pl.x = game.width/2 - pl.width/2;
      pl.y = 50;
      pl.xv = 0;
      pl.yv = 0;
      pl.score = 0;
      pl.power = null;
      pl.item = null;
      pl.started = false;
      pl.chainType = null;
      pl.chainLength = 0;
      pl.hits = [];

      pl.achievements = univ.achievements[game.socket.id];

      pl.arrow = 0;
      pl.double = 0;
      pl.shield = 0;
      pl.surge = 0;
      pl.slow = 0;

      pl.bestCarrotChain = 0;
      pl.bestBroccoliChain = 0;
      pl.bestPotatoChain = 0;
    }

    game.initializePlayer(game.bj.player1);

    game.moveModif = 1;

    game.powerupBreak = 100000;

    game.updatePlayer = function(pl) {
      if (pl.started) {
        let preScore = Math.floor(pl.score / game.powerupBreak);
        game.ticksSinceStart++;
        pl.px = pl.x;
        pl.py = pl.y;
        pl.pxv = pl.xv;
        pl.pyv = pl.yv;

        if (pl.arrow <= 0) {
          pl.x += pl.xv * game.moveModif;
          pl.y += pl.yv * game.moveModif;
          pl.yv += 6 * game.moveModif;
          if (pl.stop && pl.xv != 0) {
            if (pl.xv > 0) {
              pl.xv -= 14 * game.moveModif;
              pl.xv = Math.max(pl.xv, 0);
            }
            else {
              pl.xv += 14 * game.moveModif;
              pl.xv = Math.min(pl.xv, 0);
            }
          }
        }

        pl.hits = [];

        pl.x = Math.max(0, Math.min(pl.x, game.width - pl.width)); // can't go off the edges

        pl.nextyv = pl.yv;

        let newPowerups = [];
        for (let i = game.bj.powerups.length - 1; i >= 0; i--) {
          let p = game.bj.powerups[i];
          if (pl.x + pl.width > p.x - 15 && pl.x < p.x + 15 && pl.y + pl.height > p.y - 15 && pl.y < p.y + 15) {
            p.effect();
          }
          else {
            newPowerups.push(p);
          }
        }
        game.bj.powerups = newPowerups;

        if (pl.slow) {
          if (pl.shield > 0) pl.shield -= 0.4;
          if (pl.double > 0) pl.double -= 0.4;
          if (pl.surge > 0) pl.surge -= 0.4;
          if (pl.arrow > 0) pl.arrow -= 0.4;
        }
        else {
          if (pl.shield > 0) pl.shield--;
          if (pl.double > 0) pl.double--;
          if (pl.surge > 0) pl.surge--;
          if (pl.arrow > 0) pl.arrow--;
        }
        if (pl.slow > 0) pl.slow--;

        let possibleColliders = [];
        let collision = false;

        for (let i = 0; i < game.bj.vegetables.length; i++) {
          let v = game.bj.vegetables[i];

          if (v.dead) continue;

          if (pl.y + pl.height < v.y) continue;
          if (pl.x + pl.width < v.x) continue;
          if (pl.y > v.y + v.height) continue;
          if (pl.x > v.x + v.width) continue;

          // at this point, we definitely overlap
          // so now we need to figure out where on the models the collision happened

          if (pl.shield > 0) { // shield active
            possibleColliders.push(v);
            collision = true;
            continue;
          }
          if (pl.py + pl.height < v.y + 20) { // high collision (from top)
            possibleColliders.push(v);
            collision = true;
            continue;
          }
          else { // too low, so player dies :(
            game.endGame();
            return;
          }
        }
        if (collision) {
          possibleColliders.sort( (a, b) => { return a.y - b.y; } );
          collide(game, pl, possibleColliders[0]);
        }

        let postScore = Math.floor(pl.score / game.powerupBreak);

        if (preScore != postScore) {
          if (postScore % 2 == 1) {
            game.addPowerup("powerups");
          }
          else {
            game.addPowerup("items");
          }
        }

        pl.yv = pl.nextyv;

        if (pl.y > game.height + 20) {
          game.endGame();
          return;
        }
      }
    }

    game.availableVegetables = [ "carrot", "broccoli", "potato" ];

    game.populateVegetableProperties = function(v) {
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
          carrot: Math.round(2000 * game.difficulty),
          broccoli: Math.round(1500 * game.difficulty),
          potato: Math.round(1000 * game.difficulty)
        }
      };
      let keys = Object.keys(prop);
      for (let i = 0; i < keys.length; i++) {
        v[keys[i]] = prop[keys[i]][v.type];
      }
    }

    const dummyVegList = [
      {
        type: "carrot",
        x: 50,
        fromRight: 0,
        y: 300,
        width: 220,
        height: 45
      },
      {
        type: "broccoli",
        x: 500,
        fromRight: 1,
        y: 125,
        width: 150,
        height: 115
      },
      {
        type: "potato",
        x: 550,
        fromRight: 1,
        y: 150,
        width: 155,
        height: 60
      }
    ];

    game.tps = 20;

    game.bj.vegetables = [];

    game.currentTick = 0;
    game.ticksSinceStart = 0;

    game.start = function() {

      game.initializePlayer(game.bj.player1);
      game.currentTick = 0;
      game.ticksSinceStart = 0;

      game.difficulty = 1.0;

      game.tick();
    }

    game.vegDelay = 5;

    game.tick = function() { // update literally everything

      if (game && !game.paused && !game.over) {

        if (game.bj.player1.slow) {
          game.moveModif = 0.4;
        }
        else {
          game.moveModif = 1;
        }

        game.updateVegetables();
        game.pruneVegetables();
        
        game.updatePlayer(game.bj.player1);

        if (game == null) {
          return;
        }

        if (game.ticksSinceStart % (30 * 20) == 0 && game.ticksSinceStart != 0) {
          // increase difficulty every 30s
          game.difficulty += 0.1;
        }

        
        if (game.bj.player1.slow > 0) {
          game.vegDelay -= 0.4; // need to slow spawnrate during slowmo
        }
        else {
          game.vegDelay--;
        }
        if (game.vegDelay <= 0 || game.bj.vegetables.length < 3) {
          game.bj.vegetables.push(game.spawnVegetable());
          game.vegDelay = Math.floor(Math.random() * 9 + 6);
          if (game.bj.player1.surge > 0) {
            game.vegDelay = Math.floor(game.vegDelay * 0.4); // SURGEEEEEE
          }
        }

        game.currentTick++;
      }
      
      if (game.currentTick % 100 == 0) {
        console.log("still ticking! " + game.currentTick/100);
      }

      if (game && !game.over) {  
        game.makeDisplayList();

        setTimeout(game.tick, 1000/game.tps);
      }

    }

    game.spawnVegetable = function(seed) {
      let s = seed || Array.from({length: 10}, () => Math.random()); // can have seeded or random vegetables

      let v = {};
      v.deathTick = 0;
      v.seed = s; // need to store the seed, makes replays WAY easier
      v.type = game.availableVegetables[Math.floor(s[0] * 3)];
      v.fromRight = Math.floor(s[1] * 2);
      game.populateVegetableProperties(v);

      v.y = Math.floor(s[3] * (game.height - 300) + 250);
      v.x = v.fromRight ? game.width + 10 : -(v.width + 10);

      v.xv = (Math.floor(s[2] * 5) + 13) * (v.fromRight ? -1 : 1);
      v.xv *= game.difficulty;
      v.yv = 0;
      v.dying = false;
      v.dead = false;
      v.offScreen = false;

      v.update = function() { // move the vegetable (collision is tested for in update player)
        v.x += v.xv * game.moveModif;
        //console.log(v.x);
        if ((v.fromRight && v.x < -(v.width + 20)) || (v.x > game.width + 20)) { // boolean magic
          v.dead = true;
          v.offScreen = true;
        }
        else if (v.y > game.height + 5) {
          v.dead = true;
          v.offScreen = true;
        }
      }

      //console.log("spawn!" + JSON.stringify(v));

      return v;
    }

    game.updateVegetables = function() {
      for (let i = 0; i < game.bj.vegetables.length; i++) {
        let v = game.bj.vegetables[i];
        v.update();
      }
    }

    game.pruneVegetables = function() {
      for (let i = game.bj.vegetables.length - 1; i >= 0; i--) { // backwards for loop so we can remove stuff
        let v = game.bj.vegetables[i];
        if (v.dead) v.deathTick++;
        if ((v.dead && v.deathTick > 20) || v.offScreen) {
          game.bj.vegetables.splice(i, 1);
        }
      }
    }

    game.allPowerups = {
      items: [
        {
          name: "shield",
          effect: ( () => {
            game.bj.player1.heldItem = {
              name: "shield",
              effect: ( () => {
                game.bj.player1.shield = 100; // 5 seconds
                game.bj.player1.heldItem = null;
              } )
            }
          } ),
          color: '#62f567'
        },
        {
          name: "arrow",
          effect: ( () => {
            game.bj.player1.heldItem = {
              name: "arrow",
              effect: ( () => {
                game.bj.player1.y = 20; // tp to top
                game.bj.player1.yv = 0;
                game.bj.player1.arrow = 5; // quarter second
                game.bj.player1.heldItem = null;
              } )
            }
          } ),
          color: '#b5f5f1'
        },
        {
          name: "boost",
          effect: ( () => {
            game.bj.player1.heldItem = {
              name: "boost",
              effect: ( () => {
                game.bj.player1.boost = true; // triples next hit
                game.bj.player1.heldItem = null;
              } )
            }
          } ),
          color: '#a317d1'
        }
      ],
      powerups: [
        {
          name: "double",
          effect: ( () => { game.bj.player1.double = 100 } ), // 5 seconds
          color: '#c431cc'
        },
        {
          name: "slowmo",
          effect: ( () => { game.bj.player1.slow = 220 } ), // 11 seconds
          color: '#3574e8'
        },
        {
          name: "surge",
          effect: ( () => { game.bj.player1.surge = 140 } ), // 7 seconds
          color: '#e38a17'
        }
      ]
    };

    game.addPowerup = function(type) {
      let lst = game.allPowerups[type];
      let p = lst[Math.floor(Math.random() * lst.length)];
      let obj = {
        type: (type == "powerups" ? "powerup" : "item"),
        name: p.name,
        effect: p.effect,
        x: Math.floor(Math.random() * 950 + 200),
        y: Math.floor(Math.random() * 350 + 75),
        color: p.color
      };
      game.bj.powerups.push(obj);
    }

    // sends the client a bunch of graphical info for it to interepret/draw
    game.makeDisplayList = function() {
      let dl = {};

      dl.gameType = "singleplayer";

      dl.paused = game.paused;

      dl.current = {};
      dl.current.moving = game.bj.player1.xv != 0;
      dl.current.collision = game.bj.player1.yv == -51;

      dl.vegetables = [];

      dl.tick = game.ticksSinceStart;
      dl.ticksWaited = game.currentTick;
      
      for (let i = 0; i < game.bj.vegetables.length; i++) {
        dl.vegetables[i] = JSON.parse(JSON.stringify(game.bj.vegetables[i]));
      }
      dl.player = JSON.parse(JSON.stringify(game.bj.player1));

      dl.powerups = [];
      for (let i = 0; i < game.bj.powerups.length; i++) {
        let p = game.bj.powerups[i];
        dl.powerups[i] = {
          type: p.type,
          color: p.color,
          x: p.x,
          y: p.y
        }
      }

      //console.log("about to send stuff");
      game.socket.emit("displayGame", JSON.stringify(dl));
    }

    game.makeEndInfo = function() {
      let ei = {};
      ei.score = game.bj.player1.score;
      ei.gameType = "singleplayer";
      ei.timeSurvived = game.ticksSinceStart;
      
      return ei;
    }

    game.sendUserData = function(acc) {
      
      let obj = {};

      let keys = Object.keys(acc);

      for (let i = 0; i < keys.length; i++) {
        let k = keys[i];
        if (k.startsWith("singleplayer_") || k == "achievementPoints") {
          obj[k] = acc[k];
        }
      }

      obj.achievements = [];
      let achKeys = Object.keys(acc.achievements);
      for (let i = 0; i < achKeys.length; i++) {
        let ach = achievements[achKeys[i]];
        obj.achievements.push({
          name: ach.name,
          id: ach.id,
          descr: ach.descr.replace('[t]', addCommas(ach.tiers[acc.achievements[ach.name]])),
          tier: acc.achievements[ach.name],
          tiers: ach.tiers.length,
          points: ach.points[acc.achievements[ach.name]]
        });
      }

      game.socket.emit("userData", JSON.stringify(obj));

    }

    game.endGame = function() {
      if (!game) {
        console.log("no game object!");
        return;
      }
      game.bj.powerups = [];
      game.over = true;
      if (univ.names[game.socket.id]) {
        let socket = game.socket;
        let user = univ.names[game.socket.id];
        univ.client.get(user, { raw: false }).then(acc => { 
          
          // update the player's account with new stats
          if (acc.singleplayer_gamesPlayed) {
            acc.singleplayer_gamesPlayed += 1;
          }
          else {
            acc.singleplayer_gamesPlayed = 1;
          }

          if (acc.singleplayer_biggestBounce) {
            if (game.bj.player1.bestBounce > acc.singleplayer_biggestBounce) {
              acc.singleplayer_biggestBounce = game.bj.player1.bestBounce;
            }
          }
          else {
            acc.singleplayer_biggestBounce = game.bj.player1.bestBounce;
          }

          acc.singleplayer_lifetimePoints = acc.singleplayer_lifetimePoints || 0;
          acc.singleplayer_lifetimePoints += game.bj.player1.score;

          let ach_d = achievements["Dedicated"];
          let pl_ach_d = game.bj.player1.achievements["Dedicated"];
          let nextTier = (isNaN(pl_ach_d) ? 0 : pl_ach_d + 1);
          if (acc.singleplayer_lifetimePoints >= (ach_d.tiers[nextTier] || Number.MAX_VALUE)) {
            game.bj.player1.achievements["Dedicated"] = nextTier;
            game.socket.emit("achAnim", {
              time: 100,
              name: "Dedicated",
              tier: nextTier,
              id: ach_d.id
            });
          }

          let achs = game.bj.player1.achievements;
          let keys = Object.keys(achs);
          let ach_points = 0;
          for (let i = 0; i < keys.length; i++) {
            ach_points += achievements[keys[i]].points[achs[keys[i]]];
          }
          acc.achievementPoints = ach_points;

          if (acc.singleplayer_highScore && game.bj.player1.score > acc.singleplayer_highScore) {
            acc.singleplayer_highScore = game.bj.player1.score;
            acc.singleplayer_highScoreTimestamp = msToDate(Date.now());
          }
          else if (!(acc.singleplayer_highScore)) {
            acc.singleplayer_highScore = game.bj.player1.score;
            acc.singleplayer_highScoreTimestamp = msToDate(Date.now());
          }
          let chains = [ "bestBroccoliChain", "bestCarrotChain", "bestPotatoChain" ];
          for (let i = 0; i < chains.length; i++) {
            if (acc[`singleplayer_${chains[i]}`] && game.bj.player1[chains[i]] > acc[`singleplayer_${chains[i]}`]) {
              acc[`singleplayer_${chains[i]}`] = game.bj.player1[chains[i]];
            }
            else if (!(acc[`singleplayer_${chains[i]}`])) {
              acc[`singleplayer_${chains[i]}`] = game.bj.player1[chains[i]];
            }
          }
          if (acc.singleplayer_scoresArr) {
            if (acc.singleplayer_scoresArr.length < 20) { // array of most recent 20 scores
              acc.singleplayer_scoresArr.push(game.bj.player1.score);
            }
            else {
              while (acc.singleplayer_scoresArr.length >= 20) {
                acc.singleplayer_scoresArr.shift();
              }
              acc.singleplayer_scoresArr.push(game.bj.player1.score);
            }
          }
          else {
            acc.singleplayer_scoresArr = [ game.bj.player1.score ];
          }
          acc.singleplayer_average = Math.round(acc.singleplayer_scoresArr.reduce((a, b) => a + b) / 20);

          acc.achievements = acc.achievements || {};
          let achKeys = Object.keys(game.bj.player1.achievements) || [];
          for (let i = 0; i < achKeys.length; i++) {
            acc.achievements[achKeys[i]] = game.bj.player1.achievements[achKeys[i]];
          }

          univ.client.set(user, acc).then().catch(err => console.log(err));

          game.sendUserData(acc);

          game.socket.emit("endGame", game.makeEndInfo());

        }).catch(err => console.log(err));
      }
      else {
        game.socket.emit("endGame", game.makeEndInfo());

        game = null;
      }
    }

    game.handleInput = function(e, pl) {
      if (!game) return;
      if (e == "left" && !game.paused) {
        pl.started = true;
        pl.xv = -28;
        pl.stop = false;
      }
      else if (e == "right" && !game.paused) {
        pl.started = true;
        pl.xv = 28;
        pl.stop = false;
      }
      if (((e == "r_left" && pl.xv < 0) || (e == "r_right" && pl.xv > 0)) && !game.paused) {
        pl.stop = true;
      }
      if (e == "down") {
        game.paused = !game.paused;
      }
      if (e == "up" && !game.paused) {
        if (pl.heldItem) {
          pl.heldItem.effect();
        }
      }
    }

    return game;
  }
}

function collide(game, pl, v) {
  v.dead = true;
  pl.nextyv = -46; // pl.vy needs to stay positive (for now) in case of multiple collisions

  let prevScore = pl.score;

  let add = 0;
  
  if (pl.chainType == v.type) {
    pl.chainLength++;
    if (v.type == "carrot") {
      pl.bestCarrotChain = Math.max(pl.bestCarrotChain, pl.chainLength);
    }
    if (v.type == "broccoli") {
      pl.bestBroccoliChain = Math.max(pl.bestBroccoliChain, pl.chainLength);
    }
    if (v.type == "potato") {
      pl.bestPotatoChain = Math.max(pl.bestPotatoChain, pl.chainLength);
    }

    pl.y = v.y - pl.height;
    add = v.value * pl.chainLength;
    if (pl.boost) add *= 3;
    if (pl.double > 0) add *= 2;
    pl.score += add;
    pl.hits.push({ // client handles drawing text to indicate points, but server has to tell client to do so
      type: v.type,
      chain: pl.chainLength,
      score: add,
      x: pl.x - 5,
      y: pl.y - 20,
      boost: (pl.boost || pl.double > 0)
    });
    if ((!(pl.bestBounce)) || add > pl.bestBounce) {
      pl.bestBounce = add;
    }
  }
  else {
    pl.chainLength = 1;
    pl.y = v.y - pl.height;
    pl.chainType = v.type;
    add = v.value;
    if (pl.boost) add *= 3;
    if (pl.double > 0) add *= 2;
    pl.score += add;
    pl.hits.push({ // client handles drawing text to indicate points, but server has to tell client to do so
      type: v.type,
      chain: pl.chainLength,
      score: add,
      x: pl.x - 5,
      y: pl.y - 20,
      boost: (pl.boost || pl.double > 0)
    });
    if ((!(pl.bestBounce)) || add > pl.bestBounce) {
      pl.bestBounce = add;
    }
  }

  if (univ.names[game.socket.id]) {

    let ach_bb = achievements["Potato Combo"];
    let pl_ach_bb = pl.achievements["Potato Combo"];
    let nextTier = (isNaN(pl_ach_bb) ? 0 : pl_ach_bb + 1);
    if (pl.bestPotatoChain >= (ach_bb.tiers[nextTier] || Number.MAX_VALUE)) {
      pl.achievements["Potato Combo"] = nextTier;
      game.socket.emit("achAnim", {
        time: 100,
        name: "Potato Combo",
        tier: nextTier,
        id: ach_bb.id
      });
    }
  } // potato combo
  
  if (univ.names[game.socket.id]) {

    let ach_bb = achievements["Broccoli Combo"];
    let pl_ach_bb = pl.achievements["Broccoli Combo"];
    let nextTier = (isNaN(pl_ach_bb) ? 0 : pl_ach_bb + 1);
    if (pl.bestBroccoliChain >= (ach_bb.tiers[nextTier] || Number.MAX_VALUE)) {
      pl.achievements["Broccoli Combo"] = nextTier;
      game.socket.emit("achAnim", {
        time: 100,
        name: "Broccoli Combo",
        tier: nextTier,
        id: ach_bb.id
      });
    }
  } // broccoli combo

  if (univ.names[game.socket.id]) {

    let ach_bb = achievements["Carrot Combo"];
    let pl_ach_bb = pl.achievements["Carrot Combo"];
    let nextTier = (isNaN(pl_ach_bb) ? 0 : pl_ach_bb + 1);
    if (pl.bestCarrotChain >= (ach_bb.tiers[nextTier] || Number.MAX_VALUE)) {
      pl.achievements["Carrot Combo"] = nextTier;
      game.socket.emit("achAnim", {
        time: 100,
        name: "Carrot Combo",
        tier: nextTier,
        id: ach_bb.id
      });
    }
  } // carrot combo

  if (univ.names[game.socket.id]) {

    let ach_bb = achievements["Potato Maniac"];
    let pl_ach_bb = pl.achievements["Potato Maniac"];
    let nextTier = (isNaN(pl_ach_bb) ? 0 : pl_ach_bb + 1);
    if (add >= (ach_bb.tiers[nextTier] || Number.MAX_VALUE) && v.type == "potato") {
      pl.achievements["Potato Maniac"] = nextTier;
      game.socket.emit("achAnim", {
        time: 100,
        name: "Potato Maniac",
        tier: nextTier,
        id: ach_bb.id
      });
    }
  } // potato maniac

  if (univ.names[game.socket.id]) {

    let ach_bb = achievements["Big Bounce"];
    let pl_ach_bb = pl.achievements["Big Bounce"];
    let nextTier = (isNaN(pl_ach_bb) ? 0 : pl_ach_bb + 1);
    if (pl.bestBounce >= (ach_bb.tiers[nextTier] || Number.MAX_VALUE)) {
      pl.achievements["Big Bounce"] = nextTier;
      game.socket.emit("achAnim", {
        time: 100,
        name: "Big Bounce",
        tier: nextTier,
        id: ach_bb.id
      });
    }
  } // big bounce

  if (univ.names[game.socket.id]) {

    let ach_ps = achievements["Point Scorer"];
    let pl_ach_ps = pl.achievements["Point Scorer"];
    let nextTier = (isNaN(pl_ach_ps) ? 0 : pl_ach_ps + 1);
    if (pl.score >= (ach_ps.tiers[nextTier] || Number.MAX_VALUE)) {
      pl.achievements["Point Scorer"] = nextTier;
      game.socket.emit("achAnim", {
        time: 100,
        name: "Point Scorer",
        tier: nextTier,
        id: ach_ps.id
      });
    }
  } // point scorer

  pl.boost = false;
}

function msToDate(ms) {
  let d = (new Date(ms)).toString();
  let lst = d.split(" ");
  return lst[1] + " " + lst[2] + ", " + lst[3];
}

module.exports = { univ };

function addCommas(n) {
  if (!n) return "0";
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); // regex wizardry
}