function Engine(game) {
  this.stack = [];
  this.pressedKeys = [];
  this.game = game;
  
  var self = this;

  //  Listen for keyboard events.
  window.addEventListener("keydown", function (e) {
    var keyCode = e.which || window.event.keycode;
    self.keyDown(keyCode, e);
  });

  window.addEventListener("keyup", function (e) {
    var keyCode = e.which || window.event.keycode;
    self.keyUp(keyCode);
  });
}

Engine.prototype = {

  moveTo: function (state) {
    //  If there's an enter function for the new state, call it.
    if (state.enter) {
      state.enter(this.game);
    }

    this.stack.pop();

    //  Set the current state.
    this.stack.push(state);
  },

  //  Returns the current state.
  current: function () {
    return this.stack.length > 0 ? this.stack[this.stack.length - 1] : null;
  },

  tick: function (fps, canvas) {
    var currentState = this.current();
    if (currentState) {
      //  Delta t is the time to update/draw.
      var dt = 1 / fps;

      //  Update if we have an update function. Also draw
      //  if we have a draw function.
      if (currentState.update) {
        currentState.update(this.game, dt);
      }

      if (currentState.draw) {
        //  Get the drawing context.
        var ctx = canvas.getContext("2d");

        currentState.draw(ctx, dt, this.game);
      }
    }
  },

  pushState: function (state) {
    //  If there's an enter function for the new state, call it.
    if (state.enter) {
      state.enter(this);
    }

    //  Set the current state.
    this.stack.push(state);
  },

  popState: function () {
    //  pop the state if there's a current one.
    if (this.currentState()) {
      //  Set the current state.
      this.stack.pop();
    }
  },

  keyDown: function (keyCode, e) {
    this.pressedKeys[keyCode] = true;
    
    //  Delegate to the current state
    var currentState = this.current();
    if (currentState && currentState.keyDown) {
      currentState.keyDown(this.game, keyCode, e);
    }
  },

  keyUp: function (keyCode) {
    delete this.pressedKeys[keyCode];
    
    //  Delegate to the current state.
    var currentState = this.current();
    if (currentState && currentState.keyUp) {
      currentState.keyUp(this.game, keyCode);
    }
  }
}