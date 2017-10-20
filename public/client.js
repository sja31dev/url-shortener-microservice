/*jslint browser: true*/
/*global $, jQuery, alert*/

function shortUrlResponse(data) {
  $('#shortened-url').html(data.short_url);
  $('#shortened-url').attr('href', data.short_url);
}

function getShortUrl(urlToShorten) {
  "use strict";
  var url = "/new/" + urlToShorten;
  console.log(url);
  $.ajax({
    url: url,
    dataType: "json",
    success: shortUrlResponse,
    error: function () {
      console.log("fail");
    }
  });
}

$(document).ready(function () {
  "use strict";
  $("#shorten").click(function (e) {
    e.preventDefault();
    getShortUrl($("#url-string").val());
  });
});