$(document).ready(function() {
    $("#darkmode-toggle").click(function() {
        $("#darkmode-toggle").toggleClass("darkmode-active");
        $("html").toggleClass("dark");
    });
});
