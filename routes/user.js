'use strict';

var app = require("../app")
  , User = require("../model/user")
  , _ = require("underscore");

app.get('/user/public-settings', function(req, res, next){
  if (!req.user) return res.redirect("/");
  res.render('user/public-settings');
});

app.post('/user/public-settings', function(req, res, next){
  if (!req.user) return res.send(404);

  _.each(req.body.user, function(num, key, list){
    if (num != "") {
      req.user[key] = list[key]
    }
  });

  req.user.save(function(err){
    if (err) return next(err);
    res.json({
      redirect: "/"
    })
  })
});

app.get('/user/private-settings', function(req, res, next){
  if (!req.user) return res.redirect("/login");
  res.render('user/private-settings');
});

app.post('/user/private-settings', function(req, res, next){
  if ((req.body.pwd.newPassword == req.body.pwd.confirmPassword) &&
    (req.user.password == req.body.pwd.oldPassword)){
    req.user.password = req.body.pwd.newPassword;
    req.user.save(function(err){
      if (err) return next(err);
      res.json({
        redirect : "/"
      })
    })
  } else {
    res.json({
      redirect: "/user/private-settings",
      notices: res.notices.error("Something is invalid").get()
    })
  }
});