'use strict';

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomColor() {
    var r = randomInt(0, 256);
    var g = randomInt(0, 256);
    var b = randomInt(0, 256);
    return "rgb(" + r + "," + g + "," + b + ")";
}

var Abbreviator = function () {
    var allNames = [];

    return {
        'abbr': function (name) {
            var endIndex = 1;
            var abbreviation = name.substring(0, endIndex);
            while (allNames.some(function (existingName) {
                return abbreviation == existingName
            })) {
                endIndex++;
                abbreviation = name.substring(0, endIndex);
            }
            allNames.push(abbreviation);
            return abbreviation;
        }
    };
}();

var players = [];


$(function () {
    var $main = $("div#main");

    var $playerList = $("#playerList");
    var $playerListTemplate = $("#playerList-template");
    var playerListTemplate = Handlebars.compile($playerListTemplate.html());
    $playerListTemplate.remove();

    var queueUrl = $.url('?').queueUrl;

    var messageHandler = new GameMessageHandler(queueUrl);
    messageHandler.onmessage("PlayerJoined", function (properties) {
        var playerName = properties.player_name;
        players.push({
            'abbr': Abbreviator.abbr(playerName),
            'fullName': playerName,
            'color': randomColor()
        });
        $playerList.html(playerListTemplate({'players': players}));
        showNotification(playerName + " has joined the game!");

    });

    messageHandler.start();

    window.startGame = function () {
        var request = postRequest(window.roomCode + '/start', {
            'token': $.url('?').token
        });
        request.done(function () {
            showNotification("Game started!");
            $main.html("Please wait while the players submit their prompts.");
        });
        request.fail(function (errorData) {
            console.error(errorData.responseJSON.errorMessage);
            showNotification("Failed to start game!", 3000);
        });
    };
});