// Global I18N object. Apart from the App module, this is the
// only module on global scope. It is made global to make it
// easily accessible since I18N is so basic to the whole application.
//
// Only one locale is loaded into the client at any time since
// having them all loaded at once is just wasteful, as opposed to
// on the server which is serving users with various locales.
//
// TODO: If we want to support changing locale while in the application
// we can `_.extend(I18n, Backbone.Events)` and trigger a change when
// the locale is changed. All views that render any translated content
// can then just `I18n.bind('change', this.render)` and the locale change
// will be reflected immediately thoughout the whole application.

window.I18n = {
  matcher: /%\{([A-Za-z_0-9]*)\}/gm,
  
  // Returns the translation corresponding to the given key. If the
  // translation contains placeholders, these are matched with keys
  // in the given options hash.
  //
  // The options may contain a scope in the form of a string or an
  // array, which will be prepended to the key:
  //
  //    t = I18n.t('half_a_minute', {scope: 'datetime.distance_in_words'})
  //    t = I18n.t('half_a_minute' {scope: ['datetime', 'distance_in_words']})
  //
  // Both examples above will retrieve the translation for the key
  // `datetime.distance_in_words.half_a_minute`. Scopes are optional and
  // convenient in some situations, but using the full key is optimal.
  //
  //     t = I18n.t('datetime.distance_in_words.half_a_minute')

  translate: function(key, options) {
    key = window.AppLanguage + '.' + key;
    var translation = _.reduce(key.split('.'), function(memo, key) {
      return memo ? memo[key] : undefined;
    }, I18n.Translations);

    // Interpolate string translation, replacing %{attribut} with option value
    if (typeof translation === 'string') {
      return _.reduce(translation.match(this.matcher), function(memo, match) {
        key = match.replace(I18n.matcher, '$1');
        return memo.replace(match, (options && options[key]) || ('[Missing option: ' + key + ']'));
      }, translation)
    }

    return translation || (options && options.silent ? '' : ('[Missing translation: ' + key + ']'));
  }
};

// Setup a shortcut to I18n.translate which is used often
I18n.t = I18n.translate;