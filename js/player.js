const DEFAULT_STORY = "No story yet! It's your job to get it started. Try opening with something like, \
'Once upon a time'. Except, you know ... less clichéd.";

$(function(){
    var newPromptTemplate = loadTemplate("newPrompt-template");

    var $main = $("div#main");
    var queueUrl = $.url('?').queueUrl;

    var messageHandler = new GameMessageHandler(queueUrl);

    messageHandler.onmessage("PlayerJoined", function(message){
        var playerName = message.player_name;
        showNotification(playerName+" has joined the game!");
    });
    messageHandler.onmessage("GameStarted", function(){
        showNotification("Game started!");
        $main.html(newPromptTemplate({'story': DEFAULT_STORY}));
    });
    messageHandler.onmessage("StoryUpdate", function(message){
        var deferred = showNotification("The host has chosen a prompt!");
        if (message.is_final_round){
            deferred.then(function(){
               showNotification("This is the final round! Try to wrap up the story.", 3000);
            });
        }
        $main.html(newPromptTemplate({'story': message.story}));
    });

    messageHandler.onmessage("Done", function(message){
        $("#story").text(message.story);
        showNotification("Game over! The winner is "+message.winner+"!", 30000);
    });

    messageHandler.start();

    window.submitPrompt = function(event){
        var $target = $(event.target);
        var $newPrompt = $("#newPrompt");
        var request = postRequest(window.roomCode+"/submit", {
            'token': $.url('?').token,
            'prompt': $newPrompt.val()
        });
        request.done(function(){
            $newPrompt.attr("readonly", true);
            $target.replaceWith($("<p>Prompt submitted!</p>"));
        });
        request.fail(function(errorCode, message){
            console.error("Failed to submit prompt!\n"+errorCode+": "+message);
            showNotification("Failed to submit prompt!", 3000);
        });
    };
});