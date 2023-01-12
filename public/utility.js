var game = game || {};

function mirrorImage(ctx, image, x = 0, y = 0, horizontal = false, vertical = false){
  ctx.save();  // save the current canvas state
  ctx.setTransform(
    horizontal ? -1 : 1, 0, // set the direction of x axis
    0, vertical ? -1 : 1,   // set the direction of y axis
    x + horizontal ? image.width : 0, // set the x origin
    y + vertical ? image.height : 0   // set the y origin
  );
  ctx.drawImage(image,0,0);
  ctx.restore(); // restore the state as it was when this function was called
}

function betterDrawImage(ctx, image, prop) {
  /*
    Possible properties:
    mh (boolean, mirror horizontally)
    mv (boolean, mirror vertically)
    x (int)
    y (int)
    scl (float, scale)
  */
  ctx.save(); // save canvas state
  ctx.setTransform(
    prop.mh ? -1 : 1, 0, // x axis
    0, prop.mv ? -1 : 1, // y axis
    (prop.x || 0) + (prop.mh ? image.width * (prop.scl || 1) : 0), // x origin
    (prop.y || 0) + (prop.mv ? image.height * (prop.scl || 1) : 0) // y origin
  );
  if (prop.brect) {
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, image.width * (prop.scl || 1), image.height * (prop.scl || 1));
    ctx.globalAlpha = 1.0;
  }
  ctx.drawImage(image, prop.cx, prop.cy, prop.cw, prop.ch, 0, 0, image.width * (prop.scl || 1), image.height * (prop.scl || 1));
  ctx.restore(); // restore canvas
}

function addCommas(n) {
  if (!n) return "0";
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); // regex wizardry
}

function isValidUsername(str) {
  function validChar(c) {
    let n = String.fromCharCode(c);
    return ((n >= 48 && n <= 57) || // 1-10
            (n >= 65 && n <= 90) || // capital letters
            (n >= 97 && n <= 122) || // lowercase letters
            (n == 95)); // underscore
  }

  let lst = str.split("");
  if (str.length < 3 || str.length > 16) { return false; }
  for (let i = 0; i < lst.length; i++) {
    if (!validChar(lst[i])) { return false; }
  }
  return true;
}

function isValidPassword(str) {
  
  let len = str.length;

  for (let i = 0; i < len; i++) {
    let code = str.charCodeAt(i);
    if (!(code > 47 && code < 58) && // numeric (0-9)
        !(code > 64 && code < 91) && // upper alpha (A-Z)
        !(code > 96 && code < 123) && // lower alpha (a-z)
        !([ "_", "!", "$", "#", "|", "/", ".", ",", "?" ].includes(str[i]))) { // underscore etc
      return false;
    }
  }
  return true;

}

function circle(ctx, x, y, r, bc) {
  let c = new Path2D(); // this starts the path called c
  c.moveTo(x + r, y); // sets the start point
  c.arc(x, y, r, 0, 2 * Math.PI); // draws an arc around the start point
  ctx.fill(c); // fills the arc
  if (bc) {
    ctx.stroke(c);
  }
}

function roundedRect(ctx, x, y, width, height, r, fill) {
  let c = new Path2D();
  c.moveTo(x + r, y); 
  c.lineTo((x + width) - r, y);
  c.arcTo(x + width, y, x + width, y + r, r);
  c.lineTo(x + width, (y + height) - r);
  c.arcTo(x + width, y + height, (x + width) - r, y + height, r);
  c.lineTo(x + r, y + height);
  c.arcTo(x, y + height, x, (y + height) - r, r);
  c.lineTo(x, y + r);
  c.arcTo(x, y, x + r, y, r);

  if (fill == 'fill') {
    ctx.fill(c);
  }
  else if (fill == 'fill-stroke') {
    ctx.fill(c);
    ctx.stroke(c);
  }
  else {
    ctx.stroke(c);
  }
}

function isAlphaNumeric(str) {
  let len = str.length;

  for (let i = 0; i < len; i++) {
    let code = str.charCodeAt(i);
    if (!(code > 47 && code < 58) && // numeric (0-9)
        !(code > 64 && code < 91) && // upper alpha (A-Z)
        !(code > 96 && code < 123) && // lower alpha (a-z)
        !(code == 95)) { // underscore
      return false;
    }
  }
  return true;
};

