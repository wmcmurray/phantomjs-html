var system = require('system');
var args = system.args;
var page = require('webpage').create();
var url = args[1];

page.open(url, function (status) {
  if (status !== 'success') {
    console.log('Unable to access network');
    phantom.exit();
  } else {
    var html = '';

    var getHtml = function(){
      html = page.evaluate(function () {
        if(typeof window.phantomjsHtmlReady == 'undefined' || window.phantomjsHtmlReady){
          return document.getElementsByTagName('html')[0].innerHTML;
        } else {
          return null;
        }
      });

      if(html){
        console.log(html);
        phantom.exit();
      } else {
        // delay the loop a bit...
        setTimeout(getHtml, 100);
      }
    };

    getHtml();
  }
});