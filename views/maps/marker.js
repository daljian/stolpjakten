// Make sure the namespace has been setup
App.Views.Maps || (App.Views.Maps = {})

// A `Backbone.View` for displaying a `User`. The view also is responsible for
// managing a popup dialog for editing the user settings.
App.Views.Maps.Marker = App.Views.Base.extend({

  className: 'maps-marker',

  performRegistration: function(code) {
    var credentials = JSON.parse(localStorage.getItem(getCredentialsKey()));
    
    var netCredentials = new NetCredentials(credentials.username, credentials.password, this.id);
    //console.log("stickinfo: " + JSON.stringify(this.selectedStick));
    var attempedRegistration = new ControlRegistration(this.selectedStick.id, code);
    var result = net.addControl(netCredentials, attempedRegistration);
    var key = getLastAttemptedRegistrationKey();
    if (result.success == false){
      if (result.alreadyTaken == true){
        utils.warning(I18n.t('views.map.marker.registerduplicate'));
      }else{
        if (net.isOnline() == true){
          
          utils.error(I18n.t('views.map.marker.registerfail'));
        }else{
          utils.warning(I18n.t('views.map.marker.registerfailoffline'));
          attempedRegistration.success = false;
          localStorage.setItem(key, JSON.stringify(attempedRegistration));
          utils.updateStorageAfterRegistration(attempedRegistration);
        }
      }
      
    }else{
      //TODO, disable 
      utils.success(I18n.t('views.map.marker.registersuccess'));
      attempedRegistration.success = true;
      localStorage.setItem(key, JSON.stringify(attempedRegistration));
      utils.updateStorageAfterRegistration(attempedRegistration);
      //TODO, we do not want to go back, but actually stay in view, but re-render it. How?
      window.history.back();
    }
  },


  // DOM events in the view that we are interested in
  events: {
    'click div[data-action="register"]':         'onRegister',
    'click div[data-action="scan"]':             'onScan',
    'click div[data-action="zoomToMarker"]':     'onZoomToMarker',
    'click div[data-action="information"]':      'onInformation',
    'click a.back':                             'back',
    'click .opensponsor': 'openSponsorExternal',
    'click .openculture': 'openCultureExternal'
  },

  initialize: function() {
    //console.log(this.options.mapid);
    //console.log(this.options.markerid);
    

    this.id = this.options.mapid;
    this.render();
  },
  openSponsorExternal: function(){
    try{
      navigator.app.loadUrl(this.selectedStick.sponsor.link, {openExternal : true});
    }catch(err){
      window.open(this.selectedStick.sponsor.link, '_system');
    }
  },
  openCultureExternal: function(){
    try{
      navigator.app.loadUrl(this.selectedStick.culture.link, {openExternal : true});
    }catch(err){
      window.open(this.selectedStick.culture.link, '_system');
    }
  },

  render: function() {
    this.selectedStick = JSON.parse(localStorage.getItem(getSelectedMarkerKey()));
    var self = this;
    var source = this.createHtml();
    var template = Handlebars.compile(source);
    var data = this.createData();
    var result = template(data);

    this.$el.html(result);

  },
  
  back: function() {
    var storage = getCurrentMap();
        mapView = storage.mid;
    // TODO: Kolla om vi kom från menyn eller från kartan för att sedan navigera rätt tillbaka
    // I guess this will work
    window.history.back();
    /*if (true) {
      window.location.href = '#maps/'+mapView+'/show';
    } else {
      window.location.href = '#menu/index/marker';
    }*/
  },

  
  createHtml: function() {
    var source = '<div class="navigation map{{mapId}}"><div class="top"><a class="icon{{mapId}} back" style="float:left"><span class="glyphicon glyphicon-remove-circle"></span></a><span class="title">{{menuTitle}}</span></div></div>'+
                 '<div class="marker-body">' +
                 '<div class="normal info{{difficulty}}"><span class="markerNumber">{{markerNumber}}</span><span>{{markerName}}</span></div>';
                 var sponsorHtml = this.createSponsorHtml();
                 if(sponsorHtml != null){
                   source += sponsorHtml;
                 }
                 var cultureHtml = this.createCultureHtml();
                 if (cultureHtml != null){
                   source += cultureHtml;
                 }
                 var registerHtml = this.createRegistrationHtml();
                 if (registerHtml != null){
                   source += registerHtml;
                 }
                  var toggleButtonHtml = this.createToggleButtonHtml();
                 if (toggleButtonHtml != null){
                   source += toggleButtonHtml;
                 }
                 source += this.createShowOnMapHtml() +
                 '</div>'+
                 '</div>';
    return source;
  },

  createSponsorHtml: function() {
    var sponsorHtml = null;

    if (typeof this.selectedStick.sponsor != "undefined"){
      sponsorHtml =   '<div class="advert"><span class="opensponsor">';
      if (typeof this.selectedStick.sponsor.name != "undefined"){
        sponsorHtml += '<h3>'+this.selectedStick.sponsor.name+'</h3><br>';
      }
      if (typeof this.selectedStick.sponsor.image != "undefined"){
        sponsorHtml += '<img src="'+this.selectedStick.sponsor.image+'"><br>';
      }
      if (typeof this.selectedStick.sponsor.description != "undefined"){
        sponsorHtml += ' <p>'+this.selectedStick.sponsor.description+'</p></span></div>';
      }
      
    }
    return sponsorHtml;
  },
  createCultureHtml: function() {
    var cultureHtml = null;
    var style = '';
    if (typeof this.selectedStick.sponsor != 'undefined'){
      style = 'style="display:none;"';
    }
    if (typeof this.selectedStick.culture != "undefined"){
      cultureHtml =   '<div class="advert" '+style+'><span class="openculture">';
      if (typeof this.selectedStick.culture.image != "undefined"){
        cultureHtml += '<img src="'+this.selectedStick.culture.image+'"><br>';
      }
      if (typeof this.selectedStick.culture.description != "undefined"){
        cultureHtml += '<p>'+this.selectedStick.culture.description+'</p></span></div>';
      }
    }
    return cultureHtml;
  },
  createRegistrationHtml: function() {
    var registrationHtml = null;
    if (!this.selectedStick.taken){
      registrationHtml = '<div class="normal"><input class="markerCode" name="markerCode"> <div class="button map'+getCurrentMapId()+'" data-action="register">'+I18n.t('views.map.marker.register')+'</div></div>';
      if ( typeof cordova == "undefined" || typeof cordova.require == "undefined" ) {
        //We can't scan so do not display scan button
      }else{
        registrationHtml += '<div class="normal button map'+getCurrentMapId()+'" data-action="scan"> '+I18n.t('views.map.marker.scan')+' </div>';
      }
    }
    return registrationHtml;
  },
  createShowOnMapHtml: function() {
    var showHtml = "";
    if (this.selectedStick.taken && getFilter()){
      //Stick taken, and hidden on map - no way we can show it.
    }else if (this.selectedStick.available){
        showHtml = '<div class="normal button map'+getCurrentMapId()+'" data-action="zoomToMarker"> '+I18n.t('views.map.marker.showmarker')+' </div>';
    }
    return showHtml;
  },
  createToggleButtonHtml: function() {
    var toggleButtonHtml = null;
    //We have both kinds, so we need toggle button
    if (typeof this.selectedStick.sponsor != 'undefined' && typeof this.selectedStick.culture != 'undefined'){
      toggleButtonHtml =  '<div class="normal button toggle map'+getCurrentMapId()+'" data-action="information"> '+I18n.t('views.map.marker.cultureinfolabel')+' </div>' +
                          '<div class="normal button toggle map'+getCurrentMapId()+'" data-action="information" style="display:none;">'+I18n.t('views.map.marker.advertisementinfolabel')+'</div>';
    }
    return toggleButtonHtml;
  },
  
  
  createData: function() {
    var markerid = this.options.markerid;
    
    
    var data = { "menuTitle": I18n.t('views.map.marker.stickinfolabel'), "markerNumber": markerid, "markerName": this.selectedStick.description, "id": this.id, "difficulty": this.selectedStick.difficulty, "mapId": this.options.mapid };
    return data;  
  },
  
  onRegister: function() {
    this.performRegistration($('input[name="markerCode"]').val());
  },
  
  onScan: function() {
    utils.scan(this);
    this.render();
  },
    onZoomToMarker: function() {
    
    var zoomPosition = new Object();
    zoomPosition.zoom = 16;
    zoomPosition.latitude = this.selectedStick.latitude;
    zoomPosition.longitude = this.selectedStick.longitude;
    localStorage.setItem(getZoomPositionKey(), JSON.stringify(zoomPosition));
    this.selectedStick.openpopup=true;
    localStorage.setItem(getSelectedMarkerKey(), JSON.stringify(this.selectedStick));
    window.location.href = '#maps/'+getCurrentMapId()+'/show';
  },

  onInformation: function() {
    $(".advert").toggle();
    $(".toggle").toggle();
  },
   
});
