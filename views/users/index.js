// Make sure the namespace has been setup
App.Views.Users || (App.Views.Users = {})

// A `Backbone.View` for displaying a `User`. The view also is responsible for
// managing a popup dialog for editing the user settings.
App.Views.Users.Index = App.Views.Base.extend({

  className: 'users-index',

  // DOM events in the view that we are interested in
  events: {
    'click div.reg':      'onRegNavigation',
    'click div.login':    'onLoginNavigation',
    'click span.nation':  'onNation'
  },

  // The model passed into the view can be any `App.Models.User`.
  initialize: function() {
    var nation = localStorage.getItem(getLanguageKey());
    if (nation == null){
      localStorage.setItem(getLanguageKey(), 'sv');
    }
    this.render(); 
  },

  render: function() {
    var source = this.createHtml();
    var template = Handlebars.compile(source);
    var data = this.createData();
    var result = template(data);

    this.$el.html(result);
  },
  
  createHtml: function() {
    var source = '<div class="nations"><span class="nation" data-lang="sv">Sv</span><span class="nation" data-lang="en">En</span><span class="nation" data-lang="no">No</span>'+
                 '</div>' +
    '<div class="information-text"><h3>{{info_title}}</h3><br/>' +
    '{{information}}</div>' +
    '<div class="navigation"><div class="left reg">{{register}}</div>' +
    '<div class="right login">{{login}}</div></div>';
    return source;
  },
  
  createData: function() {
    var data = { "register": I18n.t('views.users.index.register'), "login": I18n.t('views.users.index.login'),
                 "information": I18n.t('views.users.index.information_text'), info_title: I18n.t('views.users.index.information_title') };
    return data;  
  },
  
  onRegNavigation: function() {
    window.location.href = '#user/register';
  },
  
  onLoginNavigation: function() {
    window.location.href = '#user/login';
  },
  
  onNation: function(event) {
    var nation = $(event.target).attr('data-lang');
    localStorage.setItem(getLanguageKey(), nation);
    // Denna alert är helt onödig bara för test!!!
    //console.log('Här sätter vi språkflaggan i LS till: '+nation);
    location.reload(); 
  }
   
});
