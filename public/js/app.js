"use strict";

$.scalpel.queue['form.validate'] = function() {
  var form = $(this);
  this.handlers.push(function() {
    form.validate();
    return form.valid();
  });
};

$.scalpel.queue['.select2'] = function() {
  $(this).select2();
};