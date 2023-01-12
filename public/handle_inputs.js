var game = game || {};

window.onkeydown = function(e) {

  if (document.activeElement.id != "canvas") {
    return;
  }

  if (game.currentScreen == game.gameScreen) { // if we are in a game, send input to the server to be handled
    game.socket.emit("keyevent", getAction(e));
    return;
  }
  else { // if not in a game, handle input on client side
    if (e.key === "Escape" && !([ game.gameScreen, game.controlsScreen, game.gameOverScreen ].includes(game.currentScreen))) {
      game.lastScreen = game.currentScreen;
      game.currentScreen = game.controlsScreen;
      return;
    }
    let a = getAction(e);
    if (game.currentScreen.directions.includes(a)) { // if player can move in that direction from current screen...
      game.currentScreen[a](); // run the function for moving in that direction
      return; // and return
    }
    else if (game.currentScreen == game.accountsScreen && e.key === "Enter") { // sending a login/signup request...
      let signupUsername = document.getElementById("signupUsername");
      let signupPassword = document.getElementById("signupPassword");
      let loginUsername = document.getElementById("loginUsername");
      let loginPassword = document.getElementById("loginPassword");

      if (signupUsername.value != "" && signupPassword.value != "" && isAlphaNumeric(signupUsername.value) && isValidPassword(signupPassword.value)) {
        createAccount(signupUsername.value, signupPassword.value);
      }

      else if (loginUsername.value != "" && loginPassword.value != "" && isAlphaNumeric(loginUsername.value) && isValidPassword(loginPassword.value)) {
        attemptLogin(loginUsername.value, loginPassword.value);
      }
    }
    else if (game.currentScreen == game.controlsScreen) {
      if (e.key === " ") {
        game.keysInUse = [];
        game.controlIndex = 0;
      }
      else if (e.key === "Escape") {
        game.controlIndex = -1;
        let keys = Object.keys(game.keybinds);
        game.keysInUse = keys;
        game.currentScreen = game.lastScreen;
      }
      else {
        if (game.controlIndex > -1) {
          if (!(game.keysInUse.includes(e.key))) {
            game.newKeybinds[game.controlsList[game.controlIndex]] = e.key;
            game.keysInUse.push(e.key);
            game.controlIndex++;
            if (game.controlIndex > 3) {
              game.controlIndex = -1;
              game.keybinds = swapKeysAndValues(game.newKeybinds);
              saveKeybindsAsCookie();
              game.newKeybinds = { "up": "", "down": "", "right": "", "left": "" };
            }
          }
        }
      }
    }
  }
}

window.onkeyup = function(e) {

  /*
  if ([ "right", "left" ].includes(getAction(e))) {
    setTimeout(() => { game.playerMoving = 0 }, 1000/game.tps); // make sure the player draws as stopped next frame
  }*/

  if (game.currentScreen == game.gameScreen) {
    game.socket.emit("keyevent", `r_${getAction(e)}`);
    return;
  }
}

function getAction(e) { // gets the action from the key using the keybinds object
  return game.keybinds[e.key];
}