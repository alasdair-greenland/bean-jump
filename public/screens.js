var game = game || {};

game.currentScreen = game.homeScreen;

function drawCircles(ctx, n) {
  ctx.globalAlpha = 0.5;
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = n == i ? '#999999' : '#000000'
    circle(ctx, game.width/2 - 80 + i*40, game.height-75, 15);
  }
  ctx.fillStyle = '#000000';
  ctx.font = '18px Roboto';
  ctx.textAlign = 'center';
  let kb = swapKeysAndValues(game.keybinds);
  ctx.fillText(`(Use ${kb.left}/${kb.right} to scroll)`, game.width/2, game.height - 25);

  ctx.globalAlpha = 1;
}

game.controlIndex = -1;
game.lastScreen = null;
game.controlsList = [ "up", "left", "down", "right" ];
game.keysInUse = [ "w", "a", "s", "d" ];

game.newKeybinds = {
  "up": null,
  "down": null,
  "left": null,
  "right": null
};

game.controlsScreen = {
  directions: [],

  draw: (ctx) => {

    ctx.fillStyle = game.color;
    ctx.fillRect(0, 0, game.width, game.height);
    ctx.fillStyle = '#ffffff';
    ctx.font = '35px Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("Press escape when done", game.width/2, 50);

    ctx.fillStyle = '#8888ff';
    ctx.strokeStyle = '#ffffff';
    let i = game.controlIndex;
    let modes = ['stroke', 'stroke', 'stroke', 'stroke'];
    if (i >= 0) {
      modes[i] = 'fill-stroke';
    }
    roundedRect(ctx, game.width/2 - 50, 100, 100, 100, 10, modes[0]);
    roundedRect(ctx, game.width/2 - 200, 250, 100, 100, 10, modes[1]);
    roundedRect(ctx, game.width/2 - 50, 250, 100, 100, 10, modes[2]);
    roundedRect(ctx, game.width/2 + 100, 250, 100, 100, 10, modes[3]);

    ctx.fillStyle = '#ffffff';

    let keyStr = 'Press space to change keybinds';
    if (game.controlIndex != -1) {
      keyStr = `Press the key you want to use as your ${game.controlsList[game.controlIndex]} key`;
    }
    ctx.textAlign = 'center';
    ctx.font = '25px Roboto';
    ctx.fillText(keyStr, game.width/2, 400);

    ctx.font = '50px Roboto';
    if (game.controlIndex != -1) {
      ctx.fillText(translateKey(game.newKeybinds['up']) || "", game.width/2, 167);
      ctx.fillText(translateKey(game.newKeybinds['right'] || ""), game.width/2 + 150, 317);
      ctx.fillText(translateKey(game.newKeybinds['left'] || ""), game.width/2 - 150, 317);
      ctx.fillText(translateKey(game.newKeybinds['down'] || ""), game.width/2, 317);
    }
    else {
      let o = swapKeysAndValues(game.keybinds);
      ctx.fillText(translateKey(o['up']), game.width/2, 167);
      ctx.fillText(translateKey(o['right']), game.width/2 + 150, 317);
      ctx.fillText(translateKey(o['left']), game.width/2 - 150, 317);
      ctx.fillText(translateKey(o['down']), game.width/2, 317);
    }
  }
}

