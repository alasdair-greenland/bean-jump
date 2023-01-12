const announcement = [ 
  "Hey! Welcome to beanjump!", 
  "No longer in active development"
];

let Client = null;
let client = null;
let where = "server";

let accountsLoggedIn = [];

try {
  Client = require("@replit/database");
  client = new Client();
  require("dotenv").config();
  where = "replit";
}
catch(e) {
  const StormDB = require("stormdb");
  const engine = new StormDB.localFileEngine("./db.stormdb");
  const database = new StormDB(engine);
  client = {};
  client.get = function(key) {

    let result = {};

    result.db = database.get(`accounts.${key}`).value();
    database.save();

    result.then = function(f) {
      f(this.db);
      return this;
    }

    result.catch = function(err) {
      return this;
    }

    return result;
  };

  client.set = function(key, val) {

    let result = {};

    result.db = database.get(`accounts.${key}`).set(val);
    database.save();

    result.then = function(f) {
      try {
        f("foo");
      } catch(e) {
        clog(e);
      }
      return this;
    }

    result.catch = function(err) {
      return this;
    }

    return result;

  };
  client.getAll = function() {

    let result = {};

    result.db = database.get('accounts').value();
    database.save();

    clog(result.db);

    result.then = function(f) {
      f(this.db);
      return this;
    };

    result.catch = function(err) {
      return this;
    };

    return result;
  };
}

function clog(msg) {
  if (where == "replit") {
    console.log(msg);
  }
}

const { univ } = require("./server_game_code.js");
univ.names = {};
univ.achievements = {};
const { univ2 } = require("./server_multiplayer_game.js");
const { hashCode } = require("./hash_function.js");
const { achievements } = require("./achievements.js");

let keys = Object.keys(univ2);
for (let i = 0; i < keys.length; i++) {
  univ[keys[i]] = univ2[keys[i]]; // combine exports from both files into one
}

univ.sockets = {};
univ.client = client;
univ2.client = client;

const devPW = process.env.TESTPW;

const version = "0.0.1";

const crypto = require('crypto');

const express = require('express'); // REQUIRE STUFF
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const server = require('http').createServer(app);

const socketio = require('socket.io');
const { threadId } = require("worker_threads");
const io = socketio(server);

let numS = 0;
let numSChangeable = 0;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

let singlePlayerRooms = 0;

server.listen(3000, function() { // open server
	console.log('Server listening at port %d', 3000);

});

univ2.mrooms = [ { full: true, game: { dummyObject: true } } ];


