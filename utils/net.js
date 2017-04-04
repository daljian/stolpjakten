
/**
 * Data container that holds a result offset index.
 *  This container needs to be added to NetCredentials like so:
 * netCredentials.res = new ResultIndex(0, 10);
 * before invoking getResults to get the ten first results.
 * 
 * @param startIndex Start index from where to get results
 * @param numberOfRecords number of results to retrieve
 */
function ResultIndex(startIndex, numberOfRecords) {
  var self = this;
  self.si = startIndex;
  self.nr = numberOfRecords;
}

/**
 * Data container that holds a result from a .NET operation.
 * 
 * @param success is a boolean that indicates if operation was successful or not
 * @param result is the result from the .NET operation
 */
function NetResult(success, result) {
  var self = this;
  self.success = success;
  self.result = result;
}

/**
* Data container that holds credentials used in .NET operations
* 
* @param em unique id for a user of the service
* @param pwd to authenticate user
* @param mid the identifier of a certain event/arrangement, usually bound by a geographical area (hence it's name: map id).
* @param res (optional) is of type ResultIndex, @see ResultIndex
* 
*/
function NetCredentials(un, pwd, mid, res){
  var self = this;
  //self.cid = "7daa046f-0b15-4343-8715-b9bbd76a0231";
  self.cid = "38c2b433-54bf-485e-908d-bc8fc87903af";
  self.un = un;
  self.pwd = pwd;
  self.mid = mid;
  self.res = res;

  self.fromCredentials = function(creds){
    return new NetCredentials(creds.un, creds.pw, creds.mid, creds.res);
  }
  
  self.toXML = function(){
    var resultIndex = "";
    if (typeof self.res != "undefined"){
      resultIndex = "<res><si>"+self.res.si+"</si><nr>"+self.res.nr+"</nr></res>";
    }
    return "<cre><cid>" + self.cid + "</cid><un>" + self.un + "</un><pwd>" + self.pwd + "</pwd><mid>" + self.mid+"</mid>"+resultIndex+"</cre>";
  }
}
function toISO(what){
  return decodeURIComponent(escape(what));
}
function toUTF(what){
  return unescape(encodeURIComponent(what));
}
/**
 * @param em email 
 * @param fn forname
 * @param ln lastname 
 * @param dn display name
 * @param sa street address
 * @param zip ZIP code
 * @param ci City
 * @param ph phone number 
 * @param ge gender (0 - femal, 1 - male)
 * @param pw password
 * @param sil Show user in result list (0 - no, 1 - yes)
 * @param nl subscribe to newsletter (0 - no, 1 - yes)
 * @param ag birth year (YYYY)
 * @param pc premium code
 * @param emmcs Array of extra map codes
 */
