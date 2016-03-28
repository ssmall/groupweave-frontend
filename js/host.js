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


$(function () {
    var queueUrl = $.url('?').queueUrl;

    var sqsHandler = new SqsHandler(queueUrl);

    sqsHandler.onmessage = function(messageBody){
        console.log("Message received:");
        console.log(messageBody);
    };

    sqsHandler.start();
});