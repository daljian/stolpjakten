var ADMIN_MAIL = "app@friskakarlstad.se";

var CACHE_KEY_NULL_EXCEPTION = 
{ 
  name:        "Cache key null", 
  level:       "Show Stopper", 
  message:     "Error detected. Please contact the system administrator.", 
  htmlMessage: "Error detected. Please contact the <a href=\"mailto:"+ADMIN_MAIL+"\">system administrator</a>.",
  toString:    function(){return this.name + ": " + this.message}
}
var NO_STICKS_EXCEPTION = 
{ 
  name:        "Got no sticks from server", 
  level:       "Show Stopper", 
  message:     "Error detected. Please contact the system administrator.", 
  htmlMessage: "Error detected. Please contact the <a href=\"mailto:"+ADMIN_MAIL+"\">system administrator</a>.",
  toString:    function(){return this.name + ": " + this.message}
}
