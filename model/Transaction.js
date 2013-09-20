'use strict';

var mongoose = require('mongoose')
  , async = require("async")
  , Card = require("../model/card")
  , Merchant = require('../model/merchant');

var Transaction = mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    require: true
  },

  merchant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Merchant",
    require: true
  },

  card: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Card",
    require: true
  },

  value: {
    type: Number,
    require: true
  },

  kind:{
    type:String,
    enum: ["deposit", "pay", "withdraw"]

  },

  state: {
    type: String,
    default: "initial"
  }

});

Transaction.statics.txRun = function(merchantId, cardId, value, kind) {

  return function(cb){
    var tx = new exports({
      destination:desId,
      kind: kind,
      value: value,
      state: "pending"
    });
    async.series([

      // Save transaction

      function(cb){
        tx.save(cb);
      },

      // Apply Transaction to destination

      function(cb){
        switch (tx.kind){
          case ("deposit"):
            Card.findOne({_id:tx.destination, pendingTransaction:{$ne: tx._id}})
              .exec(function(err, card){
                console.log(card.pendingTransaction);
                if (err) cb(err);
                card.balance += tx.value;
                card.pendingTransaction.push(tx._id);
                card.save(cb);
              });
            break;
          case ("pay"):
            Card.findOne({_id:tx.destination, pendingTransaction:{$ne: tx._id}})
              .exec(function(err, card){
                console.log(card.pendingTransaction);
                if (err) cb(err);
                card.balance -= tx.value;
                card.pendingTransaction.push(tx._id);
                card.save();
              });
        }
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
        tx.state = "done";
        tx.save(cb);
      }
    ], cb)
  }
}

module.exports = exports =  mongoose.model('Transaction', Transaction);