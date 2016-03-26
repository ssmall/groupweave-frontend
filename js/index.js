ENDPOINT = "https://k18q71fw3c.execute-api.us-east-1.amazonaws.com/test/game";

$(function(){
    window.hostGame = function hostGame(event){
        var playerName = $("input#playerName").val();
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
                    'token': data.hostToken
                });
        });
        request.fail(function(error){
            alert("Error creating game! "+error);
        });
    };
});