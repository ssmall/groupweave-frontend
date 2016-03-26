$(function(){
    var $headerTemplate = $("#header-template");
    $headerTemplate.replaceWith(Handlebars.compile($headerTemplate.html())({
        'roomCode' : $.url('?').roomCode
    }));
});