game.homeScreen = {
  directions: [ "up", "down", "left", "right" ], // all directions that can be moved in from this screen

  up: () => {
    game.currentScreen = game.gameScreen;
    let name = game.loggedIn ? game.currentAccount.username : "a";
    game.socket.emit("start_singleplayer_game");
  },

  down: () => {

    if (!game.loggedIn) {
      alert(`You must be logged in to play multiplayer. Create an account from the signup screen by pressing ${translateKey(swapKeysAndValues(game.keybinds)["left"])}.`);
      return;
    }

    game.currentScreen = game.gameScreen;
    game.socket.emit("start_multiplayer_game", game.currentAccount.username);
  },

  left: () => {

    if (!game.loggedIn) {
      document.getElementById("signupUsername").setAttribute('type', 'text');
      document.getElementById("signupPassword").setAttribute('type', 'password');
      document.getElementById("loginUsername").setAttribute('type', 'text');
      document.getElementById("loginPassword").setAttribute('type', 'password');
    }
    game.currentScreen = game.accountScreen;
  },

  right: () => {
    game.currentScreen = game.achievementsScreen;
  },

  draw: (ctx) => {
    ctx.fillStyle = game.color;
    ctx.fillRect(0, 0, game.width, game.height);
    ctx.fillStyle = '#000000';
    ctx.font = '100px Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BEAN JUMP!', game.width/2, 100);

    ctx.font = '40px Roboto, sans-serif';
    ctx.fillText(`Singleplayer - press ${translateKey(swapKeysAndValues(game.keybinds)["up"])}`, game.width/2, game.height/8 * 3);
    ctx.fillText(`Multiplayer - press ${translateKey(swapKeysAndValues(game.keybinds)["down"])}`, game.width/2, game.height/2);
    ctx.fillText('Press escape to edit controls', game.width/2, game.height/8 * 5);
    ctx.fillText("Currently under heavy development!", game.width/2, game.height/4);
    drawCircles(ctx, 2);

    ctx.font = '35px Roboto';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#000000';
    if (game.announcement) {
      ctx.fillText("Announcements", 20, 400);
      ctx.font = '25px Roboto';
      for (let i = 0; i < game.announcement.length; i++) {
        ctx.fillText(game.announcement[i], 20, 450 + 35 * i);
      }
    }

    let lst = game.lb_sp_hs;

    ctx.fillStyle = '#000000';
    ctx.font = '30px Roboto, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText("High Scores", 20, 80);
    ctx.font = '20px Roboto, sans-serif';
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = '#000000';
      if (game.loggedIn && lst[i] && lst[i].split(":")[0] == game.currentAccount.username) {
        ctx.fillStyle = '#00ffaa';
      }
      if (lst[i]) {
        let thing = lst[i].split(": ");
        let str = thing[0] + ": " + addCommas(thing[1]);
        ctx.fillText(str, 20, 110 + 25 * i);
      }
      else {
        ctx.fillText("Loading...", 20, 110 + 25 * i);
      }
    }

    lst = game.lb_mp_trophies;
    
    ctx.fillStyle = '#000000';
    ctx.font = '30px Roboto, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText("Current Trophies", game.width - 20, 80);
    ctx.font = '20px Roboto, sans-serif';
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = '#000000';
      if (game.loggedIn && lst[i] && lst[i].split(":")[0] == game.currentAccount.username) {
        ctx.fillStyle = '#00ffaa';
      }
      if (lst[i]) {
        let thing = lst[i].split(": ");
        let str = thing[0] + ": " + addCommas(thing[1]);
        ctx.fillText(str, game.width - 20, 110 + 25 * i);
      }
      else {
        ctx.fillText("Loading...", game.width - 20, 110 + 25 * i);
      }
    }


    if (game.loggedIn && game.currentAccount.username) { // what to draw if the player is logged in
      ctx.fillStyle = '#000000';
      ctx.font = '20px Roboto';
      ctx.textAlign = 'left';
      ctx.fillText(`Logged in as ${game.currentAccount.username}`, 10, 28);
    }
  }
};

game.title = {};

game.achAnim = null;