function copyObj(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function msToDate(ms) {
  let d = (new Date(ms)).toString();
  let lst = d.split(" ");
  return lst[1] + " " + lst[2] + ", " + lst[3];
}

function toRadians(n) {
  return n/180 * Math.PI;
}

function toDegrees(n) {
  return n/Math.PI * 180;
}

let _sqrtValues = {};
function _memoSqrt(a) {
  if (_sqrtValues[a]) return _sqrtValues[a];
  else {
    _sqrtValues[a] = Math.sqrt(a);
  }
  return _sqrtValues[a];
} // square root is slow, so instead we memorize values
function pythag(a, b) {
  return _memoSqrt(a * a + b * b);
}

function swapKeysAndValues(obj) {
  let vals = Object.values(obj);
  let keys = Object.keys(obj);
  let out = {};
  for (let i = 0; i < vals.length; i++) {
    out[vals[i]] = keys[i];
  }

  return out;
}

function translateKey(k) {
  if (k == "ArrowLeft") {
    return '<';
  }
  else if (k == "ArrowUp") {
    return '^';
  }
  else if (k == "ArrowRight") {
    return '>';
  }
  else if (k == "ArrowDown") {
    return 'v';
  }
  else if (k == " ") {
    return 'space';
  }
  else {
    return k;
  }
}

function addCookie(name, value, days) {
  if (!navigator.cookieEnabled) {
    return;
  }
  let dt = new Date;
  dt.setTime(dt.getTime() + (days*24*60*60*1000));
  let expires = "expires="+ dt.toUTCString();
  document.cookie = name + "=" + value + ";" + expires + ";path=/";
  console.log("Sucessfully created cookie " + name);
}

function getCookie(name) {
  if (!navigator.cookieEnabled) {
    return "";
  }
  let cname = name + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(cname) == 0) {
      return c.substring(cname.length, c.length);
    }
  }
  return "";
}

function deleteCookie(name) {
  addCookie(name, "", 0);
}
/*
function changeAndRenewCookie(name, value, expires) {
  addCookie(name, value, expires);
}*/

function saveKeybindsAsCookie() {
  let obj = swapKeysAndValues(game.keybinds);
  addCookie("keybinds", `${obj.up}|${obj.left}|${obj.down}|${obj.right}`, 14);
}

function loadKeybinds() {
  game.keybinds = {};
  let s = getCookie("keybinds");
  if (s) {
    let arr = s.split("|");
    game.keybinds[arr[0]] = "up";
    game.keybinds[arr[1]] = "left";
    game.keybinds[arr[2]] = "down";
    game.keybinds[arr[3]] = "right";
  }
  else {
    game.keybinds = {
      "w": "up",
      "a": "left",
      "s": "down",
      "d": "right"
    }
  }
}

function loadSkin(name) {

  game.currentSkin = name;

  game.sprites = new Image();
  game.sprites.src = `../media/skins/${name}.png`;

}

game.images = {
  bean: {
    name: 'bean',
    x: 50,
    y: 410,
    w: 240,
    h: 160,
    scl: .038,
    hbX: -5,
    hbY: 0
  },
  carrot: {
    name: 'carrot',
    x: 30,
    y: -300,
    w: 680,
    h: 450,
    scl: .115,
    hbX: 10,
    hbY: 133
  },
  broccoli: {
    name: 'broccoli',
    x: 40,
    y: 155,
    w: 280,
    h: 230,
    scl: .075,
    hbX: 8,
    hbY: 0
  },
  potato: {
    name: 'potato',
    x: 335,
    y: 160,
    w: 380,
    h: 250,
    scl: .08,
    hbX: 11,
    hbY: 0
  },
  fireball: {
    name: 'fireball',
    x: 950,
    y: 600,
    w: 235,
    h: 550,
    scl: .2,
    hbX: -5,
    hbY: 0
  },
  arrow: {
    name: 'arrow',
    x: 135,
    y: 550,
    w: 600,
    h: 600,
    scl: .04,
    hbX: -5,
    hbY: 0
  },
  shield: {
    name: 'shield',
    x: 750,
    y: 30,
    w: 600,
    h: 570,
    scl: .04,
    hbX: -5,
    hbY: 0
  }
};