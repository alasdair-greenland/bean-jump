var game = game || {};

game.width = 1350;
game.height = 650;

game.socket = null;

function onLoad() {
  game.socket = io.connect(window.location.origin);

  game.loggedIn = false;

  game.updateLBTimer = 1;

  /*
  let h = prompt('hello');
  alert(h);
  if (h == "error") {
  }*/

  window.onerror = (message, source, lineno, colno, error) => alert(message + "\n in " + source + "\n on line " + lineno + "\n on frame " + game.frame);

  let canvas = document.getElementById("canvas");
  game.canvas = canvas;
  canvas.focus();
  let ctx = canvas.getContext('2d');
  game.ctx = ctx;

  let signupUsername = document.getElementById("signupUsername");
  let signupPassword = document.getElementById("signupPassword");
  let loginUsername = document.getElementById("loginUsername");
  let loginPassword = document.getElementById("loginPassword");

  /*
  let rect = game.canvas.getBoundingClientRect();
  signupUsername.style.x = rect.left + rect.width * .37;
  signupUsername.y = rect.top + 227;
  signupPassword.x = rect.left + rect.width * .52;
  signupPassword.y = rect.top + 227;
  loginUsername.x = rect.left + rect.width * .37;
  loginUsername.y = rect.top + 323;
  loginPassword.style.left = `${rect.left + rect.width * .52}px`;
  loginPassword.style.top = `${rect.top + 315}px`;*/

  signupUsername.addEventListener('keydown', function(event) {
    if (event.keyCode == 13) {
      let canvas = document.getElementById('canvas');
      canvas.focus();
      if (signupUsername.value != "" && signupPassword.value != "" && isAlphaNumeric(signupUsername.value) && isValidPassword(signupPassword.value)) {
        createAccount(signupUsername.value, signupPassword.value);
      }
    }
  });
  signupPassword.addEventListener('keydown', function(event) {
    if (event.keyCode == 13) {
      let canvas = document.getElementById('canvas');
      canvas.focus();
      if (signupUsername.value != "" && signupPassword.value != "" && isAlphaNumeric(signupUsername.value) && isValidPassword(signupPassword.value)) {
        createAccount(signupUsername.value, signupPassword.value);
      }
    }
  });
  loginUsername.addEventListener('keydown', function(event) {
    if (event.keyCode == 13) {
      let canvas = document.getElementById('canvas');
      canvas.focus();
      if (loginUsername.value != "" && loginPassword.value != "" && isAlphaNumeric(loginUsername.value) && isValidPassword(loginPassword.value)) {
        attemptLogin(loginUsername.value, loginPassword.value);
      }
    }
  });
  loginPassword.addEventListener('keydown', function(event) {
    if (event.keyCode == 13) {
      let canvas = document.getElementById('canvas');
      canvas.focus();
      if (loginUsername.value != "" && loginPassword.value != "" && isAlphaNumeric(loginUsername.value) && isValidPassword(loginPassword.value)) {
        attemptLogin(loginUsername.value, loginPassword.value);
      }
    }
  });

  let canvas2 = document.getElementById("canvas2");
  let ctx2 = canvas.getContext('2d');
  game.ctx2 = ctx2; // 2nd canvas is to draw game, which is then drawn from canvas2 onto canvas

  game.tps = 20;
  game.framesPerTick = 3;
  game.frame = 0;

  game.leaderboardStat = "Hover over a stat";
  game.leaderboard = [];
  game.lbStatCodeName = "";
  game.playerPos = -1;

  game.lb_sp_hs = [];
  game.lb_mp_trophies = [];

  game.leaderboardStatNames = {
    "singleplayer_highScore": "High Score (Singleplayer)",
    "singleplayer_average": "Average of 20 (Singleplayer)",
    "singleplayer_bestPotatoChain": "Best Potato Chain (SP)",
    "singleplayer_bestBroccoliChain": "Best Broccoli Chain (SP)",
    "singleplayer_bestCarrotChain": "Best Carrot Chain (SP)",
    "singleplayer_gamesPlayed": "Games played (Singleplayer)",
    "singleplayer_biggestBounce": "Biggest Bounce (Singleplayer)",

    "achievementPoints": "Achievement Points",

    "multiplayer_trophies": "Current Trophies (Multiplayer)",
    "multiplayer_bestTrophies": "Highest Trophies (Multiplayer)",
    "multiplayer_bestWinstreak": "Longest Winstreak (Multiplayer)"
  };

  game.color = '#2f8db5';

  game.currentScreen = game.homeScreen;

  game.playerMoving = 0; // this variable stores whether or not the player is moving. Important to adjust animation frames correctly.
  game.playerCollides = false; // stores whether the player collides NEXT frame (important for animation)

  game.frames = [];
  
  loadKeybinds();
  saveKeybindsAsCookie();

  let s = getCookie("loggedin");
  if (s) {
    let arr = s.split("|");
    attemptLogin(arr[0], arr[1]);
  }

  game.socket.on('pwTest', function(numS) {
    finishLogin(numS, game.liUser, game.liPass);
  });

  game.socket.on('userData', function(arg) {
    //alert(JSON.stringify(arg));
    if (!(game.loggedIn)) {
      return;
    }
    let obj = JSON.parse(arg);
    let keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
      game.currentAccount[keys[i]] = obj[keys[i]];
    }
    game.currentAccount.achievements.sort( (a, b) => { b.id - a.id });
  });
  
  game.socket.on('achAnim', function(obj) {
    game.achAnim = obj;
    for (let i = 0; i < game.currentAccount.achievements.length; i++) {
      let ach = game.currentAccount.achievements[i];
      if (ach.id == obj.id) {
        ach.tier = obj.tier;
        return;
      }
    }
  });

  game.socket.on('announcement', function(ann) {
    game.announcement = ann;
  });

  game.canMakeHits = true;

  game.socket.on("displayGame", function(lst) {
    //alert("hey!");

    let obj = JSON.parse(lst);
    game.frames.push(obj);

    if (game.frames.length > 5) {
      game.frames.splice(0, 1); // prevent frames from getting too behind
    } // skipping not a problem b/c this is usually only when the game defocuses

    if (obj.intro) return;

    game.canMakeHits = !obj.paused;

    if (obj.gameType == "singleplayer" && game.canMakeHits) {
      let hits = obj.player.hits;
      for (let i = 0; i < hits.length; i++) {
        let h = hits[i];
        h.a = 1.0;
        switch (h.type) {
          case "carrot": h.color = '#f79914'; break;
          case "broccoli": h.color = '#3bde64'; break;
          case "potato": h.color = '#f0d8a1'; break;
        }
        if (h.boost) {
          h.color = '#fb92f5';
        }
        game.scoreTexts.push(h);
      }
    }

    let c = obj.current;
    game.playerCollides = c.collision;
    game.playerMoving = c.moving;

    

  });

  game.scoreTexts = [];

  game.socket.on("endGame", function(ei) {
    game.endGameInfo = ei;
    setTimeout(() => { // wait a few ticks so animation can catch up (because it's buffered slightly)
      game.currentScreen = game.gameOverScreen;
      game.frames = [];
    }, 2000/game.tps);
  });

  game.socket.on("lbdata", function(obj) {
    if (obj.stat == "singleplayer_highScore") {
      game.lb_sp_hs = obj.arr;
    }
    else if (obj.stat == "multiplayer_trophies") {
      game.lb_mp_trophies = obj.arr;
    }
    if (!obj.main) {
      game.leaderboardStat = game.leaderboardStatNames[obj.stat];
      game.leaderboard = obj.arr;
      game.lbStatCodeName = obj.stat;
    }
  });

  loadSkin('default');

  main();
}

