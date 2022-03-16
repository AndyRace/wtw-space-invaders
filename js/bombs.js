//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//// Bomb
//// Dropped by invaders, they've got position, velocity.
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
function Bomb(x, y, velocity) {
  this.x = x;
  this.y = y;
  this.width = 4;
  this.height = 4;
  this.velocity = velocity;

  this.draw = function (ctx) {
    ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
  }
}

function CreateBombs(game) {
  var instance = [];

  var levelMultiplier = game.level * game.config.levelDifficultyMultiplier;

  var cfg = game.config.bombs;
  instance.rate = cfg.rate + (levelMultiplier * cfg.rate);
  instance.minVelocity = cfg.minVelocity + (levelMultiplier * cfg.minVelocity);
  instance.maxVelocity = cfg.maxVelocity + (levelMultiplier * cfg.maxVelocity);

  //  Move each bomb.
  instance.update = function (dt) {
    for (var i = 0; i < this.length; i++) {
      var bomb = this[i];
      bomb.y += dt * bomb.velocity;

      //  If the rocket has gone off the screen remove it.
      if (bomb.y > this.height) {
        this.splice(i--, 1);
      }
    }
  }

  instance.collides = function (game, ship) {
    //  Check for bomb/ship collisions.
    for (var i = 0; i < this.length; i++) {
      var bomb = this[i];
      if (collides(bomb, ship)) {
        this.splice(i--, 1);
        game.lives--;
        game.sounds.play("explosion");
      }
    }
  }

  instance.draw = function (ctx) {
    //  Draw bombs.
    ctx.fillStyle = "#ff5555";
    for (i = 0; i < this.length; i++) {
      this[i].draw(ctx);
    }
  }

  return instance;
}

