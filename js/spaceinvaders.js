/* global CreateInvaders */
/* global CreateRockets */
/* global CreateBombs */
  
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
////  spaceinvaders.js
////
//// The core logic for the space invaders game.
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//// Game Class
////
//// The Game class represents a Space Invaders game.
////
//// Create an instance of it, change any of the default values in the settings, and call 'start' to run the game.
//// 
//// Call 'moveShip' or 'shipFire' to control the ship.
//// 
//// Listen for 'gameWon' or 'gameLost' events to handle the game ending.
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

//  Creates an instance of the Game class.
function Game(gameCanvas, invaderImgs, ufoImg) {

  //  Set the initial config.
  this.config = {
    fps: 50,
    bombs: { rate: 0.05, minVelocity: 50, maxVelocity: 50 },
    invaders: { initialVelocity: 25, acceleration: 5, dropDistance: 20, ranks: 5, files: 10, width: 40, points: 5 },
    rockets: { velocity: 500, maxFireRate: 4, max: 1 },
    game: { width: 500, height: 400 },
    ship: { speed: 120, width: 75, height: 25 },

    levelDifficultyMultiplier: 0.2,

    debugMode: false,

    // countdown to start of game
    get startTime() {
      return this.debugMode ? 0 : 3;
    }
  };

  //  All state is in the variables below.
  this.lives = 3;
  this.width = 0;
  this.height = 0;
  this.gameBounds = { left: 0, top: 0, right: 0, bottom: 0 };
  this.intervalId = 0;
  this.score = 0;
  this.level = 1;

  //  The generic game engine.
  this.engine = new Engine(this);

  //  Input/output
  this.gameCanvas = gameCanvas;

  // Create and load the sounds.
  this.sounds = new Sounds();
  this.sounds.init();
  this.sounds.loadSound("shoot", document.getElementById("shoot-sound"));
  this.sounds.loadSound("bang", document.getElementById("bang-sound"));
  this.sounds.loadSound("invader-killed", document.getElementById("invader-killed-sound"));
  this.sounds.loadSound("explosion", document.getElementById("explosion-sound"));
  this.sounds.loadSound("ufo-killed", document.getElementById("ufo-killed-sound"));
  this.sounds.loadSound("ufo", document.getElementById("ufo-sound"));
  this.sounds.loadSound("invader1", document.getElementById("invader1-sound"));
  this.sounds.loadSound("invader2", document.getElementById("invader3-sound"));
  this.sounds.loadSound("invader3", document.getElementById("invader3-sound"));

  //  Set the game width and height.
  this.width = gameCanvas.width = 800;
  this.height = gameCanvas.height = 600;

  //  Set the state game bounds.
  var gameCfg = this.config.game;
  this.gameBounds = {
    left: this.gameCanvas.width / 2 - gameCfg.width / 2,
    right: this.gameCanvas.width / 2 + gameCfg.width / 2,
    top: this.gameCanvas.height / 2 - gameCfg.height / 2,
    bottom: this.gameCanvas.height / 2 + gameCfg.height / 2
  };

  var cfg = this.config;
  cfg.ufo = {
    points: 10,
    maxSpeedFactor: 3,
    width: 75,
    get delay() {
      return cfg.debugMode ? 5 : 10;
    },
    img: ufoImg
  };

  this.invaderImgs = invaderImgs;
};

