ENDPOINT = "https://k18q71fw3c.execute-api.us-east-1.amazonaws.com/test/game";

$(function(){
    var $playerName = $("input#playerName");
    window.hostGame = function hostGame(event){
        var playerName = $playerName.val();
        var request = $.post({
            url: ENDPOINT+"/new",
            contentType: 'application/json; charset=UTF-8',
            data: JSON.stringify({
                'name': playerName
            })
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
        var request = $.post({
            url: ENDPOINT+"/"+gameId+"/join",
            contentType: 'application/json; charset=UTF-8',
            data: JSON.stringify({
                'name': playerName
            })
        });
        request.done(function(dataJson){
            var data = JSON.parse(dataJson);
            window.location.href = "player.html?" + $.param({
                    'roomCode': gameId,
                    'token': data.playerToken
                });
        });
        request.fail(function(error){
            alert("Error joining game! "+error);
        });
    }
});