$(function(){
    var $header = $("#header");
    var done = $.Deferred();
    $header.load("js/template/header.hbs", function() { done.resolve(); });
    done.then(function() {
        $header.replaceWith(Handlebars.compile($header.html())({
            'roomCode': $.url('?').roomCode
        }));
    });
});