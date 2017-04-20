/*
 * A `Backbone.Router` for managing `Maps` related routes.
 */
App.Routers.Maps = Backbone.Router.extend({

  routes: {
    'maps/:id/show':        'show',
    'maps/:id/:marker':     'marker'
  },
  
  /*
   * Show-view maps.
   */
  show: function(id) {
    var id = id || getCurrentMapId();
    var retrievedObject = JSON.parse(localStorage.getItem(getCredentialsKey()));
    var sticks = [];
    var result = net.getMap(new NetCredentials(retrievedObject.username, retrievedObject.password, id));
    if (result.success){
      var returnedSticks = [];
      try {
        returnedSticks = toArray(result.result.sticks.stick);
      }catch(err) {
      }

      // Spara stads information till localStorage
      if( returnedSticks ) { //ct är information om en stolpe, inte staden..
        try{
            //TODO, fix later
            localStorage.setItem(getInfoKey(), JSON.stringify({ct: returnedSticks[0].ct, cimg: returnedSticks[0].cimg, clnk: returnedSticks[0].clnk}));
          }catch(err){
          }
      }else {
        // Verkar inte finnas kartinformation
        //console.log('Kartinformation: '+JSON.stringify(result.result));
      }
      
      if (typeof returnedSticks == "undefined") {
        //No result, means we need to reset taken sticks
      }else{
        //We might need special handling for one stick returned -> no array
        for (var i = 0 ; i < returnedSticks.length; i++){
          var current = returnedSticks[i];
          //orginal
          //var stick = new Stick(current.nr, current.id, current.d, current.c);
          var stick = new Object();
          stick.number = current.nr;
          stick.id = current.id;
          stick.difficulty = current.d
          stick.description = current.desc;
          stick.taken = current.taken;
          stick.latitude = current.lat;
          stick.longitude = current.lng;
          stick.mapId = current.mid || getCurrentMapId();
          if (typeof current.sn != "undefined"){
            var sponsor = new Object();
            sponsor.name = current.sn;
            sponsor.description = current.st;
            if (typeof current.simg != "undefined"){
              if (current.simg.indexOf('http') == 0){
                sponsor.image = current.simg;
              }else{
                sponsor.image = result.result.map.url + 'Images/Repo/' + current.simg;
              }
            }
            sponsor.link = current.slnk;
            stick.sponsor = sponsor; 
          } 
          if (typeof current.ct != "undefined"){
            var culture = new Object();
            culture.description = current.ct;
            if (typeof current.cimg != "undefined"){
              if (current.cimg.indexOf('http') == 0){
                culture.image = current.cimg;
              }else{
                culture.image = result.result.map.url + 'Images/Repo/' + current.cimg;
              }
            }
            culture.link = current.clnk;
            stick.culture = culture; 
          } 
 
          //var stick = [current.nr, current.id, current.d, current.c, false];
          //console.log("Stored " + JSON.stringify(stick));
          sticks.push(stick);
        }
      }
      var key = getSticksKey();
      //console.log("putting stick in storage with id: " + key);
      localStorage.setItem(key, JSON.stringify(sticks));
    }
    
    App.main( new App.Views.Maps.Show({map: id}) );
  },
  
  /*
   * Show-view marker.
   */
  marker: function(id, marker) {
    var mapId = id,
        markerId = marker;
    /* TODO: hämta stolpe från api't med id: marker */
    var sticks = JSON.parse(localStorage.getItem(getSticksKey()));
    for (var i = 0 ; i < sticks.length; i++){
      if (sticks[i].number == marker){
        //console.log('rätt var: '+i);
        var key = getSelectedMarkerKey();
        localStorage.setItem(key, JSON.stringify(sticks[i]));
        break;
      }
    }
        
    App.main( new App.Views.Maps.Marker({mapid: mapId, markerid: markerId}) );
  }
  
});
