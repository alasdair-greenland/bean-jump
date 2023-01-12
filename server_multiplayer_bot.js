let botlib = {};

botlib.createBot = function(enemyTrophies) {

  let bot = {};

  let trophyDifference = Math.random(); // random value
  trophyDifference = trophyDifference ** 4; // weight it towards smaller values
  trophyDifference *= 86; // scale it to the full range
  trophyDifference *= (Math.random() < 0.5 ? 1 : -1); // 50% chance to make it negative
  trophyDifference = Math.round(trophyDifference);

  bot.trophies = Math.max(enemyTrophies + trophyDifference, 0); // calculate the bot's apparent trophies

  //bot.trophies = 25; // this is temporary, to ensure that the bots don't have leaderboard-level trophies

  let availableNames = [
    "BeanMan1",
    "UsernameTaken",
    "bossman_103",
    "PizzaEater3",
    "FullLegalName",
    "TheWinner_",
    "ILikeBaseball",
    "FuzzySocks",
    "iambot",
    "You_Lose",
    "number1"
  ];

  bot.username = availableNames[Math.floor(Math.random() * availableNames.length)]; // pick a random name

  bot.send = function(game, ...args) {
    let cmd = args[0];
    if (cmd == "displayGame") {
      let dl = JSON.parse(args[1]);
      if (dl.setup || dl.intro) return;
      if (dl.tick < 40) return;
      let pl = dl.player2; // bot is always player2
      let vegs = dl.vegetables;
      let dec = bot.makeDecision(vegs, pl);
      game.handleInput(dec, game.bj.player2);
    }
    else return; // we don't care about the other messages lol
  }

  bot.makeDecision = function(vegs, pl) { // different ais for different trophy ranges
    function getDist(v) {
      return ((v.x - pl.x) ** 2) + ((v.y - pl.y) ** 2);
    }
    if (bot.trophies < 20) { // this one just moves towards the closest vegetable
      vegs.sort( (a, b) => {
        getDist(a) - getDist(b);
      } );
      let cl = vegs[0];
      if (cl.x - pl.x < -50 && pl.x > 100) {
        return "left";
      }
      else if ((cl.x + cl.width) - (pl.x + pl.width) > 50 && pl.x < 1250) {
        return "right";
      }
      else {
        return "r_left";
      }
    } // moves towards nearest vegetable
    else if (bot.trophies < 500) { // moves towards soonest hittable vegetable, but only if it can reach it
      function timeToColl(v) {
        let pl2 = JSON.parse(JSON.stringify(pl));
        if (v.y > pl2.y + pl2.height && pl2.yv > 0) {
          return 1000;
        }
        let t = 0;
        let prevAbove = false;
        while (!prevAbove || v.y < pl2.y + pl2.height) {
          prevAbove = (v.y < pl2.y + pl2.height);
          t++;
          pl2.y += pl2.yv;
          pl2.yv += 6;
          if (t > 100) {
            return t;
          }
        }
        return t;
      }
      function canCollide(v) {
        if (v.x < pl.x) {
          return (Math.abs(timeToColl(v) * (-28 + v.xv)) < Math.abs(pl.x - v.x + v.width));
        }
        return (Math.abs(timeToColl(v) * (28 - v.xv)) < Math.abs(pl.x + pl.width - v.x));
      }
      vegs.sort( (a, b) => {
        return timeToColl(a) - timeToColl(b);
      } );
      let i = 0;
      while (!(canCollide(vegs[i])) && i < vegs.length - 1) {
        i++;
      }
      let cl = vegs[i];
      if (cl.x - pl.x < -35 && pl.x > 100) {
        return "left";
      }
      else if ((cl.x + cl.width) - (pl.x + pl.width) > 35 && pl.x < 1250) {
        return "right";
      }
      else {
        return "r_left";
      }
    } // moves towards the vegetable it can hit the soonest
  }

  return bot;
  
}

module.exports = { botlib };