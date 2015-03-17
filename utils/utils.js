

//javascript singleton module pattern
var utils = (function() {

  //private interface
  //Declare your private members and functions here

  // caller ID is statically assigned by .NET API provider
  var CALLER_ID = '7daa046f-0b15-4343-8715-b9bbd76a0231';
  
  // map ID, statically assigned or??
  var MAP_ID = '12';
  var SERVER_URL= "http://demo.friskanorden.com/RESTService/FriskaService.ashx?";
  var NET_OPERATION_GET_USER_DATA="GetUserData";

  var notTakenSticks;
  var takenSticks;
  var pendingSticks;

  function createURL(operation, xml){
    return SERVER_URL + operation + "=" + window.btoa(xml);
  }
  //Asserts we have some sticks to work with.
  function assertSticksAvailable(taken, notTaken){
    //If we don't have any sticks (taken or not taken) we will fail.
    if (typeof taken == "undefined" && typeof notTaken == "undefined") {
      throw NO_STICKS_EXCEPTION;
    }
  }

  
 


  return { // public interface

    assertDefined: function (value){
      if (typeof value == "undefined") {
        throw utils.getCacheKeyNullException(); 
      }
    },
    decodeHTML: function (value){
      return value.replace(/&apos;/g, "'")
               .replace(/&quot;/g, '"')
               .replace(/&gt;/g, '>')
               .replace(/&lt;/g, '<')
               .replace(/&amp;/g, '&');
    },
    encodeHTML: function (value){
      return value.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;')
               .replace(/"/g, '&quot;')
               .replace(/'/g, '&apos;');
    },
    complexAndUndefinedToEmptyString: function (what) {
        var retVal = "";
        if (typeof what != "undefined" && what.toString() != "[object Object]") {
            retVal = what;
        }
        return retVal;
    },
    getCredentialsXml: function(){
      
      return "<cre><cid>" + this.getCallerId() + "</cid><un>" + cache.get(cache.KEY_USERNAME) + "</un><pwd>" + cache.get(cache.KEY_PASSWORD) + "</pwd><mid>" + this.getMapId()+"</mid></cre>";
    },
    /**
     * Return the xml for adding one control 
     * 
     */
    getAddControlXml: function(id, code){
      return "<ctrls><ctrl><cid>"+id + "</cid><cc>"+code+"</cc></ctrl></ctrls>";
    },
    getNetOperationGetUserData: function() {
      return NET_OPERATION_GET_USER_DATA;
    },
    getCallerId: function() {
      return CALLER_ID;
    },
    updateUserData: function(xmlData){
      var json = $.xml2json(xmlData);
      //console.log(json);
      var notTaken = json.ntc.cc;
      var taken = json.tc.cc;
      assertSticksAvailable(taken, notTaken);
      cache.setJSONData(cache.KEY_TAKEN_STICKS_JSON, taken);
      cache.setJSONData(cache.KEY_NOT_TAKEN_STICKS_JSON, notTaken);
    },
    getMapId: function() {
      return MAP_ID;
    },
    getCacheKeyNullException: function(){
      //TODO, example, using get operation could replace message text to
      //allow multiple langues in errors.
      return CACHE_KEY_NULL_EXCEPTION;
    },
    sendToServer: function(operation, xml, redirectUrl) {

        var xmlHttp = null;
        var url = createURL(operation, xml);
        

        xmlHttp = new XMLHttpRequest();
        var parent = this;
             
        xmlHttp.onreadystatechange = function()
        {
            
            
            //console.log(xmlHttp);
            if (xmlHttp.readyState==4 && xmlHttp.status==200)
            {
                var msg = xmlHttp.responseText;
                //console.log("Raw Request:\n" + url +"\n\nXml Request:\n"+xml+"\n\nXml response:\n"+window.atob(msg));
                if (window.atob(msg).indexOf('Ogiltiga inloggningsuppgifter') == -1){
                  window.location = redirectUrl;
                }else{
                  alert("incorrect login");
                }
            }
        }
        //We use synchronous call
        xmlHttp.open( "GET", url, false );
        xmlHttp.send( null );
        return xmlHttp.responseText;
    },

// -- Sticks operations --
// Class to represent a row in the stick  grid
  Stick: function(number, id, description, code) {
      var self = this;
      self.number = number;
      self.id = id;
      self.description = description;
      self.code = code;
      //TODO hack until we have coordinates from server.
      self.latitude = 59.37 + Math.random()/20;
      self.longitude = 13.43 + Math.random()/7;

  },
  StickHash: function (obj)
  {
    this.length = 0;
    this.items = {};
    for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
            this.items[p] = obj[p];
            this.length++;
        }
    }

    this.setItem = function(key, value)
    {
        var previous = undefined;
        if (this.hasItem(key)) {
            previous = this.items[key];
        }
        else {
            this.length++;
        }
        this.items[key] = value;
        return previous;
    }

    this.getItem = function(key) {
        return this.hasItem(key) ? this.items[key] : undefined;
    }

    this.hasItem = function(key)
    {
        return this.items.hasOwnProperty(key);
    }
   
    this.removeItem = function(key)
    {
        if (this.hasItem(key)) {
            previous = this.items[key];
            this.length--;
            delete this.items[key];
            return previous;
        }
        else {
            return undefined;
        }
    }

    this.keys = function()
    {
        var keys = [];
        for (var k in this.items) {
            if (this.hasItem(k)) {
                keys.push(k);
            }
        }
        return keys;
    }

    this.values = function()
    {
        var values = [];
        for (var k in this.items) {
            if (this.hasItem(k)) {
                values.push(this.items[k]);
            }
        }
        return values;
    }

    this.each = function(fn) {
        for (var k in this.items) {
            if (this.hasItem(k)) {
                fn(k, this.items[k]);
            }
        }
    }

    this.clear = function()
    {
        this.items = {}
        this.length = 0;
    }
  },
  getTakenSticks: function(){
    if (typeof takenSticks == "undefined"){
      takenSticks = this.getSticks(cache.KEY_TAKEN_STICKS_JSON);
    }
    return takenSticks;
  },
  getNotTakenSticks: function(){
    if (typeof notTakenSticks == "undefined"){
      notTakenSticks = this.getSticks(cache.KEY_NOT_TAKEN_STICKS_JSON);
    }
    return notTakenSticks;
  },
  warning: function(msg){
//        navigator.notification.alert(msg, null, ":(", "OK");
    return noty({layout: 'center', type: 'warning', text: msg, closeWith: ["button", "click"]});
    //toastr.warning(msg);
  },
  error: function(msg){
//        navigator.notification.alert(msg, null, ";(", "OK");
    return noty({layout: 'center', type: 'error', text: msg, closeWith: ["button", "click"]});
  },
  success: function(msg){
//        navigator.notification.confirm(msg, null, ":)", "OK");
    return noty({layout: 'center', type: 'notification', text: msg});
    //toastr.success(msg);
  },
  serverSpinner: function(msg, show){
    return noty({killer: 'true', layout: 'center', type: 'warning', text: msg, callback:{onShow:show}});
  },

  logDebug: function(msg){
    console.log(msg);
  },


  getPendingSticks: function(){
        var pendingSticks;
        try{
            pendingSticks = JSON.parse(localStorage.getItem(getPendingSticksKey()));
            //console.log('We got: ' + pendingSticks);
        }catch(err){
          console.log("Error is: " + err);
        }
        if (pendingSticks == null){
          pendingSticks=[];
        }
        if( Object.prototype.toString.call( pendingSticks ) != '[object Array]' ) {
          var tmp=new Array();
          tmp.push(pendingSticks);
          pendingSticks = tmp;
        }
        //console.log('We got: ' + pendingSticks);
        return pendingSticks;

  },
// -- QR scan operations --
  QRData: function(id, code){
    this.id = id;
    this.code = code;
  },
  decodeQRText: function(qrText){
    //Remove all non-digits, leaving only digits left
    var id = qrText.replace(/\D/g, "");
    //Remove all digits, leaving "the rest"
    var code = qrText.replace(/[0-9]/g, "");
    //console.log("complete: " + qrText + "id: " + id + " code: " + code);
    return new this.QRData(id, code);
  },

  updateStorageAfterRegistration: function(attemptedRegistration){
      
      
      if (attemptedRegistration.success === false){
        var pendingSticks = this.getPendingSticks();
        pendingSticks.push(attemptedRegistration);
        localStorage.setItem(getPendingSticksKey(), JSON.stringify(pendingSticks));
        //OFFLINE scenario
        //TODO, add to a list of pending registrations and let online checker trigger
        // re-posting of these when back online.
      }else{
        //ONLINE, success scenario

        //First update user data structure
        var user = JSON.parse(localStorage.getItem(getUserKey()));
        var takenSticks;
        try{
            takenSticks = JSON.parse(localStorage.getItem(getUserKey())).tc.cc;
        }catch(err){
          console.log("Error is: " + err);
          takenSticks=[];
        }
        if( Object.prototype.toString.call( takenSticks ) != '[object Array]' ) {
          var tmp=new Array();
          tmp[0]=takenSticks;
          takenSticks = tmp;
        }
        takenSticks.push(attemptedRegistration);
        user.tc.cc = takenSticks;
        
        localStorage.setItem(getUserKey(), JSON.stringify(user));
        //Next update the sticks structure
        var sticks = JSON.parse(localStorage.getItem(getSticksKey()));
        for (var i = 0; i < sticks.length; i++){
          if(sticks[i].id == attemptedRegistration.id){
            sticks[i].taken = true;
            break;
          }
          
        }
        localStorage.setItem(getSticksKey(), JSON.stringify(sticks));
      }


  },


  scan: function(callback){
    if ( typeof cordova == "undefined" || typeof cordova.require == "undefined" ) {
      return;
    }
    var scanner = cordova.require("com.phonegap.plugins.barcodescanner.BarcodeScanner");
    var self=this;
    self.callback = callback;

    scanner.scan( function (result) { 

        if (result.cancelled){
          // Scanning was cancelled, do nothing.
        }else{
          var data = self.decodeQRText(result.text);
          var sticks = JSON.parse(localStorage.getItem(getSticksKey()));
          var foundScannedStick = false;
          for (var i = 0; i < sticks.length; i++){
            if (sticks[i].number == data.id){
                foundScannedStick = true;
                var attempedRegistration = new ControlRegistration(sticks[i].id, data.code);
                var key = getLastAttemptedRegistrationKey();
                var result = net.addControl(getNetCredentials(), attempedRegistration);

                if (!result.success){
                    if (result.alreadyTaken == true){
                      self.warning(I18n.t('views.map.marker.registerduplicate'));
                    }else{
                      if (net.isOnline() == false){
                        attempedRegistration.success = false;
                        localStorage.setItem(key, JSON.stringify(attempedRegistration));
                        self.updateStorageAfterRegistration(attempedRegistration);
                        self.warning(I18n.t('views.map.marker.registerfailoffline'));
                      }else{
                        self.error(I18n.t('views.map.marker.registerfail'));
                      }
                    }
                }else{
                    sticks[i].taken = true;
                    localStorage.setItem(getSelectedMarkerKey(), JSON.stringify(sticks[i]));
                    localStorage.setItem(getSticksKey(), JSON.stringify(sticks));
                    attempedRegistration.success = true;
                    localStorage.setItem(key, JSON.stringify(attempedRegistration));
                    self.updateStorageAfterRegistration(attempedRegistration);
                    window.location.href='#maps/' + getCurrentMapId +'/' + sticks[i].number;
                    self.success(I18n.t('views.map.marker.registersuccess'));
                    break;
                }
            }
          }
          if (foundScannedStick == false){
            self.error(I18n.t('views.map.marker.registerfail'));
          }
          if (self.callback != null){
            self.callback.render();
          }
        }
        

    }, function (error) { 
        //console.log("Scanning failed: ", error); 
    } );
  }



  };
})();