function UserData(em,fn,ln,dn,sa,zip,ci,ph,ge,pw,sil,nl,ag,pc, emmcs){
  var self = this;
  
  self.em = em;
  self.un = dn;
  self.fn = fn;
  self.ln = ln;
  self.dn = dn;
  self.sa = sa;
  self.zip = zip;
  self.ci = ci;
  self.ph = ph;
  self.ge = ge;
  self.pw = pw;
  self.sil = sil;
  self.nl = nl;
  self.ag = ag;
  self.pc = pc;
  self.emmcs = emmcs;

  self.fromXML = function(xml){
    //utils.logDebug("xml: " + xml);
    var t = $.xml2json(xml);
    return fromUserData(t);
  }
  self.fromUserData = function(t){
    utils.logDebug("t.ud.pc: " + t.ud.pc);
    var newObject = new UserData( t.ud.em, 
                                  t.ud.fn, 
                                  t.ud.ln,
                                  t.ud.dn,
                                  t.ud.sa,
                                  t.ud.zip,
                                  t.ud.ci,
                                  t.ud.ph,
                                  t.ud.ge,
                                  t.ud.pw,
                                  t.ud.sil,
                                  t.ud.nl,
                                  t.ud.ag,
                                  utils.complexAndUndefinedToEmptyString(t.ud.pc), 
                                  t.ud.emmcs );
    return newObject;
  }
  
  self.toXML = function(){
        var extraMapCodes = "<emmcs>";
        for (var emmc in emmcs) {
          extraMapCodes += "<emmc>" + emmc + "</emmc>";
        }
        extraMapCodes += "</emmcs>";
        return  "<ud>"+
                "<em>"+self.em + "</em>"+
                "<un>"+self.un + "</un>"+
                "<fn>" + self.fn + "</fn>"+
                "<ln>" + self.ln + "</ln>"+
                "<dn>" + self.dn+"</dn>"+
                "<sa>" + self.sa+"</sa>"+
                "<zip>" + self.zip+"</zip>"+
                "<ci>" + self.ci+"</ci>"+
                "<ph>" + self.ph+"</ph>"+
                "<ge>" + self.ge+"</ge>"+
                "<pwd>" + self.pw+"</pwd>"+
                "<sil>" + self.sil+"</sil>"+
                "<nl>" + self.nl+"</nl>"+
                "<ag>" + self.ag+"</ag>"+
                "<pc>" + self.pc+"</pc>"+
                extraMapCodes+
                "</ud>";

  }
}
/**
 * Data container used when registering (one) control/stick.
 * @param id the interal identification of the control that we register
 * @param cc the code we want to try register
 */ 
function ControlRegistration(id, cc){
  var self = this;
  self.id = id;
  self.cc = cc;

  self.toXML = function(){
    return "<ctrls><ctrl><cid>"+self.id + "</cid><cc>"+self.cc+"</cc></ctrl></ctrls>";
  }
}

function CourseIdentifier(ci){
  var self = this;
  self.ci = ci;
  self.toXML = function(){
    return '<course><ci>'+self.ci+'</ci></course>';
  }
}
function CourseControlRegistration (courseId, controlId){
  var self = this;
  self.courseid = courseId;
  self.controlid = controlId;
  self.registrationdate = utils.formatDate(new Date());
  self.toXML = function(){
    return   '<course><courseid>'
      +self.courseid+'</courseid><controlid>'
      +self.controlid+'</controlid><registrationdate>'
      +self.registrationdate+'</registrationdate></course>';
  }
}
function CourseControlsRegistration (controls){
  var self = this;
  self.controls = controls;
  self.xmlHead = '<course><courseid>'+getCurrentCourse()+'</courseid><controls>';
  self.xmlTail = '</controls></course>';
  self.xmlBody = '';
  for (var i = 0; i < controls.length; i++) {
    self.xmlBody += '<control>' +
                    '<controlid>'+controls[i].mi+'</controlid>' +
                     '<registrationdate>'+controls[i].registrationdate+'</registrationdate>' +
                     '</control>';
  }
  self.toXML = function(){
    return self.xmlHead + self.xmlBody + self.xmlTail;
  }
}


