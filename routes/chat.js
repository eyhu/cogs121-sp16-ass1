var models = require("../models");

exports.view = function(req, res) {
    /* TODO */
		//var data = {data: []};

    models.NewsFeed.find().sort('+date')
      .exec(displayNewsFeed);

    function displayNewsFeed(err, data) {
    	console.log(data);
    	res.render('chat', {'newsfeed': data});
    }

    //res.render("chat", data);
};
