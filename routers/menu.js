/*
 * A `Backbone.Router` for managing `Menu` related routes.
 */
App.Routers.Menu = Backbone.Router.extend({

  routes: {
    'menu/index':           'index',
    'menu/index/:where':    'show',
    'menu/select':          'select'
  },
  // DOM events in the view that we are interested in
  /*
   * The menu.
   */
  index: function() {
    App.main( new App.Views.Menu.Index({}));
  },
  test: function(event) {
    alert('bosse');
  },
  
  /*
   * Get maps from api' to select from
   */
  select: function() {
    var maps = []
    console.log("getMaps 1");
    var result = net.getMaps();
    if (result.success){
      var returnedMapInfos = result.result.maps.map;
      for (var i = 0 ; i < returnedMapInfos.length; i++){
        var current = returnedMapInfos[i];
        maps.push( [current.mid, current.mn, current.api] );
      }
    } else {
      maps = [12, 'Friska Norden Demo'];
    }
    //console.log('[Routers] Dessa kartor finns att välja bland: '+maps);
    App.main( new App.Views.Menu.City({maps: maps}) );
  },
  
  show: function(where) {
    if (where === 'settings') {
      var data = this.getSettings();
      var title = I18n.t('views.menu.settingslabel');
    } else if (where === 'courseselection') {
      var data = this.getCourseSelection();
      var title = I18n.t('views.menu.courseselectionlabel');
    } else if (where === 'abortcourseselection') {
      setCourseMode(false);
      clearCourseProgress();
      window.location.href = '#maps/'+getCurrentMapId()+'/show';
    } else if (where === 'marker') {
      var data = this.getMarkers();
      var title = I18n.t('views.menu.stickslabel');
    } else if (where === 'account') {
      var data = this.getAccount();
      var title = I18n.t('views.menu.accountlabel');
    } else if (where === 'info') {
      var data = this.getInfo();
      var title = I18n.t('views.menu.infolabel');
    } else if (where === 'result') {
      var data = this.getResult();
      var title = I18n.t('views.menu.resultslabel');
    } else if (where === 'toplist') {
      var data = this.getToplist();
      var title = I18n.t('views.menu.toplistlabel');
    } else if (where === 'coursetoplist') {
      var data = this.getCourseToplist();
      var title = I18n.t('views.menu.toplistlabel');
    } else if (where === 'choosecity') {
      window.location.href="#/menu/select";
    } else if (where === 'sync') {
      this.sync();
      return;
    } else if (where === 'logout') {
      utils.logout();
    } else {
      var data = '<div class="option needsclick">Data saknas</div>';
    }

    App.main( new App.Views.Menu.Show({data: data, title: title}) );
  },
  
  getSettings: function() {
    // inställningar för appen
    return '<div class="option needsclick">'+
           // '<div class="option needsclick"> <a href="#/menu/select" style="text-decoration:none; color:#FFF">'+I18n.t('views.menu.choosecity')+'</a></div>'+
            '<div class="option needsclick"><p><label>'+I18n.t('views.menu.mapsettings')+'</label></p></div>'+
            
           this.createMarkerClusterHtml()+
           this.createFilterHtml()+
           this.createOLMapHtml()+
           this.createGPSHtml()+
           '</div>';
  },
  getCourseSelection: function() {
    var optionsString = '<div class="option needsclick" >'+
                       '<span class="stick_info" style="color:#FFF"></span>'+
                       '<span style="color:#FF"><a style="color:#FFF" href="#maps/'+getCurrentMapId()+'/show" onclick="setCourseMode('+false+')">'+I18n.t('views.menu.allstickslabel')+'</a></span>'+
                       '</div>';
    optionsString += '<div class="option" >'+
                       '<span class="stick_info" style="color:#FFF"><b>Stolpar</b></span>'+
                       '<span style="color:#FF"><b>Bana</b></span>'+
                       '</div>';
    var courses = net.getMapCourses(getNetCredentials());
    $.each(courses.result.courses.course, function(key, course) {
    setCourseOverview(course.ci, course);
    optionsString += '<div class="option needsclick" >'+
                       '<span class="level'+course.dif+' stick_info" style="color:#FFF">'+course.numsticks+'</span>'+
                       '<span style="color:#FF"><a style="color:#FFF" href="#maps/'+getCurrentMapId()+'/show" onclick="setCurrentCourse('+course.ci+')">'+course.cn+'</a></span>'+
                       '</div>';
    });

    return optionsString;
  },
  createMarkerClusterHtml: function() {
    if (getMarkerCluster()){
      return '<div class="option needsclick" <p><input id="toggleMarkerCluster" type="checkbox" onchange="toggleMarkerCluster()" checked/> <label for="toggleMarkerCluster" style="font-weight:normal">'+I18n.t('views.menu.groupstickslabel')+'</p></label></div>';
    }else{
      return '<div class="option needsclick" <p><input id="toggleMarkerCluster" type="checkbox" onchange="toggleMarkerCluster()"/> <label for="toggleMarkerCluster" style="font-weight:normal">'+I18n.t('views.menu.groupstickslabel')+'</p></label></div>';
    }
  },
  createFilterHtml: function() {
    if (getFilter()){
      return '<div class="option needsclick"<p><input id="toggleFilter" type="checkbox" onchange="toggleFilter()" checked/> <label for="toggleFilter" style="font-weight:normal">'+I18n.t('views.menu.hidetakenstickslabel')+'</p></label></div>';
    }else{
      return '<div class="option needsclick"<p><input id="toggleFilter" type="checkbox" onchange="toggleFilter()"/> <label for="toggleFilter" style="font-weight:normal">'+I18n.t('views.menu.hidetakenstickslabel')+'</p></label></div>';
    }
  },
  
  createOLMapHtml: function() {
    if (getOLMap()){
      return '<div class="option needsclick"<p><input id="toggleOLMap" type="checkbox" onchange="toggleOLMap()" checked/> <label for="toggleOLMap" style="font-weight:normal">'+I18n.t('views.menu.viewolmap')+'</p></label></div>';
    }else{
      return '<div class="option needsclick"<p><input id="toggleOLMap" type="checkbox" onchange="toggleOLMap()"/> <label for="toggleOLMap" style="font-weight:normal">'+I18n.t('views.menu.viewolmap')+'</p></label></div>';
    }
  },
  createGPSHtml: function() {
    if (getGPS()){
      return '<div class="option needsclick" <p><input id="toggleGPS" type="checkbox" onchange="toggleGPS()" checked/> <label for="toggleGPS" style="font-weight:normal">'+I18n.t('views.menu.gpslabel')+'</p></label></div>';
    }else{
      return '<div class="option needsclick" <p><input id="toggleGPS" type="checkbox" onchange="toggleGPS()"/> <label for="toggleGPS" style="font-weight:normal">'+I18n.t('views.menu.gpslabel')+'</p></label></div>';
    }
    return '';
  },
  getMarkers: function() {
    var storage = getCurrentMap();
        mapView = storage.mid;
    var sticks = JSON.parse(localStorage.getItem(getSticksKey()));
    var numberOfTakenSticks = 0;

    //console.log("sticks: " + JSON.stringify(sticks));
    var html = '';

    
    var htmlFragment = '';

    for (var i = 0; i < sticks.length; i++) {
      var taken = false;
      if (sticks[i].taken == true){
        numberOfTakenSticks++;
      }
      
      htmlFragment += '<div class="option needsclick"><span class="level'+sticks[i].difficulty+' stick_info" style="color:#FFF">';
      if (sticks[i].taken == true){htmlFragment += '<s>';}
      htmlFragment += sticks[i].number;
      if (sticks[i].taken == true){htmlFragment += '</s>';}
      htmlFragment += '</span><span><a style="color:#FFF" href="#/maps/'+mapView+'/'+sticks[i].number+'">';
      if (sticks[i].taken == true){htmlFragment += '<s>';}
      if (typeof sticks[i].culture != "undefined"){ htmlFragment += '<span class="glyphicon glyphicon-info-sign" style="position:inherit"></span> ';}
      htmlFragment += sticks[i].description;
      if (sticks[i].taken == true){htmlFragment += '</s>';}
      htmlFragment +='</a></span></div>';
    }
    html += htmlFragment + '</div>'
    return '<div style="z-index:99; -webkit-overflow-scrolling: touch;-webkit-transform: translate3d(0px, 0px, 0px)"><div class="option needsclick"><span class="stick_info">'+numberOfTakenSticks + '/' +sticks.length+'</span><span>'+I18n.t('views.menu.takenstickslabel')+'</span></div>' + html;
  },
  
  getAccount: function() {
    // som registreringsformuläret
    return '<div class="option needsclick">'+I18n.t('views.menu.accountsettingslabel')+'</div>';
  },
  
  getInfo: function() {
    var city = 'Default stad',
        img = 'bild',
        link = 'www.example.com';
    
    var storage = getCurrentMap(),
        mapId = storage.mid;
    
    if (localStorage.getItem(getInfoKey())) {
      var storage = JSON.parse(localStorage.getItem(getInfoKey()));
      city = storage.ct;
      img = storage.cimg;
      link = storage.clnk;
    }
    
    // information om staden
    return '<div class="information"><span>'+city+'</span><br/><span>'+img+'</span><br/><span>'+link+'</span><br/></div>';
  },
  
  getResult: function() {
    
    
    var result = net.getFriendResults(getNetCredentials());
    //console.log(JSON.stringify(result));
    if (result.success){
      var friends = toArray(result.result.res.rr);
      var html= "" //TODO, add myself in list? '<div class="option needsclick"><span style="float: right;margin-right: 10px;">'+friends[i].r+'</span><span>'+I18n.t('views.menu.melabel')+'</span></div>';
      for (var i = 0; i < friends.length; i++){
        html += '<div class="option needsclick"><span style="float: right;margin-right: 10px;">'+friends[i].r+'</span><span>'+friends[i].n+'</span></div>'
      }
    }else{
      utils.warning(I18n.t('views.menu.friendsresultserror'));
    }
    return html;
  },
  
  getToplist: function() {
    var resultIndex = new ResultIndex(0,100); //statically pull top 100
        var credentials = getNetCredentials();
        //Alt. assign it to existing credentials object:
        credentials.res = resultIndex;
        var result = net.getResults(credentials);
        //console.log(JSON.stringify(result));
        if (result.success){
          var items = toArray(result.result.res.rr);
          var html = "";
          for (var i = 0; i < items.length; i++){
            html += '<div class="option needsclick"><span style="float: right;margin-right: 10px;">'+items[i].r+'</span><span>'+(i+1)+'. '+items[i].n+'</span></div>';
          }
        }else{
          utils.warning(I18n.t('views.menu.toplisterror'));
        }
    return html;
  },
  
  getCourseToplist: function() {
    var resultIndex = new ResultIndex(0,100); //statically pull top 100
        var credentials = getNetCredentials();
        //Alt. assign it to existing credentials object:
        credentials.res = resultIndex;
        var result = net.getMapCourseResults(credentials, new CourseIdentifier(getCurrentCourse()));
        //console.log(JSON.stringify(result));
        if (result.success){
          var items = toArray(result.result.results.result);
          var html = "";
          for (var i = 0; i < items.length; i++){
            html += '<div class="option needsclick"><span style="float: right;margin-right: 10px;">'+items[i].name+'</span><span>'+(i+1)+'. '+items[i].startdate+'</span></div>';
          }
        }else{
          utils.warning(I18n.t('views.menu.toplisterror'));
        }
    return html;
  },
  sync: function(){
    //Save some data that can be handy to keep until next login session
    var currentMap = getCurrentMap();
    var language = localStorage.getItem(getLanguageKey());
    var filter = getFilter()
    var cluster = getMarkerCluster();
    var courseMode = getCourseMode();
    var netCreds = getNetCredentials();
    localStorage.clear();
    

    try{
      var result = net.getUser(netCreds);
      if(result.success) {
        var creds = new Object();
        creds.username = netCreds.un;
        creds.password = netCreds.pwd;
        localStorage.setItem(getCredentialsKey(), JSON.stringify(creds));
        localStorage.setItem(getUserKey(), JSON.stringify(result.result));
        localStorage.setItem(getLanguageKey(), language);
        setCurrentMap(currentMap);
        localStorage.setItem(getFilterOnKey(), filter);
        localStorage.setItem(getMarkerClusterOnKey(), cluster);
        setCourseMode(courseMode);
      }
    }catch(err){
      console.log(err);
      utils.error(I18n.t('views.users.login.logininternalerror'));
    }finally{
        window.location.href='#maps/'+getCurrentMapId()+'/show';
    }

    
  }
  
});
