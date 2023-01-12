var game = game || {};

const skinImages = [
  "carrot",
  "broccoli",
  "potato",
  "arrow",
  "shield",
  "fireball"
];

game.powerupRadius = 35;
game.powerupRadiusChange = 0.05;

let timeWaited = 0;

const dummyVegList = [
  {
    type: "carrot",
    x: 50,
    fromRight: 0,
    y: 100,
    width: 220,
    height: 45
  },
  {
    type: "broccoli",
    x: 250,
    fromRight: 0,
    y: 125,
    width: 150,
    height: 115
  },
  {
    type: "potato",
    x: 500,
    fromRight: 1,
    y: 150,
    width: 155,
    height: 60
  }
];

function drawGame(drawList, push) {
  let canvas = document.createElement('canvas');
  canvas.width = 1350;
  canvas.height = 650;
  let ctx = canvas.getContext('2d');

  //alert('frame: ' + game.frame);

  

  if (drawList.gameType === "singleplayer") {

    let pl = drawList.player;
    //pl.xv *= game.playerMoving;
    if (game.playerCollides) {
      //pl.yv = -55;
      game.playerCollides = 0;
    }
    let tr = {};
    if (game.frames.length >= 2) {
      tr.x = game.frames[1].player.x - pl.x;
      tr.y = game.frames[1].player.y - pl.y;
    }
    else {
      tr.x = pl.xv;
      tr.y = pl.yv;
    }

    if (pl.slow > 0) {
      push *= 0.4;
    }

    drawBackground(ctx, "default", {
      boost: (pl.double > 0),
      surge: (pl.surge > 0),
      slow: (pl.slow > 0)
    });
    
    if (game.powerupRadius < 35) {
      game.powerupRadiusChange = 0.05;
    }
    if (game.powerupRadius > 40) {
      game.powerupRadiusChange = -0.05;
    }
    game.powerupRadius += game.powerupRadiusChange;

    for (let i = 0; i < drawList.powerups.length; i++) {
      let p = drawList.powerups[i];

      let grd = ctx.createRadialGradient(p.x, p.y, 20, p.x, p.y, game.powerupRadius + 10);

      if (p.type == "powerup") {
        grd.addColorStop(0, '#ff0000');
        grd.addColorStop(1, '#ffffff');
        ctx.fillStyle = grd;
        circle(ctx, p.x, p.y, game.powerupRadius, false);
      }
      else {
        grd.addColorStop(0, '#3333ff');
        grd.addColorStop(1, '#ffffff');
        ctx.fillStyle = grd;
        circle(ctx, p.x, p.y, game.powerupRadius, false);
      }
      
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - 15, p.y - 15, 30, 30);
      ctx.strokeStyle = '#ffffff';
      ctx.strokeRect(p.x - 15, p.y - 15, 30, 30);
      ctx.globalAlpha = 1.0;
    }

    if (pl.shield > 0) {
      ctx.globalAlpha = (Math.abs(Math.sin(toRadians(pl.shield - push))) + 1)/3;
      ctx.fillStyle = '#00bb00';
      circle(ctx, (pl.x + pl.width/2 + tr.x * push), (pl.y + pl.height/2 + tr.y * push), 60);
      ctx.globalAlpha = 1;
    }


    let bean = game.images.bean;
    if (pl.arrow > 0) {
      betterDrawImage(ctx, game.sprites, {
        cx: bean.x,
        cy: bean.y,
        cw: bean.w,
        ch: bean.h,
        x: Math.max(0, Math.min(game.width - pl.width, pl.x - 5)) - bean.hbX, 
        y: pl.y - 3 - bean.hbY, 
        scl: bean.scl,
        mh: false,
        mv: false
      });
    }
    else {
      betterDrawImage(ctx, game.sprites, {
        cx: bean.x,
        cy: bean.y,
        cw: bean.w,
        ch: bean.h,
        x: Math.max(0, Math.min(game.width - pl.width, pl.x - 5 + tr.x * push)) - bean.hbX, 
        y: pl.y - 3 + tr.y * push - bean.hbY, 
        scl: bean.scl,
        mh: false,
        mv: false
      });
    }

    if (pl.yv >= 0 && pl.boost) {
      let img = game.images.fireball;
      ctx.globalAlpha = 0.5;
      ctx.drawImage(game.sprites, img.x, img.y, img.w, img.h, pl.x - 12 + tr.x * push, pl.y - 140 + tr.y * push, 100, 200);
      ctx.globalAlpha = 1;
    }

    if (pl.arrow > 0) {
      let img = game.images.arrow;
      ctx.drawImage(game.sprites, img.x, img.y, img.w, img.h, pl.x - 30, pl.y + pl.height/2 + 35, 156, 120);
    }

    if (game.showHitboxes) {
      ctx.strokeStyle = '#000000';

      if (!(pl.arrow > 0)) {
        ctx.strokeRect(Math.max(0, Math.min(game.width - pl.width, pl.x + pl.xv * push)), pl.y + pl.yv * push, 75, 50);
      }
      else {
        ctx.strokeRect(Math.max(0, Math.min(game.width - pl.width, pl.x)), pl.y + pl.yv * push, 75, 50);
      }
    }

    

    drawVegetables(ctx, drawList.vegetables, push);

    drawItemSlot(ctx, pl.heldItem);

    drawPowerupText(ctx, pl);

    return canvas;
  }
  else { // multiplayer!!!
    //pl.xv *= game.playerMoving;
    //push = 0;
    if (drawList.intro) {
      ctx.font = '50px Roboto';
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.fillText(`Starting in ${Math.ceil(drawList.time / 20)}...`, game.width/2, game.height/3);
      ctx.font = '30px Roboto';
      ctx.fillText(`Opponent: ${drawList.opname} (${drawList.optroph} trophies)`, game.width/2, game.height/2);
      return canvas;
    }
    if (drawList.setup) {
      timeWaited++;
      ctx.font = '50px Roboto';
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.fillText("Waiting for a second player...", game.width/2, game.height/2);
      if (timeWaited > 60 * 5 && timeWaited < 60 * 15) {
        ctx.font = '25px Roboto';
        ctx.fillText("Estimated time: " + Math.ceil((15 - timeWaited) / 60) + "s", game.width/2, game.height/2 + 100);  
      }
      return canvas;
    }
    timeWaited = 0;
    let pl1 = drawList.player1;
    let pl2 = drawList.player2

    if (game.playerCollides) {
      //pl.yv = -55;
      game.playerCollides = 0;
    }
    let tr1 = {};
    if (game.frames.length >= 2) {
      tr1.x = game.frames[1].player1.x - pl1.x;
      tr1.y = game.frames[1].player1.y - pl1.y;
    }
    else {
      tr1.x = pl1.xv;
      tr1.y = pl1.yv;
    }
    let tr2 = {};
    if (game.frames.length >= 2) {
      tr2.x = game.frames[1].player2.x - pl2.x;
      tr2.y = game.frames[1].player2.y - pl2.y;
    }
    else {
      tr2.x = pl2.xv;
      tr2.y = pl2.yv;
    }
    ctx.globalAlpha = (game.socket.id == drawList.sid ? 1 : .3);
    let bean = game.images.bean;
    betterDrawImage(ctx, game.sprites, {
      cx: bean.x,
      cy: bean.y,
      cw: bean.w,
      ch: bean.h,
      x: Math.max(0, Math.min(game.width - pl1.width, pl1.x - 5 + tr1.x * push)) - bean.hbX, 
      y: pl1.y - 3 + tr1.y * push - bean.hbY,
      scl: bean.scl,
      mh: false,
      mv: false
    });
    ctx.globalAlpha = (game.socket.id == drawList.sid ? .3 : 1);
    betterDrawImage(ctx, game.sprites, {
      cx: bean.x,
      cy: bean.y,
      cw: bean.w,
      ch: bean.h,
      x: Math.max(0, Math.min(game.width - pl2.width, pl2.x - 5 + tr2.x * push)) - bean.hbX, 
      y: pl2.y - 3 + tr2.y * push - bean.hbY, 
      scl: bean.scl,
      mh: false,
      mv: false
    });
    ctx.globalAlpha = 1;
    /*
    if (game.showHitboxes) {
      ctx.strokeStyle = '#000000';
      ctx.strokeRect(Math.max(0, Math.min(game.width - pl.width, pl.x + pl.xv * push)), pl.y + pl.yv * push, 75, 50);
    }*/

    drawVegetables(ctx, drawList.vegetables, push);

    return canvas;
  }
}

