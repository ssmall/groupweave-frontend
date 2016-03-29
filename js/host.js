'use strict';

var SQS_WAIT_TIME_SECONDS = 3;

// Initialize the Amazon Cognito credentials provider
AWS.config.region = 'us-east-1'; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'us-east-1:e026351f-8306-4efe-9a00-b1458b35a842'
});

AWS.config.credentials.get();

var sqs = new AWS.SQS({
    region: "us-east-1"
});

var SqsHandler = function (queueUrl) {
    console.info("Connecting to SQS queue with URL: " + queueUrl);

    var thisHandler = this;
    this.onmessage = function(messageBody) {};
    this.receive = function receive() {
        var receiveRequest = sqs.receiveMessage({
            QueueUrl: queueUrl,
            WaitTimeSeconds: SQS_WAIT_TIME_SECONDS
        });
        receiveRequest.on('success', function (data) {
            var messages = data.data["Messages"];
            for (var i = 0; i < messages.length; i++) {
                var message = messages[i];
                thisHandler.onmessage(JSON.parse(message["Body"]));
                var receiptHandle = message["ReceiptHandle"];
                var deleteMessageRequest = sqs.deleteMessage({
                    QueueUrl: queueUrl,
                    ReceiptHandle: receiptHandle
                });
                deleteMessageRequest.on('error', function (error) {
                    console.error("Error deleting message with receiptHandle=" + receiptHandle + " from queue " + queueUrl);
                    console.error(error);
                });
                deleteMessageRequest.send();
            }
        });
        receiveRequest.on('error', function (error) {
            console.error("Error occurred receiving message(s) for queue " + queueUrl);
            console.error(error);
        });
        receiveRequest.send();
    };
    this.start = function(){
        this.receive();
        window.setInterval(this.receive, SQS_WAIT_TIME_SECONDS * 1000);
    };

    return this;
};

function randomInt(min, max){
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomColor(){
    var r = randomInt(0,256);
    var g = randomInt(0,256);
    var b = randomInt(0,256);
    return "rgb("+r+","+g+","+b+")";
}

var Abbreviator = function(){
    var allNames = [];

    return {
        'abbr' : function(name){
            var endIndex = 1;
            var abbreviation = name.substring(0,endIndex);
            while (allNames.some(function(existingName){ return abbreviation == existingName })){
                endIndex++;
                abbreviation = name.substring(0,endIndex);
            }
            allNames.push(abbreviation);
            return abbreviation;
        }
    };
}();

var players = [];


$(function () {
    var $notification = $("#notification");

    var showNotification = function(text, timeout){
        if (timeout === undefined) {
            timeout = 1500;
        }
        $notification.text(text);
        $notification.toggleClass('show');
        window.setTimeout(function(){ $notification.toggleClass('show') }, timeout);
    };

    var $playerList = $("#playerList");
    var $playerListTemplate = $("#playerList-template");
    var playerListTemplate = Handlebars.compile($playerListTemplate.html());
    $playerListTemplate.remove();

    var queueUrl = $.url('?').queueUrl;

    var sqsHandler = new SqsHandler(queueUrl);

    sqsHandler.onmessage = function(message){
        var messageType = message.type;
        var messageProperties = message.properties;
        switch (messageType) {
            case "PlayerJoined":
                var playerName = messageProperties.player_name;
                players.push({'abbr': Abbreviator.abbr(playerName),
                              'fullName': playerName,
                              'color': randomColor()});
                $playerList.html(playerListTemplate({'players': players}));
                showNotification(playerName+" has joined the game!");
                break;
            default:
                console.error("Handling for message type '"+message.type+"' is not implemented!");
                break;
        }
    };

    sqsHandler.start();

    window.startGame = function(){
        var request = postRequest(window.roomCode+'/start', {
            'token': $.url('?').token
        });
        request.done(function(){
            showNotification("Game started!");
        });
        request.fail(function(errorData){
            console.error(errorData.responseJSON.errorMessage);
            showNotification("Failed to start game!", 3000);
        });
    };
});