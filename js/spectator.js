'use strict';

var audio_gameInProgress = new Audio("audio/in_progress.wav");
var audio_gameOver = new Audio("audio/game_over.wav");
var audio_update = new Audio("audio/update.wav");

$(function(){
    var $main = $("div#main");
    var promptsTemplate = loadTemplate("prompts-template");
    var storyTemplate = loadTemplate("story-template");
    var finishedStoryTemplate = loadTemplate("finished-story-template");

    var queueUrl = $.url('?').queueUrl;

    var messageHandler = new GameMessageHandler(queueUrl);

    messageHandler.onmessage("PlayerJoined", function(message){
        showNotification(message.player_name + " joined the game!");
    });

    messageHandler.onmessage("GameStarted", function(){
        $main.html($("<p>Game started! Waiting for players to begin weaving a tale ...</p>"));
        audio_gameInProgress.loop = true;
        audio_gameInProgress.play();
    });

    messageHandler.onmessage("NewPrompts", function(message){
        var prompts = message.prompts.map(function (text){
            return {'text': text};
        });

        $main.append(promptsTemplate({'prompts': prompts}));
        audio_update.play();
    });

    messageHandler.onmessage("StoryUpdate", function(message){
        $main.html("");
        var renderedTemplate = storyTemplate({'story': message.story,
            'finalRound': message.is_final_round});
        $main.html(renderedTemplate);
        audio_update.play();
    });

    messageHandler.onmessage("Done", function(message){
        $("#promptList").remove();
        $("div#storyContainer").remove();
        $main.html(finishedStoryTemplate(message));
        audio_gameInProgress.pause();
        audio_gameOver.loop = true;
        audio_gameOver.play();
    });

    messageHandler.start();
});