//javascript module pattern
var net = (function() {

  //private interface
  //Declare your private members and functions here

  var API_TOKEN="%API%";
  //var SERVER_URL= "http://demo.stolpjakten.se/restservice/friskaservice.ashx?";
  //var SERVER_URL= "http://demo"+API_TOKEN+".stolpjakten.se/restservice/friskaservice.ashx?";
  // REAL ADDRESS var SERVER_URL= "http://app"+API_TOKEN+".stolpjakten.se/restservice/friskaservice.ashx?";
  var SERVER_URL= "http://test.stolpjakten.se/Service/OLService.ashx?";
  var NET_OPERATION_GET_USER="GetUser";
  var NET_OPERATION_GET_MAP="GetMap";
  var NET_OPERATION_CREATE_USER="CreateUser";
  var NET_OPERATION_UPDATE_USER="UpdateUser";
  var NET_OPERATION_GET_MAP_COURSES="GetMapCourses";
  var NET_OPERATION_GET_MAP_COURSE="GetMapCourse";
  var NET_OPERATION_GET_MAP_COURSE_RESULTS="GetMapCourseResults";
  var NET_OPERATION_ADD_COURSE_CONTROL="AddCourseControl";
  var NET_OPERATION_ADD_COURSE_CONTROLS="AddCourseControls";
  var NET_OPERATION_ADD_CONTROL="AddControls";
  var NET_OPERATION_GET_MAPS_ARRAY="GetMaps";
  var NET_OPERATION_GET_SERVER_STATUS="GetStatus";
  var NET_MSG_WRONG_EMAIL="E-postaddressen finns inte registrerad";
  var NET_MSG_WRONG_PASS="Felaktigt lösenord";


  var NET_OPERATION_GET_ALL_RESULTS= "GetAllResults";
  var NET_OPERATION_GET_MY_RESULTS= "GetMyResults";
  var GETMAPS_CACHE_INVALIDITY_TIME_MS = 604800000;
  var GETMAP_CACHE_INVALIDITY_TIME_MS = 604800000;
  var GET_ALL_RESULTS_CACHE_INVALIDITY_TIME_MS= 30000;
  var GET_MY_RESULTS_CACHE_INVALIDITY_TIME_MS= 30000;
  var CACHE_INVALIDITY_TIME_MS = 604800000; //one week is 604800000
  var SERVER_GET_GRACE_TIME_MS = 60000; //one minute before we proactively update cache
  var previousOnlineStatus = true;
  var netCredentials;

  var DUMMY_RESPONSES = new Object();
  DUMMY_RESPONSES[NET_OPERATION_GET_MAP_COURSES]='{  "rd": {    "courses": {      "course": [        {          "ci": "1",          "mi": "2",          "cn": "Gröna banan",          "oc": "1",          "dif": "1"        },        {          "ci": "2",          "mi": "2",          "cn": "Blå bananen",          "oc": "1",          "dif": "2"        }      ]    }  }}';
  DUMMY_RESPONSES[NET_OPERATION_GET_MAP_COURSE]='{  "rd": {    "course": {      "ci": "1",      "mi": "2",      "cn": "Gröna banan",      "oc": "1",      "dif": "1",      "ctrls": {        "ctrl": [         {            "mi": "2",            "co": "8",            "is": "1",            "ig": "0"          },{            "mi": "2",            "co": "7",            "is": "0",            "ig": "0"          },{            "mi": "2",            "co": "11",            "is": "0",            "ig": "0"          },{            "mi": "2",            "co": "30",            "is": "0",            "ig": "0"          },{            "mi": "2",            "co": "28",            "is": "0",            "ig": "0"          },{            "mi": "2",            "co": "10",            "is": "0",            "ig": "0"          },{            "mi": "2",            "co": "4",            "is": "0",            "ig": "0"          },{            "mi": "2",            "co": "27",            "is": "0",            "ig": "1"          }         ]      }    }  }}';
  DUMMY_RESPONSES[NET_OPERATION_GET_MAP]='{"rd":{"maps":{"map":{"mid":"1","mn":"Centrum","tp":"http://localhost/","em":{"emid":"12","mn":"Extra 1","api":"2","mc":"Stan16"}}}}}';
  //DUMMY_RESPONSES[NET_OPERATION_GET_MAP_COURSE]='{  "rd": {    "course": {      "ci": "1",      "mi": "2",      "cn": "Gröna banan",      "oc": "1",      "dif": "1",      "ctrls": {        "ctrl": [          {            "mi": "2",            "co": "1",            "is": "1",            "ig": "0"          },          {            "mi": "3",            "co": "2",            "is": "0",            "ig": "0"          },          {            "mi": "4",            "co": "3",            "is": "0",            "ig": "0"          },          {            "mi": "5",            "co": "4",            "is": "0",            "ig": "1"          }        ]      }    }  }}';

  

  function createStorageKey(url){
    return 'stolpjakten.net.'+ url;
  }
  function isCacheUpToDate(url){
    var cached = getFromCache(url);
    //We have a cached value that was received in less than 
    // CACHE_INVALIDITY_TIME_MS ms ago.
    var invalidityTime = CACHE_INVALIDITY_TIME_MS;
    if (url.indexOf(NET_OPERATION_GET_MAPS_ARRAY) != -1){
      invalidityTime = GETMAPS_CACHE_INVALIDITY_TIME_MS;
    }else if(url.indexOf(NET_OPERATION_GET_MAP) != -1){
      invalidityTime = GETMAP_CACHE_INVALIDITY_TIME_MS;
    }else if(url.indexOf(NET_OPERATION_GET_ALL_RESULTS) != -1){
      invalidityTime = GET_ALL_RESULTS_CACHE_INVALIDITY_TIME_MS;
    }else if(url.indexOf(NET_OPERATION_GET_MY_RESULTS) != -1){
      invalidityTime = GET_MY_RESULTS_CACHE_INVALIDITY_TIME_MS;
    }
    if (cached != null &&
        ((Date.now() - cached.timestamp) < invalidityTime)){
        utils.logDebug("cache is up to date");
      return true;
    }else{
        utils.logDebug("cache is NOT up to date: \n" + url);
      return false;
    }
  }
  function shouldUpdateCache(url){
    var result = getOnlineStatus();
    if (isCacheUpToDate(url) && result){
      var cached = getFromCache(url);
      if ((Date.now() - cached.timestamp) < SERVER_GET_GRACE_TIME_MS){
        result = false;
      }
      utils.logDebug("shouldUpdateCache, cache.age: " + (Date.now() - cached.timestamp) + " grace: " + SERVER_GET_GRACE_TIME_MS);
    }
    utils.logDebug("shouldUpdateCache: " + result);
    return result;
  }
  function invalidateUserCache(creds){
   url = createURL(NET_OPERATION_GET_USER, creds.toXML());
   var cached = getFromCache(url);
   try{
     cached.timestamp = 0;
     localStorage.setItem(createStorageKey(url), JSON.stringify(result));
   }catch(err){
   }
  }

  function getFromCache(url){
    //utils.logDebug("will try to read from cache " + url)
    var result = JSON.parse(localStorage.getItem(createStorageKey(url)));
    //utils.logDebug('We got: ' + JSON.stringify(result) + ' when reading with key ' + createStorageKey(url));
    return result;
  }
  function cache(url, result){
    if (url.indexOf(NET_OPERATION_CREATE_USER) != -1 ||
        url.indexOf(NET_OPERATION_ADD_CONTROL) != -1 ||
        url.indexOf(NET_OPERATION_UPDATE_USER) != -1 ||
        url.indexOf(NET_OPERATION_GET_SERVER_STATUS) != -1){
      //No caching of those please..
    }else{
      localStorage.setItem(createStorageKey(url), JSON.stringify(result));
    }
  }
  function createURL(operation, xml)
  {
    utils.logDebug("XML:\n" + xml);
    if (operation == NET_OPERATION_GET_MAPS_ARRAY){
      return SERVER_URL.replace(API_TOKEN, "") + operation + "=" + window.btoa(xml);
    }else{
      return SERVER_URL.replace(API_TOKEN, getCurrentApi()) + operation + "=" + window.btoa(xml);
    }
  }
  function credentialsXml(credentials) {
       
        return "<cre><cid>" + self.cid() + "</cid><em>" + self.em() + "</em><pwd>" + self.pwd() + "</pwd><mid>" + self.mapId()+"</mid></cre>";
  }
  function assertCredentialHasToXml(credentials){
    if (typeof credentials.toXML == "undefined"){
      credentials = new Credentials().fromCredentials(credentials);
    }
  }

  function logoutOnError(text){
    if (typeof text != "undefined"){
      if (text.indexOf(NET_MSG_WRONG_EMAIL) > -1){
        utils.warning(I18n.t('views.users.login.unknownemail'));
        utils.logout();
      }else if(text.indexOf(NET_MSG_WRONG_PASS) > -1){
        utils.warning(I18n.t('views.users.login.loginrejected'));
        utils.logout();
      }else{
        utils.warning(I18n.t('views.users.login.unknownerror') + "\n" + text);
        utils.logout();
      }
    }
  }

  function sendToServer(operation, xml)
  {
        if (!getOnlineStatus()){
          if (operation != NET_OPERATION_GET_SERVER_STATUS){
            //We are offline and request is not checking server status
            //so we return offline to client.
            var cached =  getFromCache(createURL(operation, xml));
            if (typeof cached == "undefined" || cached == null){
              utils.logDebug("We missed in cache, operation: " + createURL(operation, xml));
              cached = new NetResult();
              cached.success = false;
            }
            return cached;
          }
        }
        console.time('sendToServer');
        utils.logDebug("request: " + xml);
        xml = toUTF(xml);
        utils.logDebug("converted request: " + xml);
        var url = createURL(operation, xml);
        utils.logDebug("Raw Request:\n" + url);
        var xmlHttp = null;
        var success = false;
        

        xmlHttp = new XMLHttpRequest();
        var parent = this;
        var result;
        var dialog = null;
             
        xmlHttp.onreadystatechange = function()
        {
            if (xmlHttp.readyState==4 && xmlHttp.status==200)
            {
                var msg = window.atob(xmlHttp.responseText);
                msg = toISO(msg);
                result = $.xml2json(msg);
                utils.logDebug("result: " + result + msg.substring(0,"<err>".length));
                if (typeof result != "undefined" && msg.substring(0,"<err>".length) == "<err>"){
                  logoutOnError(result);
                }
                result.timestamp = Date.now();
                cache(url, result);
                utils.logDebug("\n\nXml response:\n"+msg);
            }
        }
        result = getFromCache(url);
        //Don't pull from server if recently pulled.
        if (shouldUpdateCache(url)){
          //We use synchronous call if cache is not up to date
          if (dialog == null && operation != NET_OPERATION_GET_SERVER_STATUS && !isCacheUpToDate(url)){
            dialog = utils.serverSpinner(I18n.t('server.loading'), xmlHttp.open( "GET", url, isCacheUpToDate(url) ));
          }else{
            xmlHttp.open( "GET", url, isCacheUpToDate(url) );
          }

          try{
            xmlHttp.send( null );
            
          }catch(err){
            utils.logDebug("we have some error " + err);
          }finally {
           if (dialog != null){
             $("#loading").hide();
             dialog.close();
             dialog = null;
           }
          }
        }
        console.timeEnd('sendToServer');

        return result;

  }


  
 


  return { // public interface

    getFriendResults: function(netCredentials) {
      this.netCredentials = netCredentials;
      var jsonResult = new NetResult(false, null); 
      var xmlData ="<rd>" + netCredentials.toXML() +"</rd>";
      var serverResult = sendToServer(NET_OPERATION_GET_MY_RESULTS,xmlData);
      utils.logDebug("["+serverResult+"]");
      //TODO validate result was OK
      jsonResult.success = true;
      jsonResult.result = serverResult;
      return jsonResult

    },
    getResults: function(netCredentials) {
      this.netCredentials = netCredentials;
      var jsonResult = new NetResult(false, null); 
      var xmlData ="<rd>" + netCredentials.toXML() +"</rd>";
      var serverResult = sendToServer(NET_OPERATION_GET_ALL_RESULTS,xmlData);
      utils.logDebug("["+serverResult+"]");
      //TODO validate result was OK
      jsonResult.success = true;
      jsonResult.result = serverResult;
      return jsonResult

    },

    trackOnlineStatus:  function() {
        setTimeout(this.isOnline, 3000);
        setInterval(this.isOnline, 30000);
    },
/**
* @returns true if (and only if) .NET server and it's database is operational.
*/
    isOnline: function() {
        console.time('isOnline');
        utils.logDebug("checking online status...");
/*        if (!window.navigator.onLine){
          if (getOnlineStatus() == true){
            toggleOnlineStatus();
            
          }
        }else{*/
          //serverResult = sendToServer(NET_OPERATION_GET_SERVER_STATUS,"");
          var xmlHttp = new XMLHttpRequest();
          xmlHttp.timeout=3000;
          xmlHttp.onreadystatechange = function (oEvent) {  
            if (xmlHttp.readyState === 4) {  
              if (xmlHttp.status === 200) {  
                utils.logDebug("we are online");
                console.timeEnd('isOnline');
                if (getOnlineStatus() != true){
                  //utils.success("online!");
                  toggleOnlineStatus();
                }
              } else {  
                console.timeEnd('isOnline');
                utils.logDebug("we are not online");
                if (getOnlineStatus() == true){
                  toggleOnlineStatus();
                  isOnline(); //if we just went offline, try one more time just to be sure
                  utils.warning("offline!");
                }
              }  
            }  
          };
        xmlHttp.ontimeout = function () { 
          utils.logDebug("we are offline due to timeout");
          console.timeEnd('isOnline');
                if (getOnlineStatus() == true){
                  toggleOnlineStatus();
                  //utils.warning("offline!");
                }
        }
        xmlHttp.open("GET", createURL(NET_OPERATION_GET_SERVER_STATUS), true);
        xmlHttp.send(null);
        
        //}
        if (getOnlineStatus()){
          var pendingSticks = utils.getPendingSticks();
          if (pendingSticks.length > 0 ){
          var credentials = localStorage.getItem(getCredentialsKey());
          var mapId = getCurrentMapId();
          var netCredentials = new NetCredentials(credentials.email, credentials.password, mapId);
          for (var i = 0; i < pendingSticks.length; i++){
            try{
              var result = net.addControl(netCredentials, pendingSticks[i]);
            }catch(err){
              //ignore
            }
          }
          pendingSticks = [];
          localStorage.setItem(getPendingSticksKey(), pendingSticks);
          }
        }

      return getOnlineStatus();
    },

/**
 * Operation to register one control
* 
* @param netCredentials the mail, password and map Id used to identify who, and for what map the registration is intended
* @param controlRegistration containing id (note internal id)  and the code for the control being registered.
* 
* @returns NetResult containing the result string, "1 stolpe registrerad" on success=true.
*/
    addControl: function(netCredentials, controlRegistration) {
      
      var jsonResult = new NetResult(false, null); 
      var xmlData ="<rd>" + netCredentials.toXML() + controlRegistration.toXML() +"</rd>";
      try{
        var serverResult = sendToServer(NET_OPERATION_ADD_CONTROL,xmlData);
        
        utils.logDebug("["+serverResult+"]");
        utils.assertDefined(serverResult);
        if (serverResult.nreg == "1"){
          jsonResult.success = true;
          jsonResult.result = serverResult;
        }else if (serverResult.oreg == "1"){
          console.log("ok, so already taken...");
          jsonResult.result = serverResult;
          jsonResult.alreadyTaken = true;

        }
      }catch(err){console.log(err);}
      if (jsonResult.success){
        //invalidateUserCache(netCredentials);
      }

      return jsonResult;
    },
/**
*  Get maps information (see .NET userdoc) from server
* 
* Typical usage by client:
*         var result = net.getMaps();
*        if (result.success){
*            var returnedMapInfos = result.result.maps.map;
*            ...
*
* @return NetResult 
*/
    getMaps: function() {
      this.netCredentials = new NetCredentials("dummy@stolpljakten.se", "dummy", -1);
      var jsonResult = new NetResult(false, null); 
      try{
        var serverResult = sendToServer(NET_OPERATION_GET_MAPS_ARRAY,"");
        utils.assertDefined(serverResult.maps.map);
        serverResult.maps.map = toArray(serverResult.maps.map);
        jsonResult.success = true;
        jsonResult.result = serverResult;
        if (getCurrentMapId() == -1){
            setCurrentMap(serverResult.maps.map[0]);
        }
      }catch(err){console.log(err);}

      return jsonResult;
    },
/**
 * @returns UserData
*/
    getUser: function(netCredentials, fromCacheOnly) {
      this.netCredentials = netCredentials;
      var jsonResult = new NetResult(false, null); 
      try{
        
        var serverResult = sendToServer(NET_OPERATION_GET_USER,netCredentials.toXML());
        //TODO would be much nicer if there was a way to add the 
        //     toXML operation instead of re-create entire ud object
        serverResult.ud = new UserData().fromUserData(serverResult);
        //utils.logDebug("getUser JSON: " + JSON.stringify(serverResult));
        
        utils.assertDefined(serverResult.ud.em);
        if (typeof serverResult != "undefined"){
          if (typeof serverResult.ud != "undefined"){
            if (typeof serverResult.ud.em != "undefined"){
              jsonResult.success = true;
            }
          }
        }
        jsonResult.result = serverResult;
      }catch(err){
        console.log(err);
        jsonResult.success = false;
        
      }
      if(jsonResult.success){
        //In case we registered on other device, we need to update our 
        //cache with that data.
        var serverTakenSticks = toArray(jsonResult.result.tc.cc); //contains only taken sticks
        var cachedSticks = toArray(JSON.parse(localStorage.getItem(getSticksKey()))); //contains taken and not taken
        
         for (var i = 0; i < serverTakenSticks.length; i++) {
          for (var j = 0; j < cachedSticks.length; j++) {
            if (serverTakenSticks[i].id == cachedSticks[j].id){
              cachedSticks[j].taken = true;
              continue;
            }
          }
        }
        localStorage.setItem(getSticksKey(), JSON.stringify(cachedSticks));
      }

      return jsonResult;
    },
    getMap: function(netCredentials) {
      this.netCredentials = netCredentials;
      var jsonResult = new NetResult(false, null); 
      try{
        var serverResult = sendToServer(NET_OPERATION_GET_MAP,netCredentials.toXML());
        utils.assertDefined(serverResult.map.mid);
        jsonResult.success = true;
        jsonResult.result = serverResult;
        var takenSticks;
        try{
            takenSticks = toArray(JSON.parse(localStorage.getItem(getUserKey())).tc.cc);
        }catch(err){
          console.log("Error is: " + err);
          takenSticks=[];
        }
        
        var sticks = toArray(jsonResult.result.sticks.stick);
        for (var i = 0; i < sticks.length; i++) {
          sticks[i].taken = false;
          var taken = false;
          sticks.taken=false;
          for (var j = 0 ; j < takenSticks.length; j++){
              if (sticks[i].id == takenSticks[j].id){
                  sticks[i].taken=true;
                  break;
              }
          }
        }

      }catch(err){console.log(err);}
        utils.logDebug("getMap JSON: " + JSON.stringify(jsonResult));

        return jsonResult;
    },
    createUser: function(netCredentials, userData) {
      var jsonResult = new NetResult(false, null); 
      try{
        var xmlData ="<rd>" + netCredentials.toXML() + userData.toXML() +"</rd>";
        var serverResult = sendToServer(NET_OPERATION_CREATE_USER,xmlData);
        utils.assertDefined(serverResult);
        if (serverResult == "user created"){
          jsonResult.success = true;
        }
        jsonResult.result = serverResult;

      }catch(err){console.log(err);}

        return jsonResult;
    },
    updateUser: function(netCredentials, userData) {
      var jsonResult = new NetResult(false, null); 
      try{
        var xmlData ="<rd>" + netCredentials.toXML() + userData.toXML() +"</rd>";
        var serverResult = sendToServer(NET_OPERATION_UPDATE_USER,xmlData);
        utils.assertDefined(serverResult);
        utils.logDebug("["+serverResult+"]");
        if (serverResult == "user updated"){
          jsonResult.success = true;
          jsonResult.result = serverResult;
        }

      }catch(err){console.log(err);}

        return jsonResult;
    },
    getMapCourses: function(netCredentials)  {
      var jsonResult = new NetResult(false, null);
      try{
        var xmlData ="<rd>" + netCredentials.toXML() + "</rd>";
        console.log("Dummy JSON:" + DUMMY_RESPONSES[NET_OPERATION_GET_MAP_COURSES]);
        var serverResult = sendToServer(NET_OPERATION_GET_MAP_COURSES,xmlData);
        utils.assertDefined(serverResult);
        utils.logDebug("["+serverResult+"]");
        jsonResult.success = true;
        jsonResult.result = serverResult;

      }catch(err){console.log(err);}
      utils.logDebug("getMapCourses json result: " + JSON.stringify(jsonResult));

       return jsonResult;
    },
    getMapCourse: function(netCredentials, courseIdentifier)  {
      var jsonResult = new NetResult(false, null);
      try{
        var xmlData ="<rd>" + netCredentials.toXML() + courseIdentifier.toXML() + "</rd>";
        var serverResult = sendToServer(NET_OPERATION_GET_MAP_COURSE,xmlData);
        utils.assertDefined(serverResult);
        utils.logDebug("****["+serverResult+"]");
        jsonResult.success = true;
        jsonResult.result = serverResult;
        setCourseDetails(jsonResult.result.course.ci, jsonResult.result.course);

      }catch(err){console.log('**** ' + err);}

        return jsonResult;
    },
    getMapCourseResults: function(netCredentials, courseIdentifier)  {
      var jsonResult = new NetResult(false, null);
      try{
        var xmlData ="<rd>" + netCredentials.toXML() + courseIdentifier.toXML() + "</rd>";
        var serverResult = sendToServer(NET_OPERATION_GET_MAP_COURSE_RESULTS,xmlData);
        utils.assertDefined(serverResult);
        utils.logDebug("["+serverResult+"]");
        jsonResult.success = true;
        jsonResult.result = serverResult;

      }catch(err){console.log(err);}

        return jsonResult;
    },
    addCourseControl: function(netCredentials, courseControlRegistration)  {
      var jsonResult = new NetResult(false, null);
      try{
        var xmlData ="<rd>" + netCredentials.toXML() + courseControlRegistration.toXML() + "</rd>";
        var serverResult = sendToServer(NET_OPERATION_ADD_COURSE_CONTROL,xmlData);
        utils.assertDefined(serverResult);
        utils.logDebug("["+serverResult+"]");
        serverResult.msg = toArray(serverResult.msg);
        serverResult.courseComplete = false;
        for (var msg in serverResult.msg) {
            if (msg == "control registered") {
              jsonResult.success = true;
            } else if (msg.includes("already registered")) {
              jsonResult.success = true;
            } else if (msg == "course finished") {
              jsonResult.courseComplete = true;
            }
        }
        jsonResult.success = true;
        jsonResult.result = serverResult;

      }catch(err){
        console.log("err: " + JSON.stringify(err));
      }
        return jsonResult;
    },
    addCourseControls: function(netCredentials, courseControlsRegistration)  {
      var jsonResult = new NetResult(false, null);
      try{
        var xmlData ="<rd>" + netCredentials.toXML() + courseControlsRegistration.toXML() + "</rd>";
        var serverResult = sendToServer(NET_OPERATION_ADD_COURSE_CONTROLS,xmlData);
        utils.assertDefined(serverResult);
        utils.logDebug("["+serverResult+"]");
        serverResult.msgs = toArray(serverResult.msgs);
        serverResult.courseComplete = false;
        for (var msg in serverResult.msgs) {
          alert("msg: " + msg);
        }
        jsonResult.success = true;
        jsonResult.result = serverResult;

      }catch(err){
        console.log("err: " + JSON.stringify(err));
      }
        return jsonResult;
    }
  };
})();
