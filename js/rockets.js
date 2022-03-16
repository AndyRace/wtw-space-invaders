//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//// Rocket
//// Fired by the ship, they've got a position, velocity and state.
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
function Rocket(x, y, velocity) {
  this.x = x;
  this.y = y;
  this.width = 3;
  this.height = 16;
  this.velocity = velocity;

  this.draw = function (ctx) {
    ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//// Rockets
//// An array of Rockets and functionality
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
function CreateRockets(game) {
  var instance = [];

  instance.game = game;

  instance.draw = function (ctx) {
    ctx.fillStyle = "#ff0000";
    for (var i = 0; i < this.length; i++) {
      this[i].draw(ctx);
    }
  };

  instance.update = function (dt) {
    var rocket;
    for (var i = 0; i < this.length; i++) {
      rocket = this[i];
      rocket.y -= dt * rocket.velocity;

      //  If the rocket has gone off the screen remove it.
      if (rocket.y < 0) {
        this.splice(i--, 1);
      }
    }
  };

  instance.collides = function (invaders, bombs, config) {
    for (var j = 0; j < this.length; j++) {
      var bang = false;
      var rocket = this[j];

      for (var i = 0; i < invaders.length; i++) {
        var invader = invaders[i];
        if (collides(rocket, invader)) {
          bang = true;
          invaders.splice(i--, 1);
          this.game.sounds.play("invader-killed");
          this.game.score += config.invaders.points;
          // invaders don't overlap so break
          break;
        }
      }

      for (var i = 0; i < bombs.length; i++) {
        var bomb = bombs[i];
        if (collides(rocket, bomb)) {
          bang = true;
          bombs.splice(i--, 1);
          // this.game.sounds.play("bomb-killed");
          // this.game.score += config.bombs.points;
          // keep checking just in case there are overlapping bombs
          // break;
        }
      }

      if (bang) {
        // Remove the rocket.
        this.splice(j--, 1);
      }
    }
  };

  instance.fire = function (game, ship) {
    //  If we have no last rocket time, or the last rocket time 
    //  is older than the max rocket rate, we can fire.
    if (this.length < game.config.rockets.max
      && (!this.lastRocketTime
        || ((new Date()).valueOf() - this.lastRocketTime) > (1000 / game.config.rockets.maxFireRate))) {
      //  Add a rocket.
      this.push(new Rocket(ship.x, ship.y - 12, game.config.rockets.velocity));
      this.lastRocketTime = (new Date()).valueOf();

      //  Play the 'shoot' sound.
      game.sounds.play("shoot");
    }
  };

  return instance;
};