game.gameScreen = {
  directions: [],

  draw: (ctx) => {
    game.drewFrameThisTick = true;

    ctx.fillStyle = '#880000';
    ctx.font = '50px Roboto, sans-serif';
    ctx.textAlign = 'center';
    //ctx.fillText("Loading...", game.width/2, game.height * .6);

    let f = game.frames[0];

    let pushAmt = (game.frame % game.framesPerTick) * (1/game.framesPerTick);

    if (game.frames.length >= 1) {
      ctx.fillStyle = game.color;
      ctx.fillRect(0, 0, 1350, 650);
      if (!(f.paused)) {
        ctx.drawImage(drawGame(f, pushAmt), 0, 0);
      }
      else {
        ctx.drawImage(drawGame(f, 0), 0, 0);
      }
      let cf = ctx.font;    

      if (f.ticksWaited > 20 * 5 && f.tick == 0) {
        ctx.textAlign = 'center';
        ctx.font = '20px Roboto';
        ctx.fillStyle = '#000000';
        ctx.fillText("Move left or right to start!", game.width/2, 150);
      }

      ctx.fillStyle = '#000000';
      ctx.font = '20px Roboto';
      ctx.textAlign = 'right';

      // game runs at 20 tps on server
      let min = Math.floor(f.tick / (20 * 60));
      let sec = Math.floor(f.tick / 20) % 60;

      if (sec == 30 || (sec == 0 && min != 0)) {
        game.title = {
          time: 15,
          total: 15,
          color: '#f7a00a',
          lines: [
            "Survived 30 seconds!",
            "Difficulty increase"
          ]
        };
      }

      let str = min + ":";
      if (sec == 0) str += "00";
      else if (sec < 10) str += "0" + sec;
      else str += sec;

      ctx.fillText(str, game.width - 10, 25);

      if (game.title.time > 0) {
        game.title.time--;
        ctx.fillStyle = game.title.color;
        ctx.font = '30px Roboto';
        ctx.textAlign = 'center';
        ctx.globalAlpha = (game.title.time/game.title.total);
        for (let i = 0; i < game.title.lines.length; i++) {
          ctx.fillText(game.title.lines[i], game.width/2, game.height/2 - 50 + 40 * i);
        }
        ctx.globalAlpha = 1.0;
      }
      
      ctx.fillStyle = '#000000';
      ctx.font = cf;
      ctx.textAlign = 'center';

      if (f.paused) {
        let fo = ctx.font;
        ctx.fillStyle = '#000000';
        ctx.globalAlpha = 0.4;
        ctx.fillRect(0, 0, 1350, 650);
        ctx.globalAlpha = 0.7;
        ctx.fillRect(game.width/2 - 40, game.height/2 - 40, 30, 80);
        ctx.fillRect(game.width/2 + 10, game.height/2 - 40, 30, 80);
        ctx.font = '25px Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`paused (press ${translateKey(swapKeysAndValues(game.keybinds)["down"])})`, game.width/2, game.height/2 + 80)
        ctx.globalAlpha = 1.0;
        ctx.font = fo;
      }
    }
    else {
      game.drewFrameThisTick = false; // some other stuff needs to not get drawn if no new frame was drawn
    }

    ctx.fillStyle = '#000000';
    if (game.debugInfo) {
      ctx.fillText(game.frames.length, 30, 50);
    }
    if (f && f.gameType == "singleplayer") {
      ctx.fillText(addCommas(f.player.score), game.width/2, 50);
    }

    if (game.frame % game.framesPerTick == game.framesPerTick - 1) {
      game.frames.splice(0, 1);
    }
  }
};

game.endGameInfo = {};

game.gameOverScreen = {
  directions: [ "up" ],

  up: () => {
    game.currentScreen = game.homeScreen;
  },

  draw: (ctx) => {
    ctx.fillStyle = game.color;
    ctx.fillRect(0, 0, game.width, game.height);

    ctx.fillStyle = '#000000';
    ctx.font = '45px Roboto';
    ctx.textAlign = 'center';
    ctx.fillText(`Press ${translateKey(swapKeysAndValues(game.keybinds)["up"])} to continue`, game.width/2, game.height/2 - 20);
    
    if (game.endGameInfo.gameType == "singleplayer") {
      ctx.fillStyle = '#000000';
      ctx.font = '75px Roboto';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over!', game.width/2, 100);
      //ctx.fillText("ur bad at this game noob", game.width/2, game.height/2);
      // lol

      ctx.textAlign = 'left';
      ctx.font = '30px Roboto';
      ctx.fillText(`Score: ${addCommas(game.endGameInfo.score)}`, 20, game.height/7);

      //alert(game.endGameInfo.timeSurvived);
      let min = Math.floor(game.endGameInfo.timeSurvived / (20 * 60));
      let mins = "" + min;
      let sec = Math.floor(game.endGameInfo.timeSurvived / 20) % 60;
      let secs = "";
      if (sec == 0) secs = "00";
      else if (sec < 10) secs = "0" + sec;
      else secs = "" + sec; 
      ctx.fillText(`Time survived: ${mins}:${secs}`, 20, game.height/7 + 40);
    }
    else {
      ctx.fillStyle = '#000000';
      ctx.font = '50px Roboto';
      let str = game.endGameInfo.winner ? "Victory!" : "Defeat";
      ctx.fillText(str, game.width/2, 100);

      ctx.font = '30px Roboto';
      if (game.endGameInfo.winner) {
        ctx.fillText(`You defeated ${game.endGameInfo.opname}! +${game.endGameInfo.tgain} trophies!`, game.width/2, 175);
      }
      else {
        ctx.fillText(`You were defeated by ${game.endGameInfo.opname}. ${game.endGameInfo.tgain} trophies.`, game.width/2, 175);
      }
    }
  }
}

