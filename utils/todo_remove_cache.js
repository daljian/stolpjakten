
//javascript singleton module pattern
var cache = (function() {

  //private interface
  //Declare your private members and functions here
  function assertKeyDefined(key){
      if (typeof key === "undefined") {
        this.set(this.KEY_LAST_KNOWN_ERROR, utils.getCacheKeyNullException());
        throw utils.getCacheKeyNullException(); 
      }
  }

  return { // public interface

    // Constants
    KEY_USERNAME:"un",
    KEY_PASSWORD:"pwd",
    KEY_AUTOLOGIN:"autologin",
    KEY_IS_LOGGED_IN:"loggedin",
    KEY_LAST_KNOWN_ERROR:"error",
    KEY_TAKEN_STICKS_JSON:"taken_sticks_json",
    KEY_NOT_TAKEN_STICKS_JSON:"not_taken_sticks_json",
    KEY_TOTAL_STICKS_JSON:"not_taken_sticks_json",
    KEY_NOT_PENDING_STICKS_JSON:"pending_sticks_json",

    set: function(key, value){
      window.localStorage.setItem(key, value);
      //console.log("Saved: " + this.get(key));
    },
    setJSONData: function(key, value){
      this.set(key, JSON.stringify(value));
    },
    getJSONData: function(key){
      return JSON.parse(this.get(key));
    },
    // Set value for key if value is not undefined.
    setIfDefined: function(key, value){
      assertKeyDefined(key);
      if (typeof value != "undefined") {
        this.set(key, value);
      }
    },
    /**
      * @returns preset if value for key is undefined or empty string
      */     
    getPreset: function(key, preset){
      var returnValue = this.get(key);
      //console.log("prest1: " + returnValue);
      if (typeof returnValue == "undefined") {
        returnValue = preset;
      }
      //console.log("prest2: " + returnValue);
      return returnValue;
    },
    get: function(key){
      assertKeyDefined(key);
      return window.localStorage.getItem(key);
    },
    clearAll: function(){
      return window.localStorage.clear();
    }

  };
})();
