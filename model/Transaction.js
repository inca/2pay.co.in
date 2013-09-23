'use strict';

var mongoose = require('mongoose')
  , async = require("async")
  , Card = require("../model/card")
  , Merchant = require('../model/merchant');

var Transaction = mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  merchant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Merchant"
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

Transaction.statics.txRun = function(userId, merchantId, cardId, value, kind) {

  return function(cb){
    var tx = new exports({
      kind: kind,
      value: value,
      state: "pending",
      card: cardId,
      merchant: merchantId,
      user: userId
    });

    async.series([

      // Save transaction

      function(cb){
        tx.save(cb);
      },

      // Apply Transaction

      function(cb){
        switch (tx.kind){
          case ("deposit"):
            Card.findOne({_id:tx.card, pendingTransaction:{$ne: tx._id}})
              .populate("merchant")
              .exec(function(err, card){
                if (err) cb(err);
                tx.merchant = card.merchant._id;
                tx.save();
                card.balance += tx.value;
                card.pendingTransaction.push(tx._id);
                card.save(cb);
              });
            break;
          case ("pay"):
            Card.findOne({_id:tx.card, pendingTransaction:{$ne: tx._id}})
              .exec(function(err, card){
                if (err) cb(err);
                card.balance -= tx.value;
                card.pendingTransaction.push(tx._id);
                Merchant.findOne({_id: tx.merchant, pendingTransaction:{$ne: tx._id}})
                  .exec(function(err, merchant){
                    if (err) cb(err);
                    merchant.balance += tx.value;
                    merchant.pendingTransaction.push(tx._id);
                    merchant.save(
                      card.save(cb)
                    );
                  });
              });
            break;
        }
      },

      // Set transaction committed

      function(cb){
        tx.state = "committed"
        tx.save(cb);
      },

      // Remove pending transaction

      function(cb){
        switch (tx.kind){
          case ("deposit"):
            Card.findOne({_id:tx.card, pendingTransaction:tx._id})
              .exec(function(err, card){
                if (err) cb(err);
                card.pendingTransaction.pull(tx._id);
                card.save(cb);
              });
            break;
          case ("pay"):
            Card.findOne({_id:tx.card, pendingTransaction:tx._id})
              .exec(function(err, card){
                if (err) cb(err);
                card.pendingTransaction.pull(tx._id);
                Merchant.findOne({_id:tx.merchant, pendingTransaction:tx._id})
                  .exec(function(err, merchant){
                    if (err) cb(err);
                    merchant.pendingTransaction.pull(tx._id);
                    merchant.save(
                      card.save(cb)
                    )
                  })
              });
            break;
        }
      },

      // Finish transaction

      function(cb){
        tx.state = "done";
        tx.save(cb);
      }
    ], cb)
  }
};

module.exports = exports =  mongoose.model('Transaction', Transaction);