game.loggingIn = false;

let scrollChange = 14;

let sorted = false;

game.accountScreen = {

  scrollAmount: 0,

  directions: [ "right", "up", "down", "left" ],

  right: () => {
    if (game.loggingIn) { return; } // can't move away during a login request
    game.currentScreen = game.homeScreen;

    document.getElementById("signupUsername").setAttribute('type', 'hidden');
    document.getElementById("signupPassword").setAttribute('type', 'hidden');
    document.getElementById("loginUsername").setAttribute('type', 'hidden');
    document.getElementById("loginPassword").setAttribute('type', 'hidden');
  },

  left: () => {
    if (game.loggingIn) { return; } // can't move away during a login request
    game.currentScreen = game.aboutScreen;

    document.getElementById("signupUsername").setAttribute('type', 'hidden');
    document.getElementById("signupPassword").setAttribute('type', 'hidden');
    document.getElementById("loginUsername").setAttribute('type', 'hidden');
    document.getElementById("loginPassword").setAttribute('type', 'hidden');
  },

  up: () => {
    game.accountScreen.scrollAmount = Math.max(game.accountScreen.scrollAmount - scrollChange, 0);
  },

  down: () => {
    game.accountScreen.scrollAmount = Math.min(game.accountScreen.scrollAmount + scrollChange, 400);
  },

  hasMouseEvent: true,
  mouseMove: (x, y) => {
    if (!sorted) {
      game.accountScreen.stats.sort( (a, b) => { return a.priority - b.priority; } );
      game.accountScreen.multiplayer_stats.sort( (a, b) => { return a.priority - b.priority; } );
      sorted = true;
    }
    let scrollAmount = game.accountScreen.scrollAmount;
    let my = y + scrollAmount;
    let mx = x;

    for (let i = 0; i < game.accountScreen.stats.length; i++) {
      let s = game.accountScreen.stats[i];

      let x = game.width/6 * (i % 3 + 1);
      let y = 200 + 150 * Math.floor(i/3);
      
      if (mx >= x - 75 &&
          mx <= x + 75 &&
          my >= y &&
          my <= y + 100) {

        let st = s.stat;
        if (game.lbStatCodeName != st) {
          game.socket.emit("request_leaderboard_data", { stat: st, mainlb: false } );
        }
      }
    }
    for (let i = 0; i < game.accountScreen.multiplayer_stats.length; i++) {
      let s = game.accountScreen.multiplayer_stats[i];

      let x = game.width/6 * (i % 3 + 1);
      let y = Math.floor((game.accountScreen.stats.length - 1) / 3) * 150 + 480 + 150 * Math.floor(i/3);
      
      if (mx >= x - 75 &&
          mx <= x + 75 &&
          my >= y &&
          my <= y + 100) {

        let st = s.stat;
        if (game.lbStatCodeName != st) {
          game.socket.emit("request_leaderboard_data", { stat: st, mainlb: false } );
        }
      }
    }
  },

  hasClickEvent: true,
  mouseClick: (x, y) => {
    if (x >= 10 && x <= 130 && y >= 50 && y <= 100) {
      logOut();
    }
  },

  stats: [
    { priority: 0, name: "Achievement Points", stat: "achievementPoints", text: [
      (_ => addCommas(game.currentAccount.achievementPoints))
    ] },
    { priotiry: 1, name: "High Score", stat: "singleplayer_highScore", text: [
      (_ => addCommas(game.currentAccount.singleplayer_highScore)),
      (_ => {
        if (game.currentAccount.singleplayer_highScoreTimestamp) {
          return msToDate(game.currentAccount.singleplayer_highScoreTimestamp);
        }
        else return " ";
      })
    ] },
    { priotiry: 2, name: "Average (past 20)", stat: "singleplayer_average", text: [
      (_ => addCommas(game.currentAccount.singleplayer_average))
    ] },
    { priotiry: 3, name: "Games Played", stat: "singleplayer_gamesPlayed", text: [
      (_ => addCommas(game.currentAccount.singleplayer_gamesPlayed))
    ] },
    { priotiry: 4, name: "Best Potato Chain", stat: "singleplayer_bestPotatoChain", text: [
      (_ => addCommas(game.currentAccount.singleplayer_bestPotatoChain))
    ] },
    { priotiry: 5, name: "Best Broccoli Chain", stat: "singleplayer_bestBroccoliChain", text: [
      (_ => addCommas(game.currentAccount.singleplayer_bestBroccoliChain))
    ] },
    { priority: 6, name: "Best Carrot Chain", stat: "singleplayer_bestCarrotChain", text: [
      (_ => addCommas(game.currentAccount.singleplayer_bestCarrotChain))
    ] },
    { priotiry: 7, name: "Biggest Bounce", stat: "singleplayer_biggestBounce", text: [
      (_ => addCommas(game.currentAccount.singleplayer_biggestBounce))
    ] }
  ],

  multiplayer_stats: [
    { priority: 1, name: "Current Trophies", stat: "multiplayer_trophies", text: [
      (_ => addCommas(game.currentAccount.multiplayer_trophies))
    ] },
    { priority: 2, name: "Best Trophies", stat: "multiplayer_bestTrophies", text: [
      (_ => addCommas(game.currentAccount.multiplayer_bestTrophies))
    ] },
    { priority: 3, name: "Best Winstreak", stat: "multiplayer_bestWinstreak", text: [
      (_ => addCommas(game.currentAccount.multiplayer_bestWinstreak)),
      (_ => `(Current: ${addCommas(game.currentAccount.multiplayer_winstreak)})`)
    ] }
  ],

  draw: (ctx) => {
    ctx.fillStyle = game.color;
    ctx.fillRect(0, 0, game.width, game.height);

    if (game.loggedIn && game.currentAccount.username) { // what to draw if the player is logged in

      

      let scrollAmount = game.accountScreen.scrollAmount;

      function drawStat(cctx, x, y, name, vals) {
        if (y - scrollAmount < -50) return;
        if (y - scrollAmount > game.height) return;
        cctx.font = '15px Roboto';
        cctx.fillStyle = '#222222';
        cctx.globalAlpha = 0.3;
        cctx.fillRect(x - 75, y - scrollAmount, 150, 100);
        cctx.globalAlpha = 1.0;
        cctx.fillStyle = '#ffffff';
        cctx.fillText(name, x, y + 20 - scrollAmount);
        for (let i = 0; i < vals.length; i++) {
          cctx.fillText(vals[i] || "0", x, y + 50 + i*25 - scrollAmount);
        }
      }

      ctx.font = '30px Roboto';
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.fillText("Singleplayer", game.width/3, 120 - scrollAmount);
      ctx.fillText("Multiplayer", game.width/3, Math.floor((game.accountScreen.stats.length - 1) / 3) * 150 + 400 - scrollAmount);
      
      if (!sorted) {
        game.accountScreen.stats.sort( (a, b) => { return a.priority - b.priority; } );
        game.accountScreen.multiplayer_stats.sort( (a, b) => { return a.priority - b.priority; } );
        sorted = true;
      }

      for (let i = 0; i < game.accountScreen.stats.length; i++) {
        let s = game.accountScreen.stats[i];
        let vals = [];
        for (let j = 0; j < s.text.length; j++) {
          vals.push(s.text[j]() || "0");
        }

        let x = game.width/6 * (i % 3 + 1);
        let y = 200 + 150 * Math.floor(i/3);
        
        drawStat(ctx, x, y, s.name, vals);
      }

      for (let i = 0; i < game.accountScreen.multiplayer_stats.length; i++) {
        let s = game.accountScreen.multiplayer_stats[i];
        let vals = [];
        for (let j = 0; j < s.text.length; j++) {
          vals.push(s.text[j]() || "0");
        }

        let x = game.width/6 * (i % 3 + 1);
        let y = Math.floor((game.accountScreen.stats.length - 1) / 3) * 150 + 480 + 150 * Math.floor(i/3);
        
        drawStat(ctx, x, y, s.name, vals);
      }

      ctx.fillStyle = game.color;
      ctx.fillRect(0, 0, game.width, 65);

      ctx.fillStyle = '#222222';
      ctx.fillRect(10, 50, 120, 50);
      ctx.fillStyle = '#ffffff';
      ctx.font = '15px Roboto';
      ctx.textAlign = 'center';
      ctx.fillText("Click to log out!", 70, 80);

      ctx.fillStyle = '#000000';
      ctx.font = '20px Roboto';
      ctx.textAlign = 'left';
      ctx.fillText(`Logged in as ${game.currentAccount.username}`, 10, 28);
      ctx.textAlign = 'center';

      ctx.font = '40px Roboto';
      let kb = swapKeysAndValues(game.keybinds);
      ctx.fillText(`STATS (${kb.up}/${kb.down} to scroll)`, game.width/3, 50);

      ctx.font = '40px Roboto';
      ctx.textAlign = 'center';
      ctx.fillText("LEADERBOARD", game.width/6 * 5, 50);
      ctx.font = '30px Roboto';
      ctx.fillText(game.leaderboardStat, game.width/6 * 5, 100);

      let lst = game.leaderboard;

      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.font = '20px Roboto, sans-serif';
      for (let i = 0; i < lst.length; i++) {
        ctx.fillStyle = '#000000';
        if (game.loggedIn && lst[i].split(":")[0] == game.currentAccount.username) {
          ctx.fillStyle = '#00ffaa';
        }
        if (lst[i]) {
          let thing = lst[i].split(": ");
          let str = thing[0] + ": " + (addCommas(thing[1]) == "undefined" ? "0" : addCommas(thing[1]));
          ctx.fillText(`${i + 1}. ${str}`, game.width/6 * 5, 140 + 32 * i);
        }
        else {
          ctx.fillText("Loading...", game.width/6 * 5, 140 + 32 * i);
        }
      }

      ctx.fillStyle = game.color;
      ctx.fillRect(0, game.height - 100, game.width, 100);
      drawCircles(ctx, 1);

      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 5;
      ctx.moveTo(game.width/3 * 2, 0);
      ctx.lineTo(game.width/3 * 2, game.height);
      ctx.stroke();
    }
    else { // what to draw if the player isn't logged in
      if (!game.loggingIn) {
        ctx.fillStyle = '#000000';
        ctx.font = '20px Roboto';
        ctx.textAlign = 'left';
        ctx.fillText("Sign up -->", game.width/4, game.height * .37);
        ctx.fillText("Log in -->", game.width/4, game.height * .52);

        ctx.textAlign = 'center';
        ctx.fillText("Usernames and passwords must be alphanumeric (underscores are fine)", game.width/2, game.height*.6);
        ctx.fillText("and 3-16 characters in length.", game.width/2, game.height*.64);

        let su = document.getElementById("signupUsername");
        let sp = document.getElementById("signupPassword");
        let lu = document.getElementById("loginUsername");
        let lp = document.getElementById("loginPassword");

        

        if (su.value !== "" || sp.value !== "") {
          lu.disabled = true;
          lp.disabled = true;
        }
        else {
          lu.disabled = false;
          lp.disabled = false;
        }
        if (lu.value !== "" || lp.value !== "") {
          su.disabled = true;
          sp.disabled = true;
        }
        else {
          su.disabled = false;
          sp.disabled = false;
        }
      }
      else {
        let su = document.getElementById("signupUsername");
        let sp = document.getElementById("signupPassword");
        let lu = document.getElementById("loginUsername");
        let lp = document.getElementById("loginPassword");

        su.type = "hidden";
        sp.type = "hidden";
        lu.type = "hidden";
        lp.type = "hidden";

        ctx.fillStyle = '#000000';
        ctx.font = '50px Roboto';
        ctx.textAlign = 'center';
        ctx.fillText("Processing...", game.width/2, game.height/2);
      }

      drawCircles(ctx, 1);
    }
  }
}

