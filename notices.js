'use strict';

module.exports = function(req, res, next) {

  var notices
    = res.notices
    = res.locals.notices = {

    get: function() {
      var all = req.session.notices || [];
      delete req.session.notices;
      return all;
    },

    add: function(kind, msg) {
      var all = req.session.notices || [];
      all.push({
        kind: kind,
        msg: req.i18n.__(msg)
      });
      req.session.notices = all;
      return this;
    },

    info: function(msg) {
      return this.add('info', msg);
    },

    warn: function(msg) {
      return this.add('warn', msg);
    },

    error: function(msg) {
      return this.add('error', msg);
    }

  };

  next();

};