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

  type: String,

  state: {
    type: String,
    default: "initial"
  }

});

Transaction.statics.txRun = function(desId, value, type) {

  return function(cb){
    var tx = new exports({
      destination:desId,
      type: type,
      value: value,
      state: "pending"
    })
    async.series([

      // Save transaction

      function(cb){
        switch (tx.type){
          case ("deposit"):
            tx.save(cb);
            break;
          case ("pay"):
            tx.value = -tx.value;
            tx.save(cb);
            break;
          default:
            cb(new Error(500));
            break;
        }
      },

      // Apply Transaction to destination

      function(cb){
        Card.findOne({_id:tx.destination, pendingTransaction:{$ne: tx._id}})
          .exec(function(err, card){
            console.log(card.pendingTransaction);
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
        Card.findOne({_id:desId, pendingTransaction:tx._id})
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