io.on("connection", function(socket) {

  univ.sockets[socket.id] = {
    gameType: null,
    game: univ.makeGame(socket),
    achievements: {},
    user: "a"
  };

  socket.emit("announcement", announcement);

  socket.on("attemptCreate", (acc, hash, cb) => {

    clog('trying to create account');

    if (!(isAlphaNumeric(acc.username) || acc.username.length < 3 || acc.username.length > 16)) {
      cb(false, "Username either doesn't meet length requirements or isn't alphanumeric", null);
    }

    client.getAll().then(db => {
      let found = false;
      // need to search thru database to see if there's an account with that username
      let keys = Object.keys(db);
      //clog(keys);
      search: for (let i = 0; i < keys.length; i++) {
        let k = keys[i];
        if (k == acc.username) {
          cb(false, "Username Taken", null);
          clog("Username taken");
          found = true;
          break search;
        }
      }
      if (!found) {
        clog("created account " + acc.username);
        acc.pw = hash;
        client.set(acc.username, acc).then(_ => {
          let acc2 = JSON.parse(JSON.stringify(acc));
          acc2.pw = "";
          cb(true, "", acc2);
          return;
        });
      }
      return;

    }).catch(err => {});
  });

  socket.on("requestNumS", () => {
    if (numSChangeable < 0) {
      numSChangeable = 0;
    }
    if (numSChangeable == 0) { // its a number because we need to know how many people are using numS
      numS = Math.floor(Math.random() * 10000000000000);
    }
    numSChangeable++;
    socket.emit("pwTest", numS);
  });

  socket.on('attemptLogin', function(user, hash, numC, cb) {
    client.get(user, { raw: false }).then(acc => {

      if (accountsLoggedIn.includes(acc.username)) {
        cb(false, "Account is logged in elsewhere.");
        return;
      }
      
      let dbpw = acc.pw;
      dbpw += numS;
      dbpw += numC;
      dbpw = hashCode(dbpw);
      if (dbpw == hash) {
        let acc2 = JSON.parse(JSON.stringify(acc));
        accountsLoggedIn.push(acc2.username);
        acc2.pw = "";
        univ.names[socket.id] = user;
        cb(true, "", { username: acc2.username });

        univ.achievements[socket.id] = acc2.achievements || {};

        univ.sockets[socket.id].user = acc2.username;
      
        let obj = {};

        let keys = Object.keys(acc2);

        for (let i = 0; i < keys.length; i++) {
          let k = keys[i];
          if (k.startsWith("singleplayer_") || k.startsWith("multiplayer_") || k == "achievementPoints") {
            obj[k] = acc2[k];
          }
        }



        let achs = [];

        let akeys = Object.keys(achievements);

        //clog(JSON.stringify(acc2.achievements));

        for (let i = 0; i < akeys.length; i++) {
          let ach = achievements[akeys[i]];
          if (acc2.achievements && !(isNaN(acc2.achievements[ach.name] && acc2.achievements[ach.name] >= 0))) {
            achs.push({
              name: ach.name,
              id: ach.id,
              descr: ach.descr.replace('[t]', addCommas(ach.tiers[acc2.achievements[ach.name]])),
              tier: acc2.achievements[ach.name],
              tiers: ach.tiers.length,
              points: ach.points[acc2.achievements[ach.name]]
            });
          }
          else {
            /*
            achs.push({
              name: ach.secret ? "???" : ach.name,
              id: ach.id,
              descr: ach.secret ? "It's a secret!" : ach.descr.replace('[t]', addCommas(ach.tiers[0])),
              tier: -1,
              tiers: ach.tiers.length,
              points: ach.secret ? "?" : ach.points[0]
            });*/
          }
        }

        obj.achievements = achs;

        socket.emit("userData", JSON.stringify(obj));

      }
      else {
        cb(false, "Username or password is incorrect", null);
      }
      numSChangeable--;
    }).catch(err => {
      cb(false, "Username or password is incorrect", null);
    });
  });

  socket.on("start_singleplayer_game", function(name) {
    univ.sockets[socket.id] = {
      gameType: "singleplayer",
      game: univ.makeGame(socket),
      user: name
    };
    univ.sockets[socket.id].game.start();

  });

  socket.on("request_leaderboard_data", function(obj) {
    
    let stat = obj.stat;
    let main = obj.mainlb;

    client.getAll().then(db => {

      let arr = Object.values(db);
      arr.sort( (a, b) => {
        return ((b[stat] || 1) - (a[stat] || 2)); 
      } );

      let out = [];

      /*
      let pos = -1;
      loop: for (let i = 0; i < arr.length; i++) {
        if (arr[i].username == name) {
          pos = i + 1;
          break loop;
        }
      }*/

      for (let i = 0; i < 10; i++) {
        if (i < arr.length) {
          out.push(`${arr[i].username}: ${arr[i][stat]}`);
        }
        else {
          out.push("");
        }
      }

      socket.emit("lbdata", { "stat": stat, "arr": out, "main": main } );

    }).catch(err => {});

  });

  socket.on("start_multiplayer_game", function(name) {

    let trophies = 0;

    client.get(name, { raw: false }).then(acc => {
      trophies = acc.multiplayer_trophies || 0;

      let lroom = univ2.mrooms[univ2.mrooms.length - 1]; // last room
      if (lroom.full) {
        univ2.mrooms.push({
          p1name: name,
          full: false,
          game: univ.makeMGame(socket, name, trophies)
        });
        univ.sockets[socket.id] = univ.sockets[socket.id] || {};
        univ.sockets[socket.id].game = univ2.mrooms[univ2.mrooms.length - 1].game;
        univ.sockets[socket.id].game.setup();
      }
      else {
        lroom.full = true;
        lroom.game.sockets.p2 = socket;
        lroom.game.name2 = name;
        lroom.game.p2trophies = trophies;
        univ.sockets[socket.id] = univ.sockets[socket.id] || {};
        univ.sockets[socket.id].game = univ2.mrooms[univ2.mrooms.length - 1].game;
        univ.sockets[socket.id].game.intro(60);
      }
      univ.sockets[socket.id] = {
        gameType: "multiplayer",
        game: univ2.mrooms[univ2.mrooms.length - 1].game,
        user: name
      }
      
    }).catch(err => console.log(err));

    
  });

  socket.on("keyevent", function(e) {
    if (univ.sockets[socket.id] && (univ.sockets[socket.id].gameType === "singleplayer" || (univ.sockets[socket.id].gameType === "multiplayer" && univ.sockets[socket.id].game.sockets.p1.id === socket.id))) {
      univ.sockets[socket.id].game.handleInput(e, univ.sockets[socket.id].game.bj.player1);
    }
    else if (univ.sockets[socket.id]) {
      univ.sockets[socket.id].game.handleInput(e, univ.sockets[socket.id].game.bj.player2);
    }
  });

  socket.on("logOut", function() {
    if (univ.sockets[socket.id].user != "a") {
      let ind = accountsLoggedIn.indexOf(univ.sockets[socket.id].user);
      accountsLoggedIn.splice(ind, 1);
    }
    delete univ.sockets[socket.id];
  });

  socket.on("disconnect", function() {
    if (univ.sockets[socket.id].user != "a") {
      let ind = accountsLoggedIn.indexOf(univ.sockets[socket.id].user);
      accountsLoggedIn.splice(ind, 1);
    }
    delete univ.sockets[socket.id];
  });
});

function isAlphaNumeric(str) {
  var code, i, len;

  for (i = 0, len = str.length; i < len; i++) {
    code = str.charCodeAt(i);
    if (!(code > 47 && code < 58) && // numeric (0-9)
        !(code > 64 && code < 91) && // upper alpha (A-Z)
        !(code > 96 && code < 123)) { // lower alpha (a-z)
      return false;
    }
  }
  return true;
};

function addCommas(n) {
  if (!n) return "0";
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); // regex wizardry
}