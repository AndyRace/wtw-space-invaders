//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//// UFO
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
function Ufo(game) {
  this.config = game.config.ufo;
  this.game = game;
  this.img = this.config.img;
  this.width = this.config.width;
  this.height = (this.width / this.img.width) * this.img.height;
  this.incarnations = 0;

  this.initialise = function () {
    this.visible = false;
    this.countdown = this.config.delay + Math.random() * this.config.delay;

    delete this.x;
    delete this.y;
    delete this.velocity;
  }

  this.appear = function () {
    this.game.sounds.play("ufo");

    this.incarnations++;

    this.x = -this.width / 2;
    this.y = this.game.gameBounds.top - this.height;

    var speedFactor = Math.min(this.config.maxSpeedFactor, this.incarnations * this.game.level);
    this.velocity = { x: 100 * speedFactor, y: 0 };
    
    this.visible = true;
  }

  this.draw = function (ctx, dt) {
    if (this.visible) {
      ctx.drawImage(this.img,
        this.x - this.width / 2,
        this.y - this.height / 2,
        this.width,
        this.height);
    }
  }

  this.update = function (rockets, dt) {
    if (!this.visible) {
      this.countdown -= dt;

      if (this.countdown > 0) {
        return;
      }

      this.appear();
    }

    this.x += this.velocity.x * dt;
    this.y += this.velocity.y * dt;

    for (var j = 0; j < rockets.length; j++) {
      var rocket = rockets[j];

      if (collides(rocket, this)) {
        //  Remove the rocket.
        rockets.splice(j--, 1);
        this.game.sounds.play("ufo-killed");
        this.game.score += this.config.points;

        this.initialise();
        return;
      }
    }

    if (this.x > this.game.width) { // this.game.gameBounds.right) {
      this.initialise();
    }
  }

  this.initialise();
}