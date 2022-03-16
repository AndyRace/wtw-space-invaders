//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//// Invader 
//// Invader's have position, type, rank/file and that's about it. 
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Invader(x, y, rank, file, type, img, width, height) {
  this.x = x - width / 2;
  this.y = y + height / 2;
  this.rank = rank;
  this.file = file;
  this.type = type;

  this.width = width;
  this.height = height;
  this.img = img;

  this.draw = function (ctx) {
    // Bluring makes the game v slow
    // ctx.shadowBlur = 10;
    // ctx.shadowColor = "black";

    ctx.drawImage(img, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);

    // ctx.shadowBlur = 0;
  }
}

function CreateInvaders(game, level) {
  var instance = [];

  instance.initialise = function(game, level) {
    //  Setup initial state.
    this.sounds = game.sounds;
    this.currentDropDistance = 0;
    this.areDropping = false;
    
    //  Set the speed for this level
    var levelMultiplier = level * game.config.levelDifficultyMultiplier;
    this.currentVelocity = game.config.invaders.initialVelocity + (levelMultiplier * game.config.invaders.initialVelocity);
    this.velocity = { x: -this.currentVelocity, y: 0 };
    this.nextVelocity = null;
    this.soundGapMs = 750;
    
    //  Create the invaders.
    var ranks = game.config.invaders.ranks;
    var files = game.config.invaders.files;

    var gapX = 4;
    var gapY = 5;
    var y = game.gameBounds.top;

    for (var rank = 0; rank < ranks; rank++) {
      var img = game.invaderImgs[Math.floor(Math.random() * game.invaderImgs.length)];

      img.height = img.height * (game.config.invaders.width / img.width);
      img.width = game.config.invaders.width;

      var startX = (game.width / 2) - ((files / 2) * (img.width + gapX) - gapX);
      for (var file = 0; file < files; file++) {
        this.push(new Invader(
          startX + (file * (img.width + gapX)),
          y,
          rank, file, "Invader",
          img, img.width, img.height));
      }

      y += img.height + gapY;
    }
  }
  
  instance.dropBombs = function (bombs, config, dt) {
    //  Find all of the front rank invaders.
    var frontRankInvaders = {};
    var invader;
    for (var i = 0; i < this.length; i++) {
      invader = this[i];
      //  If we have no invader for this file, or the invader
      //  for this file is further behind, set the front
      //  rank invader to this one.
      if (!frontRankInvaders[invader.file] || frontRankInvaders[invader.file].rank < invader.rank) {
        frontRankInvaders[invader.file] = invader;
      }
    }

    //  Give each front rank invader a chance to drop a bomb.
    for (i = 0; i < config.files; i++) {
      invader = frontRankInvaders[i];
      if (!invader) continue;
      var chance = bombs.rate * dt;
      if (chance > Math.random()) {
        //  Fire!
        bombs.push(new Bomb(invader.x, invader.y + invader.height / 2,
          bombs.minVelocity + Math.random() * (bombs.maxVelocity - bombs.minVelocity)));
      }
    }
  };

  instance.update = function (game, ship, dt) {
    //  Move the invaders.
    var hitLeft = false, hitRight = false, hitBottom = false;
    var invader;
    for (var i = 0; i < this.length; i++) {
      invader = this[i];

      var newx = invader.x + this.velocity.x * dt;
      var newy = invader.y + this.velocity.y * dt;

      if (hitLeft === false && newx < game.gameBounds.left) {
        hitLeft = true;
      }

      if (hitRight === false && newx > game.gameBounds.right) {
        hitRight = true;
      }

      // invaders win if they can't be shot
      if (hitBottom === false && (newy + invader.height / 2) >= (game.gameBounds.bottom - ship.height / 2)) {
        hitBottom = true;
      }
      
      ////  Check for invader/ship collisions.
      //if (collides(invader, this.ship)) {
      //  //  Dead by collision!
      //  game.lives = 0;
      //}

      if (!hitLeft && !hitRight && !hitBottom) {
        invader.x = newx;
        invader.y = newy;
      }
    }

    //  Update invader velocities.
    if (this.areDropping) {
      this.currentDropDistance += this.velocity.y * dt;
      if (this.currentDropDistance >= game.config.invaders.dropDistance) {
        this.areDropping = false;
        this.velocity = this.nextVelocity;
        this.currentDropDistance = 0;
        
        this.soundGapMs *= 0.8;
      }
    }
        
    if (hitLeft || hitRight)   {
      this.currentVelocity += game.config.invaders.acceleration * (1+(game.level-1)/5);
      this.velocity = { x: 0, y: this.currentVelocity };
      this.areDropping = true;
      //  If we've hit the left, move down then right.
      //  If we've hit the right, move down then left.
      this.nextVelocity =
        { x: hitLeft ? this.currentVelocity : -this.currentVelocity,
          y: 0 };
    }

    //  If we've hit the bottom, it's game over.
    if (hitBottom) {
      game.lives = 0;
    }
    
    if (!this.soundEnded
        || (this.soundEnded + this.soundGapMs < (new Date()).valueOf()))   {
      self = this;
      this.sounds.sounds["invader1"].onended = function() {
        self.soundEnded = (new Date()).valueOf();     
      }
      
      this.sounds.play("invader1");
    }

  };
  
  instance.draw = function(ctx){
    //  Draw invaders.
    ctx.fillStyle = "#006600";
    for (var i = 0; i < this.length; i++) {
      this[i].draw(ctx);
    }
  };

  instance.initialise(game, level);
  
  return instance;
}