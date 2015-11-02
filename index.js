var path = require('path');
var url = require('url');
var childProcess = require('child_process');
var phantomjs = require('phantomjs');

var phantomjsHtml = module.exports = {
  crawlerUserAgents: [
    'googlebot',
    'yahoo',
    'bingbot',
    'baiduspider',
    'facebookexternalhit',
    'twitterbot',
    'rogerbot',
    'linkedinbot',
    'embedly',
    'quora link preview',
    'showyoubot',
    'outbrain',
    'pinterest',
    'developers.google.com/+/web/snippet',
    'slackbot',
    'vkShare',
    'W3C_Validator',
    'redditbot',
    'Applebot'
  ],


  staticFilesExtensions: [
    '.js',
    '.css',
    '.xml',
    '.less',
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.pdf',
    '.doc',
    '.txt',
    '.ico',
    '.rss',
    '.zip',
    '.mp3',
    '.rar',
    '.exe',
    '.wmv',
    '.doc',
    '.avi',
    '.ppt',
    '.mpg',
    '.mpeg',
    '.tif',
    '.wav',
    '.mov',
    '.psd',
    '.ai',
    '.xls',
    '.mp4',
    '.m4a',
    '.swf',
    '.dat',
    '.dmg',
    '.iso',
    '.flv',
    '.m4v',
    '.torrent',
    '.woff',
    '.ttf'
  ],

  middleware: {
    /**
     *  Middleware used to output HTML rendering of the page when needed
     */
    SEO: function(req, res, next){
      if(phantomjsHtml.needHtmlOutput(req)) {
        var requestURL = req.protocol + '://' + req.get('host') + req.originalUrl;

        // @todo: there is probably a better way to do this...
        requestURL = requestURL.replace('?_escaped_fragment_=','');
        
        phantomjsHtml.getHTML(requestURL, function(err, output){
          if(err){
            console.log('ERROR', err);
            next();
          } else {
            // remove script tags to prevent JS to be executed (because it has already been executed)
            output = output.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,'');

            res.send(output);
          }
        })
      } else {
        next();
      }
    }
  },

  /**
   *  Check if the user agent is from a bot
   */
  isBot: function(req){
    if(req.headers['x-bufferbot']){
      return true;
    }

    var userAgent = req.headers['user-agent'];
    if(!userAgent){
      return null;
    }

    return phantomjsHtml.crawlerUserAgents.some(function(crawlerUserAgent)
      {
        return userAgent.toLowerCase().indexOf(crawlerUserAgent.toLowerCase()) !== -1;
      });
  },

  /**
   *  Check if the user agent is from a phantomJS instance
   */
  isPhantomJs: function(req){
    var userAgent = req.get('User-Agent');
    return userAgent && userAgent.search('PhantomJS') != -1 ? true : false;
  },

  /**
   *  Check if the request is for a static file
   */
  isStaticFile: function(req){
    return phantomjsHtml.staticFilesExtensions.some(function(extension)
      {
        return req.url.indexOf(extension) !== -1;
      });
  },

  /**
   *  Check if the current request need to be outputed as prerendered HTML
   */
  needHtmlOutput: function(req){
    // render only GET requests
    if(req.method != 'GET'){
      return false;
    }

    // ommit static files
    if(phantomjsHtml.isStaticFile(req)) {
      return false;
    }

    // check _escaped_fragment_
    var parsedQuery = url.parse(req.url, true).query;
    if(parsedQuery && parsedQuery.hasOwnProperty('_escaped_fragment_')){
      return true;
    }

    // check if bot
    if(phantomjsHtml.isBot(req)){
      return true;
    }

    return false;
  },

  /**
   *  Get the HTML output of the given URL
   */
  getHTML: function(URL, callback){
    var childArgs = [
      path.join(__dirname, 'script.js'), URL
    ];
     
    childProcess.execFile(phantomjs.path, childArgs, function(err, stdout, stderr) {
      if(stderr) {
        callback(stderr, null);
      } else {        
        callback(null, stdout);
      }
    });
  }
}