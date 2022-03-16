// Background lets you take a div and turn it into an animated background.

// define a colour palette
var COLOURS = {
  black: "#000000",
  gold: "#ffb81c",
  green: "#00c389",
  magenta: "#c110a0",
  blue: "#00a0d2",
  gray: "#63666a",
  lightViolet: "#d8d7df",
  lightGray: "#d8dbd8",
  purple: "#702082",
  background: "#999999",
  block: "#B2B2B2"
};

// Define the Background class.
function Background(div) {
  this.fps = 30;
  this.width = 0;
  this.height = 0;
  this.minVelocity = 15;
  this.maxVelocity = 30;
  this.numBlocks = 10;
  this.intervalId = 0;
  // initial gap between blocks
  this.gap = { x: 20, y: 20 };

  var self = this;

  //	Store the div.
  this.containerDiv = div;
  this.width = window.innerWidth;
  this.height = window.innerHeight;

  window.onresize = function (/*event*/) {
    self.width = window.innerWidth;
    self.height = window.innerHeight;
    self.canvas.width = self.width;
    self.canvas.height = self.height;
    self.draw();
  }

  //	Create the canvas.
  this.canvas = document.createElement("canvas");
  div.appendChild(this.canvas);
  this.canvas.width = this.width;
  this.canvas.height = this.height;
}

Background.prototype.newBlock = function () {
  // new 'Blocks' are born within the background
  var
    // the blocks are based on a 20 width grid
    gridX = 20,
    scaleX = this.width / gridX,
    scaleY = scaleX * 1.5,
    gridY = Math.floor(this.height / scaleY);
  return new Block(
    Math.floor(Math.random() * gridX) * scaleX,
    Math.floor(Math.random() * gridY) * scaleY,
    Math.floor(Math.random() * 7 + 1) * scaleX,
    Math.floor(Math.random() * 7 + 1) * scaleY,
    (Math.random() * (this.maxVelocity - this.minVelocity)) + this.minVelocity);
}

Background.prototype.rebornBlock = function () {
  // 'reborn' 'Blocks' appear from the top of the screen
  var block = this.newBlock();
  block.y = -block.height;
  return block;
}

function acceptDisjointBlock(createBlock, blocks, gap) {
  return accept(
    function () { return createBlock() },
    5,
    function (block) { return !BlocksOverlap(blocks, block, gap) });
}

Background.prototype.start = function () {
  var self = this;

  //	Create the Blocks.
  this.Blocks = [];
  for (var i = 0; i < this.numBlocks; i++) {
    var newBlock = acceptDisjointBlock(function () { return self.newBlock() }, this.Blocks, this.gap);
    this.Blocks[i] = newBlock;
  }

  //	Start the timer.
  this.intervalId = setInterval(function () {
    self.update();
    self.draw();
  }, 1000 / this.fps);
};

Background.prototype.stop = function () {
  clearInterval(this.intervalId);
};

function accept(fn, retries, acceptFn) {
  for (var i = 0; i < retries; i++) {
    var obj = fn();
    if (acceptFn(obj)) {
      return obj;
    }
  }

  return null;
}

Background.prototype.update = function () {
  var dt = 1 / this.fps;

  var self = this;

  for (var i = 0; i < this.Blocks.length; i++) {
    var block = this.Blocks[i];
    if (block !== null) {
      // ReSharper disable once QualifiedExpressionMaybeNull
      block.y += dt * block.velocity;
    }

    //	If the block has moved from the bottom of the screen, spawn it at the top.
    if ((block === null) || (block.y > this.height)) {
      // use this trick to ensure that the anonymous fn used here has the correct 'this'
      this.Blocks[i] = acceptDisjointBlock(function () { return self.rebornBlock() }, this.Blocks, this.gap);
    }
  }
};

// The background consists descending blocks
Background.prototype.draw = function () {
  // Get the drawing context.
  var ctx = this.canvas.getContext("2d");

  // Draw the background.
  ctx.fillStyle = COLOURS.background;
  ctx.fillRect(0, 0, this.width, this.height);

  // Draw background objects
  ctx.fillStyle = COLOURS.block;
  ctx.strokeStyle = COLOURS.background;
  ctx.lineWidth = "1";
  for (var i = 0; i < this.Blocks.length; i++) {
    if (this.Blocks[i] !== null) {
      this.Blocks[i].draw(ctx);
    }
  }
};

function BlocksOverlap(blocks, block, gap) {
  for (var i = 0; i < blocks.length; i++) {
    var existingBlock = blocks[i];
    if ((existingBlock !== null) && block.intersects(existingBlock, gap)) {
      return true;
    }
  }

  return false;
}

function Block(x, y, width, height, velocity) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.velocity = velocity;

  this.draw = function (ctx) {
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.stroke();
  }

  this.right = function () { return this.x + this.width - 1; };
  this.bottom = function () { return this.y + this.height - 1; };

  this.intersects = function (otherBlock, gap) {
    return !(otherBlock.x - gap.x > this.right() + gap.x ||
      otherBlock.right() + gap.x < this.x - gap.x ||
      otherBlock.y - gap.y > this.bottom() + gap.y ||
      otherBlock.bottom() + gap.y < this.y - gap.y);
  }
}