//  Start the Game.
Game.prototype = {
  start: function () {
    //  Move into the 'welcome' state.
    this.engine.moveTo(new WelcomeState());

    //  Set the game variables.
    this.lives = 3;
    this.config.debugMode = this.config.debugMode || /debug=true/.test(window.location.href);

    //  Start the game loop.
    var game = this;
    this.intervalId = setInterval(
      function () { game.engine.tick(game.config.fps, game.gameCanvas); },
      1000 / this.config.fps);
  },

  //  The stop function stops the game.
  stop: function () {
    clearInterval(this.intervalId);
  },

  reset: function () {
    game.lives = 3;
    game.score = 0;
    game.level = 1;
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//// Welcome State
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function WelcomeState() {
}

WelcomeState.prototype = {
  draw: function (ctx, dt, game) {

    //  Clear the background.
    ctx.clearRect(0, 0, game.width, game.height);

    ctx.font = "30px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.textBaseline = "center";
    ctx.textAlign = "center";
    ctx.fillText("Space Invaders", game.width / 2, game.height / 2 - 40);
    ctx.font = "16px Arial";

    ctx.fillText("Press 'Space' to start.", game.width / 2, game.height / 2);
  },

  keyDown: function (game, keyCode, e) {
    if (keyCode === 32) /*space*/ {
      //  Space starts the game.
      game.reset();
      game.engine.moveTo(new LevelIntroState(game.level));

      e.preventDefault();
    }
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//// Game Over State
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function GameOverState() {
}

GameOverState.prototype = {
  draw: function (ctx, dt, game) {
    //  Clear the background.
    ctx.clearRect(0, 0, game.width, game.height);

    ctx.font = "30px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.textBaseline = "center";
    ctx.textAlign = "center";
    ctx.fillText("Game Over!", game.width / 2, game.height / 2 - 40);
    ctx.font = "16px Arial";
    ctx.fillText("You scored " + game.score + " and got to level " + game.level, game.width / 2, game.height / 2);
    ctx.font = "16px Arial";
    ctx.fillText("Press 'Space' to play again.", game.width / 2, game.height / 2 + 40);
  },

  keyDown: function (game, keyCode, e) {
    if (keyCode === 32) /*space*/ {
      //  Space restarts the game.
      game.reset();
      game.engine.moveTo(new LevelIntroState(game.level));

      e.preventDefault();
    }
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//// Play State
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

//  Create a PlayState with the game config and the level you are on.
function PlayState(config, level) {
  this.config = config;
  this.level = level;
}

PlayState.prototype = {
  enter: function (game) {
    //  Create the ship.
    this.ship = new Ship(game.width / 2, game.gameBounds.bottom, game.config.ship.width, game.config.ship.height, game.config.ship.speed);
    this.invaders = CreateInvaders(game, this.level)
    this.rockets = CreateRockets(game);
    this.bombs = CreateBombs(game, this.config.bombs);
    this.ufo = new Ufo(game);

    game.engine.pressedKeys.length = 0;
  },

  update: function (game, dt) {

    //  If the left or right arrow keys are pressed, move
    //  the ship. Check this on ticks rather than via a keydown
    //  event for smooth movement, otherwise the ship would move
    //  more like a text editor caret.
    if (game.engine.pressedKeys[37]) {
      this.ship.x -= this.ship.speed * dt;
    }

    if (game.engine.pressedKeys[39]) {
      this.ship.x += this.ship.speed * dt;
    }

    //  Keep the ship in bounds.
    this.ship.x = Math.min(Math.max(this.ship.x, game.gameBounds.left), game.gameBounds.right);

    if (game.engine.pressedKeys[32]) {
      this.rockets.fire(game, this.ship);
    }

    var i;

    this.bombs.update(dt);
    this.rockets.update(dt);
    this.invaders.update(game, this.ship, dt);

    //  Check for rocket/invader collisions.
    this.rockets.collides(this.invaders, this.bombs, this.config);

    this.invaders.dropBombs(this.bombs, this.config.invaders, dt);

    this.bombs.collides(game, this.ship);
  
    //  Check for failure
    if (game.lives <= 0) {
      game.sounds.play("explosion");
      game.engine.moveTo(new GameOverState());
    } else {
      //  Check for victory
      if (this.invaders.length === 0) {
        game.score += this.level * 50;
        game.level += 1;
        game.engine.moveTo(new LevelIntroState(game.level));
      }
    }
  
    // update any ufos
    this.ufo.update(this.rockets, dt);
  },

  draw: function (ctx, dt, game) {

    //  Clear the background.
    ctx.clearRect(0, 0, game.width, game.height);

    this.ship.draw(ctx);
    this.invaders.draw(ctx);
    this.bombs.draw(ctx);
    this.rockets.draw(ctx);
    this.ufo.draw(ctx, dt);

    //  Draw info.
    var textYpos = game.gameBounds.bottom + ((game.height - game.gameBounds.bottom) / 2) + 14 / 2;
    ctx.font = "14px Arial";
    ctx.fillStyle = "#ffffff";
    var info = "Lives: " + game.lives;
    ctx.textAlign = "left";
    ctx.fillText(info, game.gameBounds.left, textYpos);
    info = "Score: " + game.score + ", Level: " + game.level;
    ctx.textAlign = "right";
    ctx.fillText(info, game.gameBounds.right, textYpos);

    //  If we're in debug mode, draw bounds.
    if (this.config.debugMode) {
      ctx.strokeStyle = "#ff0000";
      ctx.strokeRect(0, 0, game.width, game.height);
      ctx.strokeRect(game.gameBounds.left, game.gameBounds.top,
        game.gameBounds.right - game.gameBounds.left,
        game.gameBounds.bottom - game.gameBounds.top);

      var cells = [
        ["Ship X,Y", Math.ceil(this.ship.x) + ", " + Math.ceil(this.ship.y)],
        ["# Invaders", this.invaders.length],
        ["# bombs", this.bombs.length],
        ["# rockets", this.rockets.length],
        ["ufo", Math.ceil(this.ufo.x) + ", " + Math.ceil(this.ufo.y)],
      ];

      ctx.font = "10px Arial";
      ctx.textAlign = "left";

      var pos = { x: 0, y: 10 };
      for (var i = 0; i < cells.length; i++) {
        var line = cells[i];
        ctx.fillText(line[0], pos.x, pos.y);
        ctx.fillText(line[1], pos.x + 50, pos.y);
        pos.y += 12;
      }
    }
  },

  keyDown: function (game, keyCode, e) {

    //  Supress further processing of left/right/space (37/29/32)
    if (keyCode === 37 || keyCode === 39 || keyCode === 32) {
      e.preventDefault();
    }

    // 'p'
    if (keyCode === 80) {
      //  Push the pause state.
      game.pushState(new PauseState());
    }
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//// Pause State
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
function PauseState() {
};

PauseState.prototype = {
  keyDown: function (game, keyCode, e) {
    if (keyCode === 80) {
      //  Pop the pause state.
      game.popState();
    }
  },

  draw: function (ctx, dt, game) {
    //  Clear the background.
    ctx.clearRect(0, 0, game.width, game.height);

    ctx.font = "14px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText("Paused", game.width / 2, game.height / 2);
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//// Level intro State
//// The Level Intro state shows a 'Level X' message and a countdown for the level.
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
function LevelIntroState(level) {
  this.level = level;
};

LevelIntroState.prototype = {
  update: function (game, dt) {
    //  Update the countdown.
    if (this.countdown === undefined) {
      this.countdown = game.config.debugMode ? 0 : 3; // countdown from 3 secs
    }
    this.countdown -= dt;

    if (this.countdown <= 0) {
      //  Move to the next level, popping this state.
      game.engine.moveTo(new PlayState(game.config, this.level));
    }
  },

  draw: function (ctx, dt, game) {
    //  Clear the background.
    ctx.clearRect(0, 0, game.width, game.height);

    ctx.font = "36px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText("Level " + this.level, game.width / 2, game.height / 2);
    ctx.font = "24px Arial";
    ctx.fillText("Ready in " + Math.ceil(this.countdown), game.width / 2, game.height / 2 + 36);
  }
}

function collides(rect1, rect2) {
  return ((rect1.x + rect1.width / 2) > (rect2.x - rect2.width / 2) &&
    (rect1.x - rect1.width / 2) < (rect2.x + rect2.width / 2) &&
    (rect1.y + rect1.height / 2) > (rect2.y - rect2.height / 2) &&
    (rect1.y - rect1.height / 2) < (rect2.y + rect2.height / 2));
}