let achHoverIndex = -1;
let achHoverX = -1;
let achHoverY = -1;
let achHoverText = [];

game.achievementsScreen = {

  scrollAmount: 0,

  directions: [ "right", "left", "up", "down" ],

  right: () => {
    game.currentScreen = game.shopScreen;
  },

  left: () => {
    game.currentScreen = game.homeScreen;
  },

  up: () => {
    game.achievementsScreen.scrollAmount = Math.max(game.achievementsScreen.scrollAmount - scrollChange, 0);
  },

  down: () => {
    game.achievementsScreen.scrollAmount = Math.min(game.achievementsScreen.scrollAmount + scrollChange, 400);
  },

  hasMouseEvent: true,
  mouseMove: (x, y) => {
    let mx = x;
    let my = y - game.achievementsScreen.scrollAmount;

    achHoverIndex = -1;
    achHoverX = -1;
    achHoverY = -1;
    achHoverText = [];

    if (!game.loggedIn) return; 

    for (let i = 0; i < game.currentAccount.achievements.length; i++) {
      let ach = game.currentAccount.achievements[i];
      let ax = ((i % 7) * (game.width * (1/3) * (1/6))) + (game.width/6 - 24);
      let ay = Math.floor(i/7) * (60) + game.height/3 - game.achievementsScreen.scrollAmount;

      if (x >= ax && x <= ax+48 && y >= ay && y <= ay+48) {
        achHoverIndex = i;
        achHoverX = mx;
        achHoverY = my;

        achHoverText = [ ach.name + ` (${ach.tier + 1})`, ach.descr, `(${ach.points} achievement points)` ];
      }
    }
  },

  draw: (ctx) => {
    ctx.fillStyle = game.color;
    ctx.fillRect(0, 0, game.width, game.height);

    
    ctx.fillStyle = '#000000';
    ctx.font = '100px Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ACHIEVEMENTS', game.width/2, 100);

    if (!game.loggedIn) {

      ctx.fillStyle = '#000000';
      ctx.font = '50px Roboto';
      ctx.textAlign = 'center';
      ctx.fillText("Login to see achievements!", game.width/2, game.height/2);
    }

    drawCircles(ctx, 3);

    if (game.loggedIn && game.currentAccount.username) { // what to draw if the player is logged in
      let scrollAmount = game.achievementsScreen.scrollAmount;

      ctx.fillStyle = '#000000';
      ctx.font = '20px Roboto';
      ctx.textAlign = 'left';
      ctx.fillText(`Logged in as ${game.currentAccount.username}`, 10, 28);

      ctx.fillStyle = '#000000';
      ctx.font = '20px Roboto';
      ctx.textAlign = 'center';
      ctx.fillText('Singleplayer Achievements', game.width/3, 200 - scrollAmount);

      if (!(game.currentAccount.achievements)) {
        return;
      }

      for (let i = 0; i < game.currentAccount.achievements.length; i++) {
        let ach = game.currentAccount.achievements[i];
        let x = ((i % 7) * (game.width * (1/3) * (1/6))) + (game.width/6 - 24);
        let y = Math.floor(i/7) * (60) + game.height/3 - scrollAmount;

        let t = ach.tier;

        if (t > 0) t = 9 - (ach.tiers - t);

        if (ach.tier == ach.tiers - 1) {
          let grad = ctx.createRadialGradient(x + 24, y + 24, 0, x + 24, y + 24, 64);
          grad.addColorStop(0, '#f0f0bd');
          grad.addColorStop(0.75, '#f0f0bd');
          grad.addColorStop(1, '#f0f0bd00');
          ctx.fillStyle = grad;
          ctx.fillRect(x - 8, y - 8, 64, 64);
        }

        drawAchievement(ctx, ach.name, x, y, t);
        
      }
      if (achHoverIndex != -1) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(achHoverX, achHoverY, 500, 100);
        ctx.fillStyle = '#ffffff';
        ctx.font = '18px Roboto';
        ctx.textAlign = 'left';

        for (let i = 0; i < achHoverText.length; i++) {
          ctx.fillText(achHoverText[i], achHoverX + 10, achHoverY + 23 + 30 * i);
        }
      }
    }
  }

}

