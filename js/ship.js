//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//// Ship
//// The ship has a position and size and that's about it.
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
function Ship(x, y, width, height, speed) {
  this.x = x;
  this.y = y;
  this.width = width; // 20;
  this.height = height;
  this.speed = speed;
  

  this.draw = function (ctx) {
    //  Draw ship.

    ctx.fillStyle = COLOURS.purple; // WTW Purple

    var gap = 1;
    var w = (this.width - 8 * gap) / 9;
    var blobH = 4 * this.height / 9;

    var originX = this.x - (this.width / 2);
    var originY = this.y - (this.height / 2);
    var i = 0;
    var drawBlob = function (i, offsetY, h) { ctx.fillRect(originX + (w + gap) * i, originY + offsetY, w, h); }

    // W
    drawBlob(i++, 0, this.height);
    drawBlob(i++, (this.height - blobH), blobH);
    drawBlob(i++, 0, this.height);

    // T
    drawBlob(i++, 0, blobH);
    drawBlob(i++, 0, this.height);
    drawBlob(i++, 0, blobH);

    // W
    drawBlob(i++, 0, this.height);
    drawBlob(i++, (this.height - blobH), blobH);
    drawBlob(i++, 0, this.height);
  };
}