game.showHitboxes = false;

function drawVegetables(ctx, veg, push) {
  for (let i = 0; i < veg.length; i++) {
    let v = veg[i];
    let img = game.images[v.type];

    let yChangeAmt = 0;
    let yc1 = 0;
    let yc2 = 0;
    let grav = 2;

    if (v.dead) {
      yc1 = grav * v.deathTick * v.deathTick;
      yc2 = grav * (v.deathTick - 1) * (v.deathTick - 1);
      yChangeAmt = yc1 - yc2;
    }

    betterDrawImage(ctx, game.sprites, {
      cx: img.x,
      cy: img.y,
      cw: img.w,
      ch: img.h,
      x: v.x - (img.hbX * (v.fromRight ? 1 : 1)) + v.xv * push,
      y: v.y - img.hbY + yc2 + yChangeAmt * push,
      scl: img.scl,
      mh: v.fromRight,
      mv: false
    });
    if (game.showHitboxes) {
      ctx.strokeStyle = '#000001';
      ctx.fillStyle = '#000001';
      ctx.strokeRect(v.x + v.xv * push, v.y + yc2 + yChangeAmt * push, v.width, v.height);
    }
  }
}

game.updateScoreTexts = function(ctx) {
  for (let i = game.scoreTexts.length - 1; i >= 0; i--) {
    let st = game.scoreTexts[i];
    ctx.fillStyle = st.color;
    ctx.font = '30px Roboto, sans-serif';
    ctx.globalAlpha = st.a;
    if (game.drewFrameThisTick) {
      ctx.fillText(`+${st.score} (${st.chain}x ${st.type})`, st.x, st.y);
    }
    ctx.globalAlpha = 1;
    st.y -= 3;
    st.a *= .95;
    if (st.a <= .1) {
      game.scoreTexts.splice(i, 1);
    }
  }
}

