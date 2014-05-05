App.Models.User = App.Models.Base.extend({
  

});

App.Collections.User = App.Collections.Base.extend({
  model: App.Models.User
});

//_.extend(App.Models.User, App.Mixins.I18n, { namespace: 'senior' });
