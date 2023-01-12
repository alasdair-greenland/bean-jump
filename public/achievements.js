var game = game || {};

/*
  Icons are 16x16 pixels, coded in here
  "b" = background color
  "h" = highlight color
  "r" = border color
  "t" = tier color
  "y" = tier color 2
  "w" = white
  "l" = black
*/

game.iconFormats = {
  "Point Scorer": [
    "rrrrrrrrrrrrrrrr",
    "rrbbbbbbbbbbbbrr",
    "rbbbbbbttbbbbbbr",
    "rbbbbbbttbbbbbbr",
    "rbbbbbttttbbbbbr",
    "rbbbbbtyytbbbbbr",
    "rbbbtttyytttbbbr",
    "rbtttyyyyyytttbr",
    "rbtttyyyyyytttbr",
    "rbbbtttyytttbbbr",
    "rbbbbbtyytbbbbbr",
    "rbbbbbttttbbbbbr",
    "rbbbbbbttbbbbbbr",
    "rbbbbbbttbbbbbbr",
    "rrbbbbbbbbbbbbrr",
    "rrrrrrrrrrrrrrrr"
  ],
  "Big Bounce": [
    "rrrrrrrrrrrrrrrr",
    "rrbbbyyyyyybbbrr",
    "rbbbbbbyybbbbbbr",
    "rbbbbbbbbbbbbbbr",
    "rbbttttttttttbbr",
    "rybbbbbbbbbbbbyr",
    "rybbbbbbbbbbbbyr",
    "ryybbttttttbbyyr",
    "ryybbbbbbbbbbyyr",
    "rybbbbbbbbbbbbyr",
    "rybbbbbttbbbbbyr",
    "rbbbbbbbbbbbbbbr",
    "rbbbbbbbbbbbbbbr",
    "rbbbbbbyybbbbbbr",
    "rrbbbyyyyyybbbrr",
    "rrrrrrrrrrrrrrrr"
  ],
  "AFK": [
    "rrrrrrrrrrrrrrrr",
    "rrtbbbbttbbbbtrr",
    "rtttbbbttbbbtttr",
    "rbtttbbttbbtttbr",
    "rbbtttbttbtttbbr",
    "rbbbttttttttbbbr",
    "rbbbbttyyttbbbbr",
    "rtttttyyyytttttr",
    "rtttttyyyytttttr",
    "rbbbbttyyttbbbbr",
    "rbbbttttttttbbbr",
    "rbbtttbttbtttbbr",
    "rbtttbbttbbtttbr",
    "rtttbbbttbbbtttr",
    "rrtbbbbttbbbbtrr",
    "rrrrrrrrrrrrrrrr"
  ],
  "Potato Combo": [
    "rrrrrrrrrrrrrrrr",
    "rrbbbbbbbbbbbbrr",
    "rbbbbbbbbbbbbbbr",
    "rbbbbbbbbbbbbbbr",
    "rbbbbbbbbbbbbbbr",
    "rbbbbbttttbbbbbr",
    "rbbbttttttttbbbr",
    "rbbttttttttttbbr",
    "rbbttttttttttbbr",
    "rbbbttttttttybbr",
    "rbbbbbttttyubbbr",
    "rbbbbbbyyyybbbbr",
    "rbbbbbbbbbbbbbbr",
    "rbbbbbbbbbbbbbbr",
    "rrbbbbbbbbbbbbrr",
    "rrrrrrrrrrrrrrrr"
  ],
  "Broccoli Combo": [
    "rrrrrrrrrrrrrrrr",
    "rrbbbbbbbbbbbbrr",
    "rbbbbbbbbbbbbbbr",
    "rbbbbttttttbbbbr",
    "rbbttttytttttbbr",
    "rbbtyttttttttybr",
    "rbbtttttttyttybr",
    "rbbttttytttttybr",
    "rbbbttttttttybbr",
    "rbbbbbttttyybbbr",
    "rbbbbbbttybbbbbr",
    "rbbbbbbttybbbbbr",
    "rbbbbbbbyybbbbbr",
    "rbbbbbbbbbbbbbbr",
    "rrbbbbbbbbbbbbrr",
    "rrrrrrrrrrrrrrrr"
  ],
  "Carrot Combo": [
    "rrrrrrrrrrrrrrrr",
    "rrbbbbbbbbbbbbrr",
    "rbbbbbbbbbbtbbbr",
    "rbbbbbbbbbtbtbbr",
    "rbbbbbbbbbttbbbr",
    "rbbbbbbbbtttttbr",
    "rbbbbbbbtttybbbr",
    "rbbbbbbtttybbbbr",
    "rbbbbbtttybbbbbr",
    "rbbbbtttybbbbbbr",
    "rbbbtttybbbbbbbr",
    "rbbbttybbbbbbbbr",
    "rbbtybbbbbbbbbbr",
    "rbbbbbbbbbbbbbbr",
    "rrbbbbbbbbbbbbrr",
    "rrrrrrrrrrrrrrrr"
  ],
  "PLACEHOLDER": [
    "rrrrrrrrrrrrrrrr",
    "rrbbbbbbbbbbbbrr",
    "rbbbbbbbbbbbbbbr",
    "rbbbbbbbbbbbbbbr",
    "rbbbbbbbbbbbbbbr",
    "rbbbbbbbbbbbbbbr",
    "rbbbbbbbbbbbbbbr",
    "rbbbbbbbbbbbbbbr",
    "rbbbbbbbbbbbbbbr",
    "rbbbbbbbbbbbbbbr",
    "rbbbbbbbbbbbbbbr",
    "rbbbbbbbbbbbbbbr",
    "rbbbbbbbbbbbbbbr",
    "rbbbbbbbbbbbbbbr",
    "rrbbbbbbbbbbbbrr",
    "rrrrrrrrrrrrrrrr"
  ],
  "Q_MARK": [
    "rrrrrrrrrrrrrrrr",
    "rrbbbbbbbbbbbbrr",
    "rbbbbttttttbbbbr",
    "rbbbtttybtttbbbr",
    "rbbbttybbbttybbr",
    "rbbbbyybbbttybbr",
    "rbbbbbbbbtttybbr",
    "rbbbbbbbtttybbbr",
    "rbbbbbbtttybbbbr",
    "rbbbbbbttybbbbbr",
    "rbbbbbbbyybbbbbr",
    "rbbbbbbbbbbbbbbr",
    "rbbbbbbttbbbbbbr",
    "rbbbbbbttybbbbbr",
    "rrbbbbbbyybbbbrr",
    "rrrrrrrrrrrrrrrr"
  ]
};

