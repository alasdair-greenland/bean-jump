const achievements = {

  "Point Scorer": {
    name: "Point Scorer",
    id: 0,
    descr: "Score [t] points in one run",
    type: "Singleplayer",
    secret: false,
    tiers: [ 25e3, 5e4, 1e5, 2e5, 5e5, 1e6, 2e6, 5e6, 1e7 ],
    points: [ 10, 20, 30, 50, 90, 150, 220, 300, 400 ]
  },

  "Dedicated": {
    name: "Dedicated",
    id: 1,
    descr: "Score [t] lifetime points",
    type: "Singleplayer",
    secret: false,
    tiers: [ 5e5, 1e6, 25e5, 5e6, 1e7, 5e7, 1e8, 5e8 ],
    points: [ 20, 40, 80, 120, 160, 200, 300, 500 ]
  },

  "Big Bounce": {
    name: "Big Bounce",
    id: 2,
    descr: "Score [t] points in one bounce",
    type: "Singleplayer",
    secret: false,
    tiers: [ 5e3, 1e4, 2e4, 3e4, 5e4, 1e5 ],
    points: [ 10, 30, 50, 80, 120, 200 ]
  },

  "Potato Combo": {
    name: "Potato Combo",
    id: 3,
    descr: "Hit [t] potatoes in a row",
    type: "Singleplayer",
    secret: false,
    tiers: [ 4, 7, 10, 15, 20 ],
    points: [ 10, 40, 70, 100, 200 ]
  },

  "Broccoli Combo": {
    name: "Broccoli Combo",
    id: 4,
    descr: "Hit [t] broccoli in a row",
    type: "Singleplayer",
    secret: false,
    tiers: [ 4, 7, 10, 15, 20 ],
    points: [ 10, 40, 70, 100, 200 ]
  },

  "Carrot Combo": {
    name: "Carrot Combo",
    id: 5,
    descr: "Hit [t] carrots in a row",
    type: "Singleplayer",
    secret: false,
    tiers: [ 4, 7, 10, 15, 20 ],
    points: [ 10, 40, 70, 100, 200 ]
  },

  "Potato Maniac": {
    name: "Potato Maniac",
    id: 6,
    descr: "Score [t] points from one potato",
    type: "Singleplayer",
    secret: true,
    tiers: [ 2e4, 5e4, 1e5 ],
    points: [ 100, 150, 300 ]
  },

  "AFK": {
    name: "AFK",
    id: 7,
    descr: "Don't move for [t]s at the start of the game",
    type: "Singleplayer",
    secret: true,
    tiers: [ 15, 60 ],
    points: [ 100, 300 ]
  },

  "Famous": {
    name: "Famous",
    id: 8,
    descr: "Become top [t] in any statistic",
    type: "Singleplayer",
    secret: true,
    tiers: [ 10, 3 ],
    points: [ 100, 300 ]
  },

  "Weird Hands": {
    name: "Weird Hands",
    id: 9,
    descr: "Set your controls to b, e, a, and n",
    descrFinished: "Score 200,000 points with bean controls",
    type: "Singleplayer",
    secret: true,
    tiers: [],
    points: [ 10, 200 ]
  }

}

module.exports = { achievements };