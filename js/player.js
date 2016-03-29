function loadTemplate(id){
    var $template = $("#"+id);
    var template = Handlebars.compile($template.html());
    $template.remove();
    return template;
}

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
        $main.html(newPromptTemplate({'story': "No story yet! It's your job to get it started."}));
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
            $newPrompt.attr("editable", false);
            $target.replaceWith($("<p>Prompt submitted!</p>"));
        });
        request.fail(function(errorCode, message){
            console.error("Failed to submit prompt!\n"+errorCode+": "+message);
            showNotification("Failed to submit prompt!", 3000);
        });
    };
});