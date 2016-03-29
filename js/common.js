'use strict';

var ENDPOINT = "https://k18q71fw3c.execute-api.us-east-1.amazonaws.com/test/game";

function postRequest(path, data) {
    return $.post({
        url: ENDPOINT + '/' + path,
        contentType: 'application/json; charset=UTF-8',
        data: JSON.stringify(data)
    });
}

$(function(){
    window.roomCode = $.url('?').roomCode;
    var $header = $("#header");
    var done = $.Deferred();
    $header.load("js/template/header.hbs", function() { done.resolve(); });
    done.then(function() {
        $header.replaceWith(Handlebars.compile($header.html())({
            'roomCode': window.roomCode
        }));
    });
});