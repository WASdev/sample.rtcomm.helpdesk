// Generated on 2014-10-30 using generator-angular 0.9.8
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {
  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);
  var appConfig = {
    app:  'app',
    dist: 'dist'
  };
  // Define the configuration for all the tasks
  grunt.initConfig({
    appConfig: appConfig,
    war: {
      target: {
        options: {
          war_dist_folder: '<%= appConfig.dist %>',
          war_verbose: true,
          war_name: 'HelpDeskSample',
          webxml_welcome: 'index.html',
          webxml_display_name: 'HelpDeskSample',
          webxml_mime_mapping: [ 
      { 
          extension: 'woff', 
            mime_type: 'application/font-woff' 
      } ]
        },
        files: [
          {
            expand: true,
            cwd: '<%= appConfig.app %>',
            src: ['**'],
            dest: ''
          }
        ]
      }
    }
  });

  grunt.registerTask('grunt-war');
  grunt.registerTask('default', [
    'war'
  ]);
};
