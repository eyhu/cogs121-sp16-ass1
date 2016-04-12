'use strict';

var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
	"twitterID": String,
	"token": String,
	"username": String,
	"displayName": String,
	"photo": String
});

var NewsFeedSchema = new mongoose.Schema({
  "user": String,
  "message": String,
  "photo": String,
  "posted": Date
});

// Export Schema
exports.User = mongoose.model('User', UserSchema);
exports.NewsFeed = mongoose.model('NewsFeed', NewsFeedSchema);