function drawBackground(ctx, bg, modifs) {
  if (bg == "snow") {
    // eventually ill do backgrounds, rn i just need an if so i can have an else
  }
  else {
    // default
    let grad = ctx.createRadialGradient(game.width/2, game.height/2, 0, game.width/2, game.height/2, pythag(game.width/2, game.height/2));
    grad.addColorStop(0.55, game.color);
    if (modifs.boost) {
      grad.addColorStop(1, '#c431cc22');
    }
    else if (modifs.surge) {
      grad.addColorStop(1, '#e38a1722');
    }
    else if (modifs.slow) {
      grad.addColorStop(1, '#3574e822');
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, game.width, game.height);
  }
}

function drawItemSlot(ctx, item) {
  ctx.fillStyle = '#aaaaaa55';
  ctx.lineWidth = 1;
  roundedRect(ctx, 10, 10, 100, 100, 10, 'fill');

  if (item && item.name == 'arrow') {
    ctx.fillStyle = '#4499ff';
    roundedRect(ctx, 10, 10, 100, 100, 10, 'fill');
    let img = game.images.arrow;
    ctx.drawImage(game.sprites, img.x, img.y, img.w, img.h, 3, 11, 130, 91);
  }
  else if (item && item.name == 'shield') {
    ctx.fillStyle = '#00bb00';
    roundedRect(ctx, 10, 10, 100, 100, 10, 'fill');
    let img = game.images.shield;
    ctx.drawImage(game.sprites, img.x, img.y, img.w, img.h, 8, 18, 100, 85);
  }
  else if (item && item.name == 'boost') {
    ctx.fillStyle = '#8800ff';
    roundedRect(ctx, 10, 10, 100, 100, 10, 'fill');
    ctx.fillStyle = '#ffffff';
    ctx.font = '50px Roboto';
    ctx.textAlign = 'center';
    ctx.fillText('x4', 60, 75);
  }

  ctx.strokeStyle = '#000000';
  roundedRect(ctx, 10, 10, 100, 100, 10);
}

function drawPowerupText(ctx, pl) {
  if (pl.surge > 100) {
    ctx.fillStyle = '#e38a17';
    ctx.font = '40px Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("SURGE!", game.width/2, game.height/2 - 40);
  }
  else if (pl.slow > 180) {
    ctx.fillStyle = '#3574e8';
    ctx.font = '40px Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("SLOW MO!", game.width/2, game.height/2 - 40);
  }
  else if (pl.double > 60) {
    ctx.fillStyle = '#fb92f5';
    ctx.font = '40px Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("BOOST!", game.width/2, game.height/2 - 40);
  }
}