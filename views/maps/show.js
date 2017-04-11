// Make sure the namespace has been setup
App.Views.Maps || (App.Views.Maps = {})

// A `Backbone.View` for displaying a `User`. The view also is responsible for
// managing a popup dialog for editing the user settings.
App.Views.Maps.Show = App.Views.Base.extend({

  className: 'maps-show',

  // DOM events in the view that we are interested in
  events: {
    'click .marker':  'goToMarker',
    'click .glyphicon-filter':   'doFilter',
    'click .glyphicon-compressed': 'doToggleMarkerCluster',
    'click .glyphicon-qrcode' : 'doScan',
    'click .glyphicon-screenshot' : 'doFindMe',
    'click a.tomenu':                  'toMenu'
  },

  // The model passed into the view can be any `App.Models.User`.
  initialize: function() {
    //try{
        var myself = this;
        var selectedMarker = JSON.parse(localStorage.getItem(getSelectedMarkerKey()));
        var openPopup = -1;
        this.openPopup = openPopup;
        if (selectedMarker != null && selectedMarker.openpopup){
            this.openPopup = selectedMarker.number;
            localStorage.removeItem(getSelectedMarkerKey());
        }
        getTilesStorageBaseDir();

        var hasPremiumCode = (net.getUser(getNetCredentials()).result.ud.pc !== "");
        this.hasPremiumCode = hasPremiumCode;

        
        if (net.getMaps().success){
            var mapsInfo = net.getMaps().result;
            var maps = toArray(mapsInfo.maps.map);
            var currentMap = null;
            for (var i = 0; i < maps.length; i++){
                if (maps[i].mid == getCurrentMapId()){
                    currentMap = maps[i];
                    break;
                }
            }
            if (currentMap != null){
                var tileArray = new Array();
                tileArray.push(currentMap.tp);
                var extraMaps = [];
                try{
                    extraMaps = toArray(currentMap.ems.em);
                }catch(err){
                }
                for (var i = 0; i < extraMaps.length; i++){
                    //TODO, check if user has bought the map (map code entered)
                        utils.logDebug("\nPushing " + extraMaps[i].tp + " if premium: " + hasPremiumCode + "\n");
                    if (hasPremiumCode){
                        tileArray.push(extraMaps[i].tp);
                    }else if (this.validateMapCode(extraMaps[i].mc, extraMaps[i].emid)){ // getCurrentMapId() +""+i -> 12 + "1" -> 121
                        tileArray.push(extraMaps[i].tp);
                    }
                }
            }
            this.tileArray = tileArray;
        }
        

        
        this.render();
   /* }catch(err){
      console.log("Found issue while rendering, will clear cache and go back");
      localStorage.clear();
      window.location.reload();
    }*/
  },
  validateMapCode: function(code, mapId){
    utils.logDebug("code is " + code);
    var valid = (code === "");
    var mapcodes = toArray(net.getUser(getNetCredentials()).result.ud.emmcs.emmc);
    for (var i = 0; i < mapcodes.length; i++){
        try{
          if (code == mapcodes[i] || code.toLowerCase() == mapcodes[i].toLowerCase()){
              valid = true;
              break;
          }
        }catch (err){
          //We probably got an empty code.. 
        }
    }
    if (valid){
        var extraMapIds = toArray(JSON.parse(localStorage.getItem(getExtraMapIdsKey())));
        var exists = false;
        for (var i = 0; i < extraMapIds.length; i++){
            if (extraMapIds[i] == mapId){
                exists = true;
                break;
            }
        }
        if (!exists){
            //We have valid map code and we now need to save the 
            //"extra" mapId for that so we can check when placing markers
            extraMapIds.push(mapId);
        }
        
        localStorage.setItem(getExtraMapIdsKey(), JSON.stringify(extraMapIds));
    }
    return valid;
  },

  createHtml: function() {
    var source = '<div class="navigation map{{mapCss}}">'+
                 '<div class="top"><a class="icon{{mapCss}} tomenu" style="float:left;"><span class="glyphicon glyphicon-align-justify"></span></a>{{menuTitle}}'+
                 //'<span class="filter"><a href="#"><span class="glyphicon glyphicon-filter"></span></a></span>'+
                 this.createFilterIconHtml() +
                 this.createMarkerClusterIconHtml()+
                 this.createScanIconHtml()+
                 this.createGPSIconHtml()+


                 //'<span class="filter"><a href="javascript:void(0);" onclick="javascript:myself.seedLayerByIndex(0)"><span class="glyphicon glyphicon-download-alt"></span></a></span>'+
                 '</div></div>'+
                 '<div id="map-wrapper">' +
                 '<div id="map" style="height: '+this.getMapHeight()+';"></div>'+
                 '</div>';

    return source;
  },

  /**
   * Renders the view using the `views/users/edit.hbs` template.
   */
  render: function() {
    var myself = this;
    var source = this.createHtml();
    var template = Handlebars.compile(source);
    var data = this.createData();
    var result = template(data);

    this.$el.html(result);
    
    setTimeout(function () {
      if (getCourseMode()){
          myself.drawCourseMap();
      }else{
          myself.drawMap();
      }
    }, 10);
    

  },

    
  // Ritar ut kartan
  drawCourseMap: function() {
    var iconRadius = 25;
    var LeafIcon = L.Icon.extend({

        options: {
            iconSize:     [2*iconRadius, 2*iconRadius],
            iconAnchor:   [iconRadius, iconRadius],
            popupAnchor:  [0, 0]
        }
    });
    var startIcon = new LeafIcon({iconUrl: 'img/ringar/start.svg'});
    var controlIcon = new LeafIcon({iconUrl: 'img/ringar/oreggad.svg'});
    var goalIcon = new LeafIcon({iconUrl: 'img/ringar/goal.svg'});
    var startGoalIcon = new LeafIcon({iconUrl: 'img/ringar/start_goal.svg'});
    var courseData = net.getMapCourse(getNetCredentials(), new CourseIdentifier(getCurrentCourse()));
    var allSticks = JSON.parse(localStorage.getItem(getSticksKey()));
    var courseSticks = [];
    //TODO, It's not opimal to have the bigger array in inner loop, but want to
    //preserver order we get in outer array. Improve this later...

    $.each(courseData.result.course.ctrls.ctrl, function(key, value) {

        for (var i = 0 ; i < allSticks.length; i++){
            if (allSticks[i].id == value.mi){
                //alert ("key: " + key + " value: " + JSON.stringify(value));
                courseSticks.push(allSticks[i]);
                allSticks[i].available = true;
                allSticks[i].courseControlId = value.co;
                if (value.is == 1 && value.ig == 1){
                  allSticks[i]["icon"] = startGoalIcon;
                  allSticks[i].start=true;
                  allSticks[i].goal=true;
                else if (value.is == 1){
                  allSticks[i]["icon"] = startIcon;
                  allSticks[i].start=true;
                }else if (value.ig == 1){
                  allSticks[i]["icon"] = goalIcon;
                  allSticks[i].goal=true;
                }else{
                  allSticks[i]["icon"] = controlIcon;
                  if ( courseSticks.length == 2){
                    //alert("Bearing to first is " + new L.LatLng(courseSticks[0].latitude, courseSticks[0].longitude).bearingWordTo(new L.LatLng(courseSticks[1].latitude, courseSticks[1].longitude)));
                    courseSticks[0].iconRotation = new L.LatLng(courseSticks[0].latitude, courseSticks[0].longitude).bearingTo(new L.LatLng(courseSticks[1].latitude, courseSticks[1].longitude));
                  }
                }
                break;
            }
        }
    });

    localStorage.setItem(getSticksKey(), JSON.stringify(courseSticks));




    this.drawMap(courseSticks);
  },
  // Ritar ut kartan
  drawMap: function(sticks) {
    //var result = $("#myDiv").height();



    // Test markering för navigering till en stolpe där information visas och man kan checka av den
    var id = getCurrentMapId();
    this.id = id;
    //console.log("we have: " + JSON.stringify(id))
    
    if (typeof sticks == "undefined"){
        sticks = JSON.parse(localStorage.getItem(getSticksKey()));
    }

    
    if (sticks.length == 0){
        utils.warning(I18n.t('views.map.areaNotOpen'));
    }
    var minLat = 90;//sticks[0].latitude.replace(",",".");
    var maxLat = -90;//sticks[0].latitude.replace(",",".");
    var minLng = 180;//sticks[0].longitude.replace(",",".");
    var maxLng = -180;//sticks[0].longitude.replace(",",".");
    for (var i = 0 ; i < sticks.length; i++){
            maxLat = Math.max(maxLat,sticks[i].latitude.replace(",","."));
            minLat = Math.min(minLat,sticks[i].latitude.replace(",","."));
            maxLng = Math.max(maxLng,sticks[i].longitude.replace(",","."));
            minLng = Math.min(minLng,sticks[i].longitude.replace(",","."));
    }
    var map;
    try {
      map = getNewMap();//L.map('map', {maxZoom: 18, attributionControl: false});
    } catch (err) {
      //Hackish workaround
      //window.location.href = '#menu/index/tomap';
      window.location.href = '#/maps/'+getCurrentMapId()+'/show';
      return;
    }

    this.map = map;
    
    map.saveMapPosition = this.saveMapPosition;
    var self = this;

    map.on('click', self.saveMapPosition());


   
    var lastKnownZoomPosition = JSON.parse(localStorage.getItem(getZoomPositionKey()));
    
    if (lastKnownZoomPosition == null){
        try{
            map.fitBounds([
            [minLat, minLng],
            [maxLat, maxLng]
            ]);
        }catch(err){
            //Let's default to whatever is default
            map.fitBounds([
            [43.975, 15.382],
            [43.979, 15.386]
            ]);
        }
    }else{
        map.setView(new L.LatLng(lastKnownZoomPosition.latitude, lastKnownZoomPosition.longitude), lastKnownZoomPosition.zoom);
    }
    //Open street map - we do not cache
    var osmLayer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
      maxZoom: 18
    });
    //osmLayer.getTileUrl = this.getTileUrl;
    osmLayer.addTo(map);
    //utils.logDebug("Will enable Location tracking!");
    if (getGPS() & !getCourseMode()){
      this.enableLocationTracking(map);
    }else{
      this.disableLocationTracking(map);
    }
    
        // initialize the filesystem where we store cached tiles. when this is ready, proceed with the map
    console.log("tileArray: " + JSON.stringify(this.tileArray));
    for (var i = 0; i < this.tileArray.length && getOLMap(); i++){
        
        var current = L.tileLayer(this.tileArray[i]+'/{z}/{x}/{y}.png', {
            attribution: '© <a href="http://stolpjakten.se">Stolpjaktens</a> arrangörsklubbar',
            maxZoom: 18,
            tms: false,
            errorTileUrl: 'img/trans.png'
        });
        //TODO, below is showing how to override the getTileUrl
        //in order to enable offline caching of tiles.
        // Disable caching current.getTileUrl = this.getTileUrl;
        
        

        current.addTo(map);

    }
    
    //Päjsta här
    //Admin features
    L.control.mousePosition().addTo(map);
    //Right click on the map activated
    map.on('contextmenu', function(e) {
        window.prompt("Copy to clipboard: Ctrl+C, Enter", e.latlng.lat +","+e.latlng.lng);
    });


    L.control.scale().addTo(map);
//    L.control.compass().addTo(map);
    if (getCourseMode()){
        this.drawCourseMarkers(sticks, map);
    }else{
        this.drawMarkers(sticks, map);
    }
  },
  drawCourseMarkers: function(sticks, map){
    $.each(sticks, function(key, stick) {
        var marker = L.marker([stick.latitude, stick.longitude], {icon: stick.icon});
        if (typeof stick.iconRotation != "undefined"){
            marker.setRotationAngle(stick.iconRotation);
        }
        marker.bindPopup(' <div class="markers level'+stick.difficulty+'"> <span class="markerId="'+stick.number+'" style="color:grey"><div class="stick-number" markerId="'+stick.number+'">'+I18n.t('views.map.stick')+' '+stick.number+'.</div>'+stick.description+'</div></span>');
        marker.addTo(map);
        if (stick.number == this.openPopup){
          this.markerToOpen = marker;
        }
    });
    for (var i = 1 ; i < sticks.length; i++){
        this.drawLine(sticks[i-1], sticks[i], map);
    }
    var gpx = 'https://connect.garmin.com/modern/proxy/activity-service-1.1/gpx/activity/1142638320?full=true'; // URL to your GPX file or the GPX itself
    new L.GPX(gpx, {async: true}).on('loaded', function(e) {
      map.fitBounds(e.target.getBounds());
    }).addTo(map);
  },
  drawMarkers: function(sticks, map){
    var iconRadius = 25;
    var LeafIcon = L.Icon.extend({

        options: {
            iconSize:     [2*iconRadius, 2*iconRadius],
            iconAnchor:   [iconRadius, iconRadius],
            popupAnchor:  [0, 0]
        }
    });
    var greenIcon = new LeafIcon({iconUrl: 'img/ringar/oreggad.svg'});
    var redIcon = new LeafIcon({iconUrl: 'img/ringar/oreggad.svg'});
    var blackIcon = new LeafIcon({iconUrl: 'img/ringar/oreggad.svg'});
    var blueIcon = new LeafIcon({iconUrl: 'img/ringar/oreggad.svg'});
    var takenIcon = new LeafIcon({iconUrl: 'img/ringar/2/reggad.svg'});
    var markers;
    if (getMarkerCluster()){
        markers = new L.MarkerClusterGroup();
    }
    var filter = getFilter();

    //Go through the sticks in the cache and create markers
    for (var i = 0 ; i < sticks.length; i++){
        var stick = sticks[i];
        stick.available = true; //default stick to be not available
        if (stick.mapId != getCurrentMapId() && !this.hasPremiumCode){
            //Not main map, and no premium code so we check the "extra map" codes
            var extraMapIds = toArray(JSON.parse(localStorage.getItem(getExtraMapIdsKey())));
            //console.log("Trying to get with key: " + getExtraMapIdsKey() + " and got: " + JSON.stringify(extraMapIds) + " test: " + JSON.stringify(4));
            var valid = false;
            for(var j = 0; j < extraMapIds.length; j++){
                if(stick.mapId == extraMapIds[j]){
                    //console.log("compare " + stick.mapId + ":" + extraMapIds[j]);
                    valid = true;
                    break; //Done, leave this loop
                }
            }
            if (!valid){
                //console.log("will not render marker for " + stick.number + " mapId: " + stick.mapId);
                stick.available = false;
                continue; //No right to see marker - skip to next marker
            }
        }
        if (filter && stick.taken == true){
            continue;
        }
        var markerIcon = new Object();

        //console.log("stick.difficulty: " + stick.difficulty);
        switch(stick.difficulty)
        {
            case "1":

              markerIcon = greenIcon;
              break;
            case "2":
              markerIcon = blueIcon;
              break;
            case "3":
              markerIcon = redIcon;
              break;
            case "4":
              markerIcon = blackIcon;
              break;
            default:
              markerIcon = greenIcon;
        }
        if (stick.taken){
            markerIcon = takenIcon;
        }
      //console.log("Stick: " + JSON.stringify(stick));
      var marker;
      if (getMarkerCluster()){
        marker = L.marker([stick.latitude.replace(",","."), stick.longitude.replace(",",".")], {icon: markerIcon});
        markers.addLayer(marker);
      }else{
        marker = L.marker([stick.latitude, stick.longitude], {icon: markerIcon}).addTo(map)
      }
      marker.bindPopup(' <div class="markers level'+stick.difficulty+'"> <span class="marker" markerId="'+stick.number+'" style="color:grey"><div class="stick-number" markerId="'+stick.number+'">'+I18n.t('views.map.stick')+' '+stick.number+'.</div>'+stick.description+'</div></span><span class="marker" markerId="'+stick.number+'"><div class="markerbtn map'+getCurrentMapId()+'" markerId="'+stick.number+'">Info</div></span>');
      if (stick.number == this.openPopup){
        this.markerToOpen = marker;
      }


    }
   if (getMarkerCluster()){
     map.addLayer(markers);
   }
   if (typeof this.markerToOpen != "undefined"){
        this.markerToOpen.openPopup();
   }
    //push sticks back after updating available flag
    localStorage.setItem(getSticksKey(), JSON.stringify(sticks));
  },
  drawLine: function(fromStick, toStick, map){
    var pointA = new L.LatLng(fromStick.latitude, fromStick.longitude);
    var pointB = new L.LatLng(toStick.latitude, toStick.longitude);
    var pointList = [pointA, pointB];

    var line = new L.Polyline(pointList, {
    color: '#E6007E',
    weight: 2,
    opacity: 0,
    smoothFactor: 1

    });
    line.addTo(map)

    var decorator = L.polylineDecorator(line, {
        patterns: [
            // defines a pattern of 10px-wide dashes, repeated every 20px on the line
            {offset: 15, endOffset: 15, repeat: 2, symbol: L.Symbol.dash({pixelSize: 1, pathOptions: {color: '#E6007E'} })}
        ]
    }).addTo(map);


  },
  disableLocationTracking: function(map){
    var myself = this;
    if (myself.marker != null){
      map.removeLayer(myself.marker)
    }
    map.stopLocate();
  },
  enableLocationTracking: function(map){
      var myself = this;
      if (this.marker == null){
        var marker = new Object();
        this.marker = marker;
        utils.logDebug("in if");
          map.locate({setView: false, watch:true, enableHighAccuracy: getGPS(), maximumAge: 1000, timeout: 2000});
          map.on('locationfound', function (e) {
              
              var gpsPos = new Object()
              gpsPos.latitude = e.latlng.lat;
              gpsPos.longitude = e.latlng.lng;
              var radius = e.accuracy / 2;
              
              radius = 12.5; //hard coded, pixelvalue to match other markers on map.
            
              
              
              gpsPos.radius = radius;
              localStorage.setItem(getGPSPositionKey(), JSON.stringify(gpsPos));
              
              
              if (myself.marker != null){
                map.removeLayer(myself.marker)
              }
              myself.marker = L.circleMarker(e.latlng, {"radius":radius});
              myself.marker.addTo(map);
      });
    }
  },
  
  // event är vad man klickat på 
  goToMarker: function(event) {
    var marker = $(event.target).attr('markerId');
    this.saveMapPosition();
    this.disableLocationTracking(map);
    //console.log('Du har klickat på stolpe för navigering: '+marker);
    //console.log(lat+' '+lng);
    var sticks = JSON.parse(localStorage.getItem(getSticksKey()));
    for (var i = 0 ; i < sticks.length; i++){
        if (sticks[i].number == marker){
            var key = getSelectedMarkerKey();
            localStorage.setItem(key, JSON.stringify(sticks[i]));
            break;
        }
    }
    window.location.href = '#maps/'+getCurrentMapId()+'/'+marker;
  },
  createGPSIconHtml: function() {
    if (getGPS() && !getCourseMode()){
      return '<span class="filter"><a class="icon'+getCurrentMapId()+'" href="#"><span class="glyphicon glyphicon-screenshot"></span></a></span>';
    }else{
        return '';
    }
  },
  createFilterIconHtml: function() {
    return ''; //disable
    if (getFilter()){
      return '<span class="filter"><a href="#"><span class="selected glyphicon glyphicon-filter";"></span></a></span>';
    }else{
      return '<span class="filter"><a href="#"><span class="glyphicon glyphicon-filter"></span></a></span>';
    }
  },
  createMarkerClusterIconHtml: function() {
    return ''; //disable
    if (getMarkerCluster()){
      return '<span class="filter"><a href="#"><span class="selected glyphicon glyphicon-compressed"></span></a></span>';
    }else{
      return '<span class="filter"><a href="#"><span class="glyphicon glyphicon-compressed"></span></a></span>';
    }
  },
  createScanIconHtml: function(){
    if ( typeof cordova == "undefined" || typeof cordova.require == "undefined" ) {
//      return '';
      return '<span class="filter"><a class="icon'+getCurrentMapId()+'" href="#"><span class="glyphicon glyphicon-qrcode"></span></a></span>';
    }else{
      return '<span class="filter"><a class="icon'+getCurrentMapId()+'" href="#"><span class="glyphicon glyphicon-qrcode"></span></a></span>';
    }
  },
  doFilter: function(){
    toggleFilter();
    this.saveMapPosition();
    this.render();
  },
  doToggleMarkerCluster: function(){
    toggleMarkerCluster();
    this.saveMapPosition();
    //window.location.reload();
    this.render();
  },
  doScan: function(){
    this.disableLocationTracking(this.map);
    if (getCourseMode()){
    try {
      utils.scanCourse(this);
    } catch (err) {
     alert(err);
    }
    }else{
      utils.scan(this);
    }
    this.render();
  },
  doFindMe: function(){
    var gpsPosition = JSON.parse(localStorage.getItem(getGPSPositionKey()));
    this.map.panTo(L.latLng(gpsPosition.latitude, gpsPosition.longitude));
/*    toggleGPS();
    if (this.marker != null){
      this.map.removeLayer(this.marker)
    }
    if (getGPS()){
      this.enableLocationTracking(this.map);
      utils.logDebug("GPS: " + localStorage.getItem(getGPSPositionKey()));
      var gpsPosition = JSON.parse(localStorage.getItem(getGPSPositionKey()));
      if (gpsPosition != null){
          utils.logDebug("lng: " +gpsPosition.longitude);
          var marker = L.circleMarker(L.latLng(gpsPosition.latitude, gpsPosition.longitude), {"radius":gpsPosition.radius});
          this.marker = marker;
          this.marker.addTo(this.map);
          this.map.panTo(L.latLng(gpsPosition.latitude, gpsPosition.longitude));
      }
    }else{
      this.disableLocationTracking(this.map);
    }
 */
  },
  toMenu: function(){
    this.saveMapPosition();
    this.disableLocationTracking(map);
    window.location.href="#menu/index";
    
  },
  saveMapPosition: function(){
      try{
        var lat = this.map.getCenter().lat,
            lng = this.map.getCenter().lng;
        var lastKnownZoomPosition = new Object();
        lastKnownZoomPosition.latitude = lat;
        lastKnownZoomPosition.longitude = lng;
        lastKnownZoomPosition.zoom = this.map.getZoom();
        localStorage.setItem(getZoomPositionKey(), JSON.stringify(lastKnownZoomPosition));
      }catch(err){
      }
  },
  getMapHeight: function(){
    //var windowHeight = window.innerHeight - 55;
    //var pixelRatio = window.devicePixelRatio || 1; /// get pixel ratio of device
    //console.log("Map height is " + (windowHeight * pixelRatio))
    //return windowHeight * pixelRatio;
    return '100%';
  },
  
  createData: function() {
    var storage = getCurrentMap();
    var menuTitle = storage.mn;
    if (getCourseMode()) {
        menuTitle += " - " + getCourseOverview(getCurrentCourse()).cn;
    }
    var data = { "menuTitle": menuTitle, mapCss: this.options.map };
    return data;  
  },
/**
* This operation is overriding the operation in leaflet for the
* purpose of caching the tiles we are using.
*
*/
/*
	getTileUrl: function(tilePoint) {
    //TODO
    //If tile that is requested is available offline, create 
    // a filesystem url to that tile, else create network url
    //typically the first part (not options) would give:
    // tiles/13/4403/5785.png
    // if given base url is: tiles/{z}/{x}/{y}.png
    // This allows us to build up a map of tiles which we store
    // in local file system, and on cache successful we rewrite
    // the url to local storage instead.

    
		var url = L.Util.template(this._url, L.extend({
			s: this._getSubdomain(tilePoint),
			z: tilePoint.z,
			x: tilePoint.x,
			y: tilePoint.y
		}, this.options));
    
    var target = url.replace('http://','').replace('https://','').replace(/\//g, ".");
    cachetile(url, target);
    try{
        //downloadImage(retVal);
    }catch(err){
    }
    console.log("url: " + url);

    return url;
    
	}, */

   
});
