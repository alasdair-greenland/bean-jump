const { achievements } = require("./achievements.js");
const { botlib } = require("./server_multiplayer_bot.js");

let univ2 = {

  makeMGame: function(socket, name, trophies) {

    let game = {};

    game.name1 = name;
    game.name2 = "";
    game.p1trophies = trophies;
    game.p2trophies = 0;

    game.introStarted = false;

    game.bot = false; // we want to be able to play multiplayer even if there's nobody to play against
    // so theres a bot system

    game.sockets = {
      p1: socket,
      p2: null
    }

    game.sendToPlayer1 = function(...args) {
      game.sockets.p1.emit(...args);
    }

    game.sendToPlayer2 = function(...args) {
      if (!game.bot) {
        game.sockets.p2.emit(...args);
      }
      else {
        game.bj.player2.bot.send(game, ...args);
      }
    }

    game.winner = null;

    game.width = 1350;
    game.height = 650;

    game.bj = {};
    game.bj.player1 = {
      // player stores position but also score, active powerup, chains, xv/yv, basically anything player-related
    };

    game.bj.player2 = {
      // player2 is for multiplayer
    };

    game.bj.powerups = [];

    game.bj.vegetables = [];
    
    game.currentTick = 0;
    game.ticksSinceStart = 0;

    game.moveModif = 1;

    game.initializePlayer1 = function() {
      let pl1 = game.bj.player1;
      pl1.name = "player1";
      //pl1.socket = game.sockets.p1;
      pl1.width = 75;
      pl1.height = 50;
      pl1.x = game.width/3 - pl1.width/2;
      pl1.y = 50;
      pl1.xv = 0;
      pl1.yv = 0;
      pl1.score = 0;
      pl1.power = null;
      pl1.item = null;
      pl1.started = false;
      pl1.chainType = null;
      pl1.chainLength = 0;
      pl1.stop = false;

      pl1.arrow = 0;
      pl1.double = 0;
      pl1.shield = 0;
      pl1.surge = 0;
      pl1.slow = 0;
    }

    game.initializePlayer2 = function() {
      let pl2 = game.bj.player2;
      pl2.name = "player2";
      //pl2.socket = game.sockets.p2;
      pl2.width = 75;
      pl2.height = 50;
      pl2.x = game.width * (2/3) - pl2.width/2;
      pl2.y = 50;
      pl2.xv = 0;
      pl2.yv = 0;
      pl2.score = 0;
      pl2.power = null;
      pl2.item = null;
      pl2.started = false;
      pl2.chainType = null;
      pl2.chainLength = 0;
      pl2.stop = false;

      pl2.arrow = 0;
      pl2.double = 0;
      pl2.shield = 0;
      pl2.surge = 0;
      pl2.slow = 0;
    }

    game.updatePlayer = function(pl) {
      let otherPlayer = (pl.name == "player1" ? game.bj.player2 : game.bj.player1);
      
      if (game.currentTick > 100) {
        pl.started = true;
      }
    
      if (pl.started) {
        let preScore = Math.floor(pl.score / game.powerupBreak);
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

        for (let i = 0; i < game.bj.powerups.length; i++) {
          let p = game.bj.powerups[i];
          if (pl.x + pl.width > p.x - 15 && pl.x < p.x + 15 && pl.y + pl.height > p.y - 15 && pl.y < p.y + 15) {
            p.effect();
            game.bj.powerups.splice(i, 1);
            i--;
          }
        }

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
            game.endGame(otherPlayer);
            return;
          }
        }
        if (collision) {
          possibleColliders.sort( (a, b) => { return a.y - b.y; } );
          collide(game, pl, possibleColliders[0]);
        }

        pl.yv = pl.nextyv;

        if (pl.y > game.height + 20) {
          game.endGame(otherPlayer);
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

    game.stopped = false;

    game.bj.vegetables = [];

    game.currentTick = 0;

    game.setup = function() {
      game.initializePlayer1();
      game.makeDisplayList(true);

      game.initializePlayer2();
    }

    game.start = function() {

      game.trophyValues = calcTrophyValues(game.p1trophies, game.p2trophies);
      console.log("calculated trophy values, based on: " + game.p1trophies + " and " + game.p2trophies);
      console.log(JSON.stringify(game.trophyValues).split(",").join("\n"));
      
      game.tick();
    }

    game.intro = function(ticksLeft, bot) {

      game.introStarted = true;

      for (let i = 0; i < univ2.mrooms.length; i++) {
        if (univ2.mrooms[i].p1name == game.name1) {
          univ2.mrooms[i].full = true;
        }
      }

      if (bot) {
        game.bot = true;
        game.bj.player2.bot = botlib.createBot(game.p1trophies);
        game.name2 = game.bj.player2.bot.username;
        game.p2trophies = game.bj.player2.bot.trophies;
      }

      game.sendToPlayer1("displayGame", JSON.stringify({ intro: true, time: ticksLeft, opname: game.name2, optroph: game.p2trophies }) );
      game.sendToPlayer2("displayGame", JSON.stringify({ intro: true, time: ticksLeft, opname: game.name1, optroph: game.p1trophies }) );

      if (ticksLeft > 0) {
        setTimeout( () => { game.intro(ticksLeft - 1, false) }, 1000/game.tps);
      }
      else {
        game.start();
      }
    }

    game.vegDelay = 5;

    game.tick = function() { // update literally everything

      if (game.stopped) return;
      
      game.ticksSinceStart++;

      game.updateVegetables();
      game.pruneVegetables();
      
      game.updatePlayer(game.bj.player1);
      if (game == null) {
        return;
      }
      game.updatePlayer(game.bj.player2);

      if (game == null) {
        return;
      }

      game.makeDisplayList(false);
      
      game.vegDelay--;
      if (game.vegDelay === 0 || game.bj.vegetables.length < 5) {
        game.bj.vegetables.push(game.spawnVegetable());
        game.vegDelay = Math.floor(Math.random() * 8 + 5);
      }

      game.currentTick++;

      if (!game) return;

      setTimeout(game.tick, 1000/game.tps);

    }

    game.bj.difficulty = 0;

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
      v.yv = 0;
      v.dying = false;
      v.dead = false;

      v.update = function() { // move the vegetable (collision is tested for in update player)
        v.x += v.xv;
        if ((v.fromRight && v.x < -(v.width + 20)) || (v.x > game.width + 20)) { // boolean magic
          v.offscreen = true;
        }
        else if (v.y > game.height + 5) {
          v.offscreen = true;
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

    // sends the client a bunch of graphical info for it to interepret/draw
    game.makeDisplayList = function(setup) {
      let dl = {};

      dl.setup = setup;

      dl.sid = game.sockets.p1.id;

      dl.tick = game.ticksSinceStart;
      dl.ticksWaited = game.currentTick;

      dl.current = {};
      dl.current.moving = game.bj.player1.xv != 0;
      dl.current.collision = game.bj.player1.yv == -46;

      dl.gameType = "multiplayer";

      dl.vegetables = [];
      
      for (let i = 0; i < game.bj.vegetables.length; i++) {
        dl.vegetables[i] = JSON.parse(JSON.stringify(game.bj.vegetables[i]));
      }
      dl.player1 = JSON.parse(JSON.stringify(game.bj.player1));
      dl.player2 = JSON.parse(JSON.stringify(game.bj.player2));

      //console.log("about to send stuff");
      game.sendToPlayer1("displayGame", JSON.stringify(dl));
      if (game.sockets.p2 || game.bot) {
        game.sendToPlayer2("displayGame", JSON.stringify(dl));
      }
    }

    game.makeEndInfo = function(pl, opname, tgain) {
      let ei = {};
      ei.opname = opname;
      ei.tgain = tgain;
      if (game.winner == pl.name) {
        ei.winner = true;
      }
      else {
        ei.winner = false;
      }
      return ei;
    }

    game.endGame = function(pl) {
      game.stopped = true;
      for (let i = univ2.mrooms.length - 1; i >= 0; i--) {
        if (univ2.mrooms[i].p1name == game.name1) {
          univ2.mrooms.splice(i, 1);
        }
      }
      game.winner = pl.name;
      let time = game.ticksSinceStart;
      let p1newTrophies = game.p1trophies;
      let p2newTrophies = game.p2trophies;
      if (pl.name == "player1") {
        let tgain = Math.round(game.trophyValues.p1win * (1 + (time / (20 * 30 * 10))));
        let tloss = Math.round(game.trophyValues.p2lose * (1 + (time / (20 * 30 * 10))));
        p1newTrophies += tgain;
        p2newTrophies += tloss;
        p2newTrophies = Math.max(0, p2newTrophies);
      }
      else {
        let tgain = Math.round(game.trophyValues.p2win * (1 + (time / (20 * 30 * 10))));
        let tloss = Math.round(game.trophyValues.p1lose * (1 + (time / (20 * 30 * 10))));
        p2newTrophies += tgain;
        p1newTrophies += tloss;
        p1newTrophies = Math.max(0, p1newTrophies);
      }
      
      univ2.client.get(game.name1, { raw: false }).then(acc => {
        acc.multiplayer_trophies = p1newTrophies;
        acc.multiplayer_bestTrophies = Math.max(acc.multiplayer_bestTrophies, p1newTrophies);
        if (pl.name == "player1") {
          if (acc.multiplayer_winstreak) {
            acc.multiplayer_winstreak++;
          }
          else {
            acc.multiplayer_winstreak = 1;
          }
          acc.multiplayer_bestWinstreak = Math.max(acc.multiplayer_bestWinstreak, acc.multiplayer_winstreak);
        }
        else {
          acc.multiplayer_winstreak = 0;
        } 
        univ2.client.set(acc.username, acc).then().catch(err => console.log(err));

        game.sendUserData(acc);
        
      }).catch(err => console.log(err));

      if (!game.bot) {
        univ2.client.get(game.name2, { raw: false }).then(acc => {
          acc.multiplayer_trophies = p2newTrophies;
          acc.multiplayer_bestTrophies = Math.max(acc.multiplayer_bestTrophies, p2newTrophies);
          if (pl.name == "player2") {
            if (acc.multiplayer_winstreak) {
              acc.multiplayer_winstreak++;
            }
            else {
              acc.multiplayer_winstreak = 1;
            }
            acc.multiplayer_bestWinstreak = Math.max(acc.multiplayer_bestWinstreak, acc.multiplayer_winstreak);
          }
          else {
            acc.multiplayer_winstreak = 0;
          } 
          univ2.client.set(acc.username, acc).then().catch(err => console.log(err));
  
          game.sendUserData(acc);
          
        }).catch(err => console.log(err));
      }
      
      game.sendToPlayer1("endGame", game.makeEndInfo(game.bj.player1, game.name2, p1newTrophies - game.p1trophies));
      game.sendToPlayer2("endGame", game.makeEndInfo(game.bj.player2, game.name1, p2newTrophies - game.p2trophies));
    }

    game.sendUserData = function(acc) {
      
      let obj = {};

      let keys = Object.keys(acc);

      for (let i = 0; i < keys.length; i++) {
        let k = keys[i];
        if (k.startsWith("multiplayer_") || k == "achievementPoints") {
          obj[k] = acc[k];
        }
      }

      obj.achievements = [];
      if (acc.achievements) {
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
      }

      if (acc.username == game.name1) {
        game.sendToPlayer1("userData", JSON.stringify(obj));
      }
      else {
        game.sendToPlayer2("userData", JSON.stringify(obj));
      }

    }

    game.handleInput = function(e, pl) {
      if (!game) return;
      if (e == "left") {
        pl.started = true;
        pl.xv = -28;
        pl.stop = false;
      }
      else if (e == "right") {
        pl.started = true;
        pl.xv = 28;
        pl.stop = false;
      }
      else if (((e == "r_left" && pl.xv < 0) || (e == "r_right" && pl.xv > 0))) {
        pl.stop = true;
      }
    }

    setTimeout( () => {
      if (!game.introStarted) {
        game.intro(60, true);
      }
    }, 2000); // takes a while to queue a bot, because we'd rather face a real player

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
  }

  pl.boost = false;
}

function calcTrophyValues(p1t, p2t) {
  let trophyValues = {};
  let gates = [ 100, 200, 300, 400, 700, 800, 900, 1000 ];
  let coeffs = [ .4, .6, .75, .9, 1, 1.1, 1.2, 1.3, 1.4];
  let ind1 = 0;
  let ind2 = 0;
  while (gates[ind1] && (p1t > gates[ind1])) {
    ind1++;
  }
  while (gates[ind2] && (p2t > gates[ind2])) {
    ind2++;
  }
  let split = p2t - p1t;

  trophyValues.p1win = Math.max(2, 20 + (split/10));
  trophyValues.p2lose = (-(trophyValues.p1win)) * coeffs[ind2];
  trophyValues.p2win = Math.max(2, 20 + (-split/10));
  trophyValues.p1lose = (-(trophyValues.p2win)) * coeffs[ind1];

  return trophyValues;
}

module.exports = { univ2 };

function addCommas(n) {
  if (!n) return "0";
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); // regex wizardry
}