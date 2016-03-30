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

var Story = function(){
    const DEFAULT_STORY = "There's no story yet! Choose the prompt that best begins our tale.";

    var storySoFar = null;

    return {
        get storySoFar() {
            if (storySoFar === null){
                return DEFAULT_STORY;
            } else {
                return storySoFar;
            }
        },
        'updateStory' : function(moreStory){
            if (storySoFar === null){
                storySoFar = moreStory;
            } else {
                storySoFar = storySoFar + " " + moreStory;
            }
        }
    };
}();

var players = [];

$(function () {
    var $main = $("div#main");

    var playerListTemplate = loadTemplate("playerList-template");
    var $playerList = $("#playerList");

    var choosePromptsTemplate = loadTemplate("choosePrompts-template");

    var token = $.url('?').token;

    var messageHandler = new GameMessageHandler($.url('?').queueUrl);
    messageHandler.onmessage("PlayerJoined", function (message) {
        var playerName = message.player_name;
        players.push({
            'abbr': Abbreviator.abbr(playerName),
            'fullName': playerName,
            'color': randomColor()
        });
        $playerList.html(playerListTemplate({'players': players}));
        showNotification(playerName + " has joined the game!");

    });

    messageHandler.onmessage("NewPrompts", function(message){
        var prompts = message.prompts.map(function (text){
           return {'text': text};
        });

        $main.html(choosePromptsTemplate({'story': Story.storySoFar,
                                          'prompts': prompts}));
    });

    messageHandler.onmessage("Done", function(message){
        $("#story").text(message.story);
        showNotification("Game over! The winner is "+message.winner+"!", 30000);
    });

    messageHandler.start();
    window.startGame = function() {
        var request = postRequest(window.roomCode + '/start', {
            'token': token
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

    window.choosePrompt = function(event){
        var $target = $(event.target);
        var $chosenRadio = $("input:radio[name='chosenPrompt']:checked");
        if ($chosenRadio.length == 0){
            showNotification("Please make a choice!", 3000);
        } else {
            var selectedPrompt = $chosenRadio.val();
            var submitRequest = postRequest(window.roomCode+"/choose", {
                'token': token,
                'prompt': selectedPrompt
            });
            submitRequest.done(function(){
                Story.updateStory(selectedPrompt);
                $("#story").text(Story.storySoFar);
                $target.replaceWith($("<p>Submitted!</p>"));
            });
            submitRequest.fail(function(errorCode, message){
                console.error("Unable to submit prompt!\n"+errorCode+": "+message);
                showNotification("Unable to submit prompt!", 3000);
            });
        }
    };
});