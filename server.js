// Node.js Dependencies
const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
// Added
var handlebars = require('express-handlebars');
var mongoose = require('mongoose');
var passport = require('passport');

require("dotenv").load();
var models = require("./models");
var db = mongoose.connection;

var router = {
	index: require("./routes/index"),
	chat: require("./routes/chat")
};

var parser = {
    body: require("body-parser"),
    cookie: require("cookie-parser")
};

var strategy = {
	Twitter: require('passport-twitter').Strategy
};

// Database Connection
var db = mongoose.connection;
mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://127.0.0.2/cogs121');
db.on('error', console.error.bind(console, 'Mongo DB Connection Error:'));
db.once('open', function(callback) {
     console.log("Database connected successfully.");
});

// session middleware
var session_middleware = session({
    key: "session",
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
    resave: true,
    store: new MongoStore({ mongooseConnection: db })
});

// Middleware
app.set("port", process.env.PORT || 3000);
app.engine('html', handlebars({ defaultLayout: 'layout', extname: '.html' }));
app.set("view engine", "html");
app.set("views", __dirname + "/views");
app.use(express.static(path.join(__dirname, "public")));
app.use(parser.cookie());
app.use(parser.body.urlencoded({ extended: true }));
app.use(parser.body.json());
app.use(require('method-override')());
app.use(session_middleware);

/* TODO: Passport Middleware Here*/
app.use(passport.initialize());
app.use(passport.session());

/* TODO: Use Twitter Strategy for Passport here */
passport.use(new strategy.Twitter({
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL: "/auth/twitter/callback"
}, function(token, token_secret, profile, done) {
    models.User.findOne({ "twitterID": profile.id }, function(err, user) {
    	// (1) Check if there is an error. If so, return done(err);
    	if (err) {return done(err); }
      
      if(!user) {
        // (2) since the user is not found, create new user.
        // Refer to Assignment 0 to how create a new instance of a model
        var newUser = new models.User({
        	"twitterID": profile.id,
			"token": token,
			"username": profile.username,
			"displayName": profile.displayName,
			"photo": profile.photo[0]
        });
        console.log("NEW");
        console.log(newUser);
        newUser.save();

        return done(null, profile);
      } else {
        // (3) since the user is found, update user’s information
        process.nextTick(function() {
            console.log("WELCOME BACK!");
            console.log(user);
            user.username = profile.username;
            user.displayName = profile.displayName;
            user.photo = profile.photo;

            user.save();
            return done(null, profile);
        });
      }
  });
}));

/* TODO: Passport serialization here */
passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(user, done) {
    done(null, user);
});

// Routes
/* TODO: Routes for OAuth using Passport */
app.get("/", router.index.view);
// More routes here if needed
app.get("/chat", router.chat.view);
app.get("/auth/twitter", passport.authenticate("twitter"));
app.get("/auth/twitter/callback",
	passport.authenticate("twitter", { successRedirect: "/chat",
                                       failureRedirect: "/" }));
app.get("/logout", function(req, res) {
	req.logout();
	res.redirect("/");
});

/* Socket.io related */
io.use(function(socket, next) {
     session_middleware(socket.request, {}, next);
});

/* TODO: Server-side Socket.io here */
io.on("connection", function(socket){
	/*socket.on("chat message", function(msg){
		io.emit("chat message", msg);
	});*/

	socket.on("newsfeed", function(msg) {
       try {
        //console.log(socket.request.session.passport.user);
        var userSocket = socket.request.session.passport.user;

        var newNewsFeed = models.NewsFeed({
            "user": userSocket.username,
            "message": msg,
            "photo": userSocket.photos[0].value,
            "posted": new Date()
        });

        newNewsFeed.save();
        io.emit("newsfeed", newNewsFeed);
       }
       catch (err) {
            console.log(err);
       }
		
	});
});

// Start Server
http.listen(app.get("port"), function() {
    console.log("Express server listening on port " + app.get("port"));
});
