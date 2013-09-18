'use strict';

var mongoose = require('mongoose')
  , async = require("async")
  , Card = require("../model/card");

var Transaction = mongoose.Schema({

  destination: {
    type: mongoose.Schema.Types.ObjectId,
    require: true
  },

  value: {
    type: Number,
    require: true
  },

  state: {
    type: String,
    default: "initial"
  }

});

Transaction.statics.txRun = function(desId, value) {

  return function(cb){
    var tx = new exports({
      destination:desId,
      value: value,
      state: "pending"
    })
    async.series([

      // Save transaction

      function(cb){
        tx.save(cb);
      },

      // Apply Transaction to destination

      function(cb){
        Card.findOne({id:desId, pendingTransaction:{$ne: tx._id}})
          .exec(function(err, card){
            if (err) cb(err);
            card.balance += tx.value;
            card.pendingTransaction.push(tx._id);
            card.save(cb);
          })
      },

      // Set transaction committed

      function(cb){
        tx.state = "committed"
        tx.save(cb);
      },

      // Remove pending transaction

      function(cb){
        Card.findOne({id:desId, pendingTransaction:tx._id})
          .exec(function(err, card){
            if (err) cb(err);
            card.pendingTransaction.pull(tx._id);
            card.save(cb);
          })
      },

      // Finish transaction

      function(cb){
        tx.state = "done"
        tx.save(cb);
      }
    ], cb)
  }
}

module.exports = exports =  mongoose.model('Transaction', Transaction);