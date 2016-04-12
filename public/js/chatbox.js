(function($) {
    "use strict";
    /* TODO: Start your Javascript code here */
    var socket = io();
    $('form').submit(function() {
        socket.emit('newsfeed', $('#user_input').val());
        $('#user_input').val('');
        return false;
    });


    socket.on('newsfeed', function(data) {
        // grab and parse data and assign it to the parsedData variable.
        var parsedData = {
            "user": {
                "username": data.user,
                "photo": data.photo
            },
            "posted": data.posted,
            "message": data.message
        };

        console.log(parsedData);
        
        // other possible solution(s) here.
        $('#messages').prepend($('<li>').html(messageTemplate(parsedData)));

        // You may use this for updating new message
        function messageTemplate(template) {
        var result = '<div class="user">' +
            '<div class="user-image">' +
            '<img src="' + template.user.photo + '" alt="">' +
            '</div>' +
            '<div class="user-info">' +
            '<span class="username">' + template.user.username + '</span><br/>' +
            '<span class="posted">' + template.posted + '</span>' +
            '</div>' +
            '</div>' +
            '<div class="message-content">' +
            template.message +
            '</div>';
        return result;
    }
    });

    
})($);

