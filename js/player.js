$(function(){
    var queueUrl = $.url('?').queueUrl;

    var messageHandler = new GameMessageHandler(queueUrl);

    messageHandler.onmessage("PlayerJoined", function(message){
        var playerName = message.player_name;
        showNotification(playerName+" has joined the game!");
    });

    messageHandler.start();
});