game.shopScreen = {

  directions: [ "left" ],

  left: () => {
    game.currentScreen = game.achievementsScreen;
  },

  draw: (ctx) => {
    ctx.fillStyle = game.color;
    ctx.fillRect(0, 0, game.width, game.height);

    ctx.fillStyle = '#000000';
    ctx.font = '50px Roboto';
    ctx.textAlign = 'center';
    ctx.fillText("SHOP (Coming Soon!)", game.width/2, game.height/2);

    drawCircles(ctx, 4);

    if (game.loggedIn && game.currentAccount.username) { // what to draw if the player is logged in
      ctx.fillStyle = '#000000';
      ctx.font = '20px Roboto';
      ctx.textAlign = 'left';
      ctx.fillText(`Logged in as ${game.currentAccount.username}`, 10, 28);
    }
  }

}

game.aboutScreen = {

  directions: [ "right" ],

  right: () => {
    if (!game.loggedIn) {
      document.getElementById("signupUsername").setAttribute('type', 'text');
      document.getElementById("signupPassword").setAttribute('type', 'password');
      document.getElementById("loginUsername").setAttribute('type', 'text');
      document.getElementById("loginPassword").setAttribute('type', 'password');
    }
    game.currentScreen = game.accountScreen;
  },

  draw: (ctx) => {
    ctx.fillStyle = game.color;
    ctx.fillRect(0, 0, game.width, game.height);

    ctx.fillStyle = '#000000';
    ctx.font = '100px Roboto';
    ctx.textAlign = 'center';
    ctx.fillText("ABOUT", game.width/2, 100);

    ctx.font = '18px Roboto';
    ctx.textAlign = 'left';
    let y = 175;
    let yc = 25;
    ctx.fillText("Gameplay is pretty simple, but here are a few specifics:", 20, y);
    ctx.fillText("Jumping on vegetables gives points. Base values are as follows:", 20, y += yc);
    ctx.fillText("1,000 for a potato, 1,500 for broccoli, and 2000 for a carrot.", 20, y += yc);
    ctx.fillText("That value is then multiplied by the combo length.", 20, y += yc);
    ctx.fillText("Point values also increase by 10% every 30 seconds!", 20, y += yc);
    y += yc;
    ctx.fillText("Every 100,000 points, either a powerup or an item spawns.", 20, y += yc);
    ctx.fillText("Powerups are double points, surge (more spawns), and slow mo,", 20, y += yc);
    ctx.fillText("while items are teleport to top, point boost, and shield. Pressing up", 20, y += yc);
    ctx.fillText("uses the current item.", 20, y += yc);

    drawCircles(ctx, 0);

    if (game.loggedIn && game.currentAccount.username) { // what to draw if the player is logged in
      ctx.fillStyle = '#000000';
      ctx.font = '20px Roboto';
      ctx.textAlign = 'left';
      ctx.fillText(`Logged in as ${game.currentAccount.username}`, 10, 28);
    }
  }

}