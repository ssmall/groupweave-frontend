'use strict';

var ENDPOINT = "https://k18q71fw3c.execute-api.us-east-1.amazonaws.com/test/game";

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

window.SqsHandler = function (queueUrl) {
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

window.GameMessageHandler = function(queueUrl){
    var sqsHandler = new SqsHandler(queueUrl);
    var messageTypeCallbacks = {};

    this.onmessage = function(type, callback){
        messageTypeCallbacks[type] = callback;
    };
    sqsHandler.onmessage = function(messageBody){
        var messageType = messageBody.type;
        var messageProperties = messageBody.properties;

        var callback = messageTypeCallbacks[messageType];
        if (callback !== undefined){
            callback(messageProperties);
        } else {
            console.error("No handler for message of type "+messageType);
        }
    };

    this.start = function () { sqsHandler.start() };

    return this;
};


window.postRequest = function postRequest(path, data) {
    return $.post({
        url: ENDPOINT + '/' + path,
        contentType: 'application/json; charset=UTF-8',
        data: JSON.stringify(data)
    });
}

window.loadTemplate = function loadTemplate(id){
    var $template = $("#"+id);
    var template = Handlebars.compile($template.html());
    $template.remove();
    return template;
}

$(function(){
    var $header = $("#header");
    if ($header.length > 0) {
        window.roomCode = $.url('?').roomCode;
        var done = $.Deferred();
        $header.load("js/template/header.hbs", function () {
            done.resolve();
        });
        done.then(function () {
            $header.replaceWith(Handlebars.compile($header.html())({
                'roomCode': window.roomCode
            }));
        });
    }

    var $notification = $("#notification");

    if ($notification.length > 0) {
        window.showNotification = function (text, timeout) {
            if (timeout === undefined) {
                timeout = 1500;
            }
            var deferred = $.Deferred();
            $notification.text(text);
            $notification.toggleClass('show');
            window.setTimeout(function () {
                $notification.toggleClass('show');
                deferred.resolve();
            }, timeout);
            return deferred;
        };
    }
});