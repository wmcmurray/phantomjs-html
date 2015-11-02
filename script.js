var system = require('system');
var args = system.args;
var page = require('webpage').create();
var url = args[1];

page.open(url, function (status) {
  if (status !== 'success') {
    system.stderr.write('Unable to access network');
    phantom.exit();
  } else {
    var getHtml = function(){
      var ready = page.evaluate(function () {
        if(typeof window.phantomjsHtmlReady == 'undefined' || window.phantomjsHtmlReady){
          return true;
        } else {
          return false;
        }
      });

      if(ready){
        system.stdout.write(page.content);
        phantom.exit();
      } else {
        // delay the loop a bit...
        setTimeout(getHtml, 100);
      }
    };

    getHtml();
  }
});