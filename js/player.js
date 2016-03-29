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

    window.submitPrompt = function(){

    };
});