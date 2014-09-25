module.exports = function(config) {
  config.set({
 
    // base path, that will be used to resolve files and exclude
    basePath: '',
 
    // frameworks to use
    frameworks: ['jasmine'],
 
    // list of files / patterns to load in the browser
    files: [
      './spec/**/*.js',
      './build/vendor.js',
      './build/scripts.js'
    ],
 
    // list of files to exclude
    exclude: [
    ],
 
    // test results reporter to use
    reporters: ['progress'],
 
    // web server port
    port: 9876,
 
    // enable / disable colors in the output (reporters and logs)
    colors: true,
 
    // level of logging
    logLevel: config.LOG_INFO,
 
    // Start these browsers
    browsers: ['NodeWebkit'],
 
    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000
  });
};