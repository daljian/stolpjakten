// Make sure the namespace has been setup
App.Views.Users || (App.Views.Users = {})

// A `Backbone.View` for displaying a `User`. The view also is responsible for
// managing a popup dialog for editing the user settings.
App.Views.Users.Register = App.Views.Base.extend({

  className: 'users-register',

  // DOM events in the view that we are interested in
  events: {
    'click .submit-button':  'onSubmit'
  },

  // The model passed into the view can be any `App.Models.User`.
  initialize: function() {
    this.render();
  },

  /**
   * Renders the view using the `views/users/edit.hbs` template.
   */
  render: function() {
    var maps = this.options.maps;
    this.maps = maps;
    var source = this.createHtml(maps);
    var template = Handlebars.compile(source);
    var data = this.createData();
    var result = template(data);

    this.$el.html(result);
    $('select[name="year"]').val('1980').prop('selected', true);
  },
  
  // Controll if all fields have data and then create an user
  
  onSubmit: function() {
    var validReg = true;
    setCourseMode(false);

    $('input').each( function(key, value){
      //Validate pwd
      
      console.log("data: " + $(this).attr('name'));
      var name = $(this).attr('name');
      var value = $('input[name="'+name+'"]').val();
      utils.logDebug("name is " + name);
      if (name != "sil" && name != "nl"){
        $(this).css( "background-color", "#2f5f99" ); //default to 'OK'
      }
      if (name == 'em'){
        if (value.length < 5 || value.indexOf('.') == -1 || value.indexOf('@') == -1){
          utils.warning(I18n.t('views.users.register.validateemail'));
          validReg = false;
          $(this).css( "background-color", "#CC3333" );
        }
      }else if ( name == 'fn') {
        if (value.length < 1 ){
          utils.warning(I18n.t('views.users.register.validateforname'));
          validReg = false;
          $(this).css( "background-color", "#CC3333" );
        }
      }else if ( name == 'ln') {
        if (value.length < 1 ){
          utils.warning(I18n.t('views.users.register.validatelastname'));
          validReg = false;
          $(this).css( "background-color", "#CC3333" );
        }
      }else if ( name == 'sa') {
        if (value.length < 1 ){
          utils.warning(I18n.t('views.users.register.validatestreet'));
          validReg = false;
          $(this).css( "background-color", "#CC3333" );
        }
      }else if ( name == 'zip') {
        if (value.length < 4 || value.length > 6 || value != parseInt(value)){
          utils.warning(I18n.t('views.users.register.validatezip'));
          validReg = false;
          $(this).css( "background-color", "#CC3333" );
        }
      }else if ( name == 'ci') {
        if (value.length < 1 ){
          utils.warning(I18n.t('views.users.register.validatecity'));
          validReg = false;
          $(this).css( "background-color", "#CC3333" );
        }
      }else if ( name == 'ph') {
        if (value.length < 1 ){
          utils.warning(I18n.t('views.users.register.validatephone'));
          validReg = false;
          $(this).css( "background-color", "#CC3333" );
        }
      }else if ( name == 'pw') {
        if (value.length < 6 ){
          utils.warning(I18n.t('views.users.register.validatepassword'));
          validReg = false;
          $(this).css( "background-color", "#CC3333" );
        }
      }
    });

    if (validReg) {
      var sil = $('input[name="sil"]').is(":checked") ? "1" : "0";
      var nl = $('input[name="nl"]').is(":checked") ? "1" : "0";
      var userData = new UserData(
        utils.encodeHTML($('input[name="em"]').val().trim()),
        utils.encodeHTML($('input[name="fn"]').val().trim()),
        utils.encodeHTML($('input[name="ln"]').val().trim()),
        utils.encodeHTML($('input[name="dn"]').val().trim()),
        utils.encodeHTML($('input[name="sa"]').val().trim()),
        utils.encodeHTML($('input[name="zip"]').val().trim()),
        utils.encodeHTML($('input[name="ci"]').val().trim()),
        utils.encodeHTML($('input[name="ph"]').val().trim()),
        utils.encodeHTML($('select[name="ge"]').val().trim()),
        utils.encodeHTML($('input[name="pw"]').val().trim()),
        sil,
        nl,
        $('select[name="ag"]').val(),
        '', //skip premium code
        new Array());
      
      var username = $('input[name="dn"]').val().trim(),
          pwd = $('input[name="pw"]').val().trim(),
          mapId = $('select[name="mapid"]').val().trim();
      var credentials = new NetCredentials(username, pwd, mapId);
      var result = net.createUser(credentials, userData);
      //console.log(userData);
      if( result.success ) { 
        localStorage.setItem(getUserKey(), JSON.stringify(net.getUser(credentials).result));
        localStorage.setItem(getCredentialsKey(), JSON.stringify({username: username, password: pwd, mapId: mapId}));
        //console.log('Registrering lyckades!');
        var selectedMap = new Object();
        selectedMap.mid = mapId;
        selectedMap.mn=""; //TODO, fix... 
        //console.log("Trying to store " + JSON.stringify(selectedMap));
        setCurrentMap(selectedMap);
        var test = getCurrentMap();
        //console.log("Stored " + JSON.stringify(test) + " and id is " + getCurrentMapId());

        window.location.href = '#maps/'+mapId+'/show';
        //window.location.href = '#user/login';
      } else {
        if (result.result == 'User exists'){
          utils.error(I18n.t('views.users.register.registrationfaileduserexists'));
        }else{
          utils.error(I18n.t('views.users.register.registrationfailed') + ": " + result.result);
        }
      }  
    }
    

  },
  
  // Om man vill ha ett annat startår än 1980 så är det bara att byta i if-satsen
  createHtml: function(maps) {
    var year = '';
    for(i = 1920; i < 2016; i++) {
      if(!(i == 1980)) {
        year += '<option value="'+i+'">'+i+'</option>';
      } else {
        year += '<option value="'+i+'" SELECTED>'+i+'</option>';
      }
    }

    var optionsString = ""
    $.each(maps, function(key, value) { optionsString += '<option value="'+value[0]+'">'+value[1]+'</option>'; });
    
    var source = '<div class="navigation"><div class="top"><a href="#user/information" style="float:left;"><span class="glyphicon glyphicon-remove-circle"></span></a>'+
    '{{menuTitle}}</div></div>' +
    '<div class="register-form">' +
    '<p><!-- <label>{{username}}:</label> --> <input name="dn" placeholder="{{username}}"></p>' +
    '<p><!-- <label>{{password}}:</label> --> <input name="pw" type="password" placeholder="{{password}}"></p>' +
    '<p><!-- <label>{{email}}:</label> --> <input name="em" type="email" placeholder="{{email}}"></p>' +
    '<p><!-- <label>{{fname}}:</label> --> <input name="fn" placeholder="{{fname}}"></p>' + 
    '<p><!-- <label>{{lname}}:</label> --> <input name="ln" placeholder="{{lname}}"></p>' + 
    '<p><!-- <label>{{street}}:</label> --> <input name="sa" placeholder="{{street}}"></p>' +
    '<p><!-- <label>{{zip}}:</label> --> <input name="zip" type="number" placeholder="{{zip}}"></p>' + 
    '<p><!-- <label>{{city}}:</label> --> <input name="ci" placeholder="{{city}}"></p>' + 
    '<p><!-- <label>{{phone}}:</label> --> <input name="ph" type="number" placeholder="{{phone}}"></p>' + 
    '<p><label>{{map}}:</label><div class="dropdown"><select name="mapid">'+optionsString+'</select></div></p>'+
    '<p><label>{{sex}}:</label><div class="dropdown"><select name="ge"><option value="0">{{female}}</option><option value="1">{{male}}</option></select></div></p>'+
    '<p><label>{{birth}}:</label><div class="dropdown"><select name="ag">'+year+'</select></div></p>'+
    '<p><input type="checkbox" name="sil" id="sil" value="1" CHECKED/> <label for="sil"> {{inlist}}</label></p>' +
    '<p><input type="checkbox" name="nl" id="nl" value="1" CHECKED/> <label for="nl">{{news}}</label></p>' +

//    '<p><!-- <label>{{premium}}:</label> --> <input name="pc" placeholder="{{premium}}"></p><div style="clear:both;display:block;overflow:hidden;"></div>' +
    '<div style="clear:both;display:block;overflow:hidden;"></div>' +

    '<p><div class="submit-button">{{regButton}}</div></p>' +
    '</div>';
    return source;
  },
  
  createData: function() {
    var data = { "menuTitle": I18n.t('views.users.register.register'), "email": I18n.t('views.users.register.email'), "fname": I18n.t('views.users.register.first_name'), 
                 "lname": I18n.t('views.users.register.last_name'), "username": I18n.t('views.users.register.username'), "street": I18n.t('views.users.register.street'),
                 "zip": I18n.t('views.users.register.zip'), "city": I18n.t('views.users.register.city'), "phone": I18n.t('views.users.register.phone'), 
                 "password": I18n.t('views.users.register.password'), "sex": I18n.t('views.users.register.sex'), "inlist": I18n.t('views.users.register.in_list'), "news": I18n.t('views.users.register.news'),
                 "birth":  I18n.t('views.users.register.birth_year'), "premium": I18n.t('views.users.register.premium'), "map": I18n.t('views.users.register.map'), "regButton": I18n.t('views.users.register.register'),
                  "male": I18n.t('views.users.register.male'), "female": I18n.t('views.users.register.female')};
    return data;  
  }
   
});
