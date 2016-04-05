'use strict';

$(function(){
    var $playerName = $("input#playerName");
    window.hostGame = function hostGame(event){
        var playerName = $playerName.val();
        var request = postRequest("new", {
            'name': playerName
        });
        request.done(function(dataJson){
            var data = JSON.parse(dataJson);
            window.location.href = "host.html?"+ $.param({
                    'roomCode': data.gameId,
                    'token': data.hostToken,
                    'queueUrl': data.queueUrl
                });
        });
        request.fail(function(error){
            alert("Error creating game! "+error);
        });
    };
    
    window.joinGame = function joinGame(event) {
        var playerName = $playerName.val();
        var gameId = $("input#gameId").val();
        var request = postRequest(gameId + "/join", {
            'name': playerName
        });
        request.done(function (dataJson) {
            var data = JSON.parse(dataJson);
            window.location.href = "player.html?" + $.param({
                    'roomCode': gameId,
                    'token': data.playerToken,
                    'queueUrl': encodeURI(data.queueUrl)
                });
        });
        request.fail(function (error) {
            alert("Error joining game! " + error);
        });
    };

    window.spectateGame = function spectateGame(event) {
        var gameId = $("input#gameId").val();

        var request = postRequest(gameId + "/spectate", {});
        request.done(function(dataJson){
            var data = JSON.parse(dataJson);
            window.location.href = "spectator.html?" + $.param({
                   'roomCode': gameId,
                    'queueUrl': encodeURI(data.queueUrl)
                });
        });
        request.fail(function (error){
            alert("Error spectating game!" + error);
        });
    };
});