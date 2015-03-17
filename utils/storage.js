var fs;
var map = null;

// KEYS
function getTilesStorageBaseDir(){
  return 'stolpjakten.'+getCurrentMapId()+'.tiles.';
}

function getInfoKey(){
  return 'stolpjakten.'+getCurrentMapId()+'.info';
}

function getSticksKey(){
  return 'stolpjakten.'+getCurrentMapId()+'.sticks';
}

function getPendingSticksKey(){
  return 'stolpjakten.'+getCurrentMapId()+'.sticks.pending';
}

function getSelectedMarkerKey(){
  return 'stolpjakten.'+getCurrentMapId()+'.sticks.selected';
}
function getLastAttemptedRegistrationKey(){
  return 'stolpjakten.'+getCurrentMapId()+'.sticks.lastRegistration';
}

function getZoomPositionKey(){
  return 'stolpjakten.'+getCurrentMapId()+'.zoomposition';
}
function getGPSPositionKey(){
  return 'stolpjakten.'+getCurrentMapId()+'.gpsposition';
}
function getGPSWatchKey(){
  return 'stolpjakten.'+getCurrentMapId()+'.gpswatch';
}
function getExtraMapIdsKey(){
  return 'stolpjakten.' + getCurrentMapId()+'.extramapids';
}

function getCredentialsKey(){
  return 'stolpjakten.credentials';
}

function getCurrentMapKey(){
  return 'stolpjakten.currentmap';
}

function getUserKey(){
  return 'stolpjakten.user';
}

function getLanguageKey() {
  return 'stolpjakten.language';
}

function getOnlineStatusKey() {
  return 'stolpjakten.onlinestatus';
}
function toggleOnlineStatus(){
  toggleSetting(getOnlineStatusKey());
}
function getOnlineStatus(){
  return getSetting(getOnlineStatusKey());
}

function getFilterOnKey() {
  return 'stolpjakten.filter';
}
function toggleFilter(){
  toggleSetting(getFilterOnKey());
}
function getFilter(){
  return getSetting(getFilterOnKey());
}
function getOLMapOnKey() {
  return 'stolpjakten.olmap';
}
function toggleOLMap(){
  toggleSetting(getOLMapOnKey());
}
function getOLMap(){
  return getSetting(getOLMapOnKey());
}
function getNewMap(){
  if (map != null){
    map.stopLocate();
    map.remove();
  }
  map = L.map('map', {maxZoom: 18, attributionControl: false});
  return map;
}

function getMarkerClusterOnKey() {
  return 'stolpjakten.cluster';
}
function toggleMarkerCluster(){
  toggleSetting(getMarkerClusterOnKey());
}
function getMarkerCluster(){
  return getSetting(getMarkerClusterOnKey());
}



function getGPSOnKey() {
  return 'stolpjakten.gps';
}
function toggleGPS(){
  toggleSetting(getGPSOnKey());
}
function getGPS(){
  return getSetting(getGPSOnKey());
}

//Generic boolean settings operations
function toggleSetting(setting){
  var enabled = getSetting(setting)
  
  if (enabled){
    enabled = 'false';
  }else{
    enabled = 'true';
  }
  localStorage.setItem(setting, enabled);
  return enabled;
}
function getSetting(setting){
  var enabled = localStorage.getItem(setting);
  if (enabled === "true" || enabled === "false"){
    //Value is set
  }else{
    //No value set, so we return default
    enabled = 'true'; //Set default value here
  }

  return enabled === 'true';
}



function getLastAttemptedRegistration(){
  return JSON.parse(localStorage.getItem(getLastAttemptedRegistrationKey()));
}

function getCurrentMap(){
  return JSON.parse(localStorage.getItem(getCurrentMapKey()));
}

function getNetCredentials(){
  var creds = JSON.parse(localStorage.getItem(getCredentialsKey()));
  return new NetCredentials(creds.email, creds.password, getCurrentMapId());
}

function getCurrentMapId(){
  var result = -1;
  try{
    result = getCurrentMap().mid;
  }catch(err){
    //we didn't get from cache so let's use ID 1
  }
  return result;
}
function toArray(myObject){
  if (typeof myObject == "undefined"){
    myObject = [];
  }else if (myObject == 'null' || myObject == null){
    myObject = [];
  }else if( Object.prototype.toString.call( myObject ) != '[object Array]' ) {
    var tmp=new Array();
    tmp[0]=myObject;
    myObject = tmp;
  }
  return myObject;
}

function onInitFs(filesystem) {
    this.fs = filesystem;
    console.log("FS ready!");
}
  function onError(e) {
    console.log('Error', e);
  }
function initFS() {
  if (typeof this.fs == "undefined" ){
  // Request Quota (only for File System API)  
    window.webkitStorageInfo.requestQuota(PERSISTENT, 1024*1024, function(grantedBytes) {
      window.webkitRequestFileSystem(PERSISTENT, grantedBytes, onInitFs, onError); 
    }, function(e) {
      console.log('Error', e); 
    });  
  }
}

function cachetile(url, target){
  initFS();
  //var target = url;
  if (typeof fs == "undefined"){
  
  }else{
        
        
        console.log('url: ' + url + ' target: ' +target);
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'blob';
        xhr.onload = function(event){
            if (this.readyState == this.DONE && this.response && (this.status == 200 || this.status == 0)) {
                console.log("We got the image: " + url);
                var xhr = this;
                fs.root.getFile(target, { create:true }, function(fileEntry) {
                    fileEntry.createWriter(function(writer){
                        // create a Blob of the fetched content, and use xhr FileWriter to save it to disk
                        var blob = new Blob([xhr.response], {type:xhr.getResponseHeader('Content-type') });
                        writer.onerror = function(){console.log("no1");}
                        writer.onwriteend = function(){url='filesystem:' + url; console.log(url);}
                        writer.write(blob);
                    }, function(){console.log("no2");});
                }, function(){console.log("no3");});
            } else {
            }
        };
        xhr.onerror = function() {
            console.log('XHR error - Image ' + url + ' could not be downloaded - status: ' + this.status);
        };
        xhr.send();

  }
  return 'filesystem:'+target;
}