game.ach_highlight = '#d9a523';
game.ach_border = '#453408';

game.ach_unwon_c1 = '#777777';
game.ach_unwon_c2 = '#aaaaaa';
game.ach_unwon_bg = '#444444';

game.achSchemes = [
  {
    color1: '#b07435',
    color2: '#92ad72',
    bg: '#82661f'
  },
  {
    color1: '#d4b159',
    color2: '#a13e30',
    bg: '#692117'
  },
  {
    color1: '#f54105',
    color2: '#b8566b',
    bg: '#702434'
  },
  {
    color1: '#d9163d',
    color2: '#ad47ac',
    bg: '#541b53'
  },
  {
    color1: '#c719e6',
    color2: '#6b4bab',
    bg: '#3d2273'
  },
  {
    color1: '#0800e6',
    color2: '#5282cc',
    bg: '#1f4c91'
  },
  {
    color1: '#89a2d6',
    color2: '#58b9bf',
    bg: '#1f5a5e'
  },
  {
    color1: '#f0f0bd',
    color2: '#66662e',
    bg: '#8f8f6d'
  },
  {
    color1: '#f0f0bd',
    color2: '#66662e',
    bg: '#8f8f6d'
  }
];

game.ach_images = {};

function drawAchievement(ctx, title, x, y, scheme) {
  // scheme is pre-calculated to be the index of the scheme to use

  let name = "";
  let keys = Object.keys(game.iconFormats);
  if (keys.includes(title)) name = title;
  else if (title == "???") name = "Q_MARK";
  else name = "PLACEHOLDER";

  let obj = game.ach_images;
  
  if (obj && obj[name] && obj[name].scheme == scheme) { // image has been drawn, and we can use that version instead of a new one
    ctx.drawImage(obj[name].canvas, x, y);
    return;
  }

  obj[name] = {
    "scheme": scheme,
    "canvas": null
  };

  let canvas = document.createElement('canvas');
  canvas.style.display = "none";
  let ctx2 = canvas.getContext('2d');
  canvas.width = 48;
  canvas.height = 48;

  let colors = {
    b: (scheme == -1 ? game.ach_unwon_bg : game.achSchemes[scheme].bg),
    h: game.ach_highlight,
    r: game.ach_border,
    t: (scheme == -1 ? game.ach_unwon_c1 : game.achSchemes[scheme].color1),
    y: (scheme == -1 ? game.ach_unwon_c2 : game.achSchemes[scheme].color2)
  };

  let lst = game.iconFormats[name];
  for (let y = 0; y < lst.length; y++) {
    let innerList = lst[y].split("");
    for (let x = 0; x < innerList.length; x++) {
      ctx2.fillStyle = colors[ innerList[x] ];
      ctx2.fillRect(x * 3, y * 3, 3, 3);
    }
  }

  obj[name].canvas = canvas;
  ctx.drawImage(canvas, x, y);
}