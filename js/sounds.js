//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//// Sounds
//// The sounds class is used to asynchronously load sounds and allow them to be played.
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
function Sounds() {

  //  The audio context.
  this.audioContext = null;

  //  The actual set of loaded sounds.
  this.sounds = [];
  
  this._muted = false;
}

Sounds.prototype = {
  init: function () {

    //  Create the audio context, paying attention to webkit browsers.
    // context = window.AudioContext || window.webkitAudioContext;
    // this.audioContext = new context();

    try {
      // Fix up for prefixing
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
    } catch (e) {
      // Web Audio API is not supported in this browser
    }

    this.mute = false;
  },

  loadSound: function (name, audio) {
    //  Create an entry in the sounds object.
    this.sounds[name] = audio;
    audio.load();
  },

  play: function (name) {
    //  If we've not got the sound, don't bother playing it.
    if (this.sounds[name] === undefined || this.sounds[name] === null || this.muted) {
      return;
    }

    this.sounds[name].play();
  },

  //  Mutes or unmutes the game.
  get muted() {
    return this._muted ? true : false;
  },

  set muted(value) {
    //  If we've been told to mute, mute.
    this._muted = value ? true : false;
  }
}