function main() {

  let ctx = game.ctx;

  game.currentScreen.draw(ctx);

  
  if (game.achAnim) {
    if (game.achAnim.time > 1000) {
      game.achAnim = null;
      main();
      return;
    }
    let x = 250;
    let y = -200 + (500 - Math.abs(500 - game.achAnim.time));
    if (y > 25) y = 25;
    
    game.achAnim.time += 2;

    ctx.fillStyle = '#000000';
    ctx.fillRect(x, y, 300, 60);
    drawAchievement(ctx, game.achAnim.name, x + 6, y + 6, game.achAnim.tier);
    ctx.font = '20px Roboto';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText("ACHIEVEMENT GET!", x + 70, y + 24);
    ctx.fillText(`${game.achAnim.name} (tier ${game.achAnim.tier + 1})`, x + 70, y + 48);
  }

  game.updateLBTimer--;

  if (game.updateLBTimer <= 0) {
    game.updateLBTimer = 60 * 20;

    game.socket.emit("request_leaderboard_data", { stat: "singleplayer_highScore", mainlb: true });
    game.socket.emit("request_leaderboard_data", { stat: "multiplayer_trophies", mainlb: true });
  }

  game.frame++;
  game.updateScoreTexts(game.ctx2);

  let refresh = 1000 / (game.framesPerTick * game.tps);

  if (game.currentScreen == game.gameScreen && game.frames.length > 1) {
    refresh *= .3; // catch up if we fall behind
  }

  refresh = Math.floor(refresh) || 1;
  
  setTimeout(main, refresh); // refresh rate is faster than tick rate
}

window.onmousemove = (evt) => {
  let rect = game.canvas.getBoundingClientRect();
  let x = evt.x - rect.left;
  let y = evt.y - rect.top;

  if (game.currentScreen.hasMouseEvent) {
    game.currentScreen.mouseMove(x, y);
  }
}

window.onmousedown = evt => {
  let rect = game.canvas.getBoundingClientRect();
  let x = evt.x - rect.left;
  let y = evt.y - rect.top;

  if (game.currentScreen.hasClickEvent) {
    game.currentScreen.mouseClick(x, y);
  }
}