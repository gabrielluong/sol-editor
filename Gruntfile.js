var fs = require('vinyl-fs'),
    sass = require('gulp-sass'),
    less = require('gulp-less'),
    html2Js = require('gulp-ng-html2js'),
    streamqueue = require('streamqueue'),
    concat = require('gulp-concat')
    minifyHtml = require('gulp-minify-html'),
    uglify = require('gulp-uglify'),
    jshint = require('gulp-jshint'),
    merge = require('merge-stream'),
    cssmin = require('gulp-cssmin'),
    child = require('child_process'),
    todo = require('gulp-todo'),
    jsdoc = require('gulp-jsdoc');

var config = require('./config/sources');
var childProcesses = {};
var reload;

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    nodewebkit: {
      options: {
        app_name: 'Sol',
        build_dir: './dist',
        mac: true,
        win: false
      },
      src: ['./.tmp_build/**/*']
    },

    groc: {
      javascript: [
        './app/**/*.js'
      ],
      options: {
        'out': 'doc/'
      }
    },

    watch: {
      packages: {
        files: ['./packages/**/*'],
        tasks: ['copy:packages'],
        options: {
          livereload: true,
        }
      },
      scripts: {
        files: ['./app/**/*.js'],
        tasks: ['build:scripts'],
        options: {
          livereload: true,
        }
      },
      templates: {
        files: ['./app/**/*.tpl.html'],
        tasks: ['build:templates'],
        options: {
          livereload: true,
        }
      },
      styles: {
        files: ['./app/**/*.sass', './app/**/*.scss', './app/**/*.less'],
        tasks: ['build:styles'],
        options: {
          livereload: true,
        }
      },
      nodewebkit: {
        files: ['./app/index.html', './app/package.json'],
        tasks: ['copy:nodewebkit'],
        options: {
          livereload: true,
        }
      },
      vendor: {
        files: ['./config/sources.js'],
        tasks: ['build:vendor'],
        options: {
          livereload: true,
        }
      },
      assets: {
        files: ['./app/assets/**/*'],
        tasks: ['copy:assets'],
        options: {
          livereload: true,
        }
      },
      // karma: {
      //   files: ['app/**/*.js', 'spec/**/*.js'],
      //   tasks: ['karma:dev:run'] //NOTE the :run flag
      // }
    },

    copy: {
      nodewebkit: {
        src: ['index.html', 'package.json'],
        dest: './build',
        cwd: './app/',
        expand: true
      },
      node_modules: {
        src: config.node_modules,
        dest: './build/'
      },
      packages: {
        src: ['./packages/**/*'],
        dest: './build/'
      },
      assets: {
        src: ['./**/*'],
        dest: './build/',
        cwd: './app/assets',
        expand: true
      },
      defaults: {
        src: ['./defaults/**/*'],
        dest: './build/',
        cwd: './app',
        expand: true
      }
    },

    clean: ['./build/**/*'],

    karma: {
      options: {
        configFile: 'karma.conf.js'
      },
      dev: {
        background: true
      },
      continuous: {
        singleRun: true
      }
    }
  });

  grunt.loadNpmTasks('grunt-node-webkit-builder');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-groc');

  grunt.registerTask('reload', function () {
    reload.write('reload');
  });

  grunt.registerTask('docs', function () {
    grunt.task.run('groc');
  });

  grunt.registerTask('build', function () {
    if (grunt.option('target') === 'prod') {
      grunt.task.run('clean');
    }

    grunt.task.run('copy');

    grunt.task.run('build:vendor');
    grunt.task.run('build:styles');
    grunt.task.run('build:scripts');
    grunt.task.run('build:templates');


    if (grunt.option('target') !== 'prod') {
      // grunt.task.run('karma:dev');
      grunt.task.run('watch');

      require('net').createServer(function(socket) {
        reload = socket;
      }).listen(9292);
    } else {
      grunt.task.run('karma:continuous');
      grunt.task.run('nodewebkit');
    }
  });

  /*********************************************************
  *** TODO
  *********************************************************/

  grunt.registerTask('todo', function () {
    var task = fs.src('./app/**/*.js')
      .pipe(todo())
      .pipe(fs.dest('.'))
      .on('end', this.async());
  });

  /*********************************************************
  *** SASS -> CSS
  *********************************************************/

  grunt.registerTask('build:styles', function () {
    var sass_css = fs.src(['./app/**/*.sass', './app/**/*.scss'])
      .pipe(sass())
      .pipe(concat('sass.css'));

    var less_css = fs.src('./app/**/*.less')
      .pipe(less())
      .pipe(concat('less.css'));

    var task = merge(sass_css, less_css)
      .pipe(concat('styles.css'));

    if (grunt.option('target') === 'prod') {
      task.pipe(cssmin());
    }

    task.pipe(fs.dest('./build'))
    .on('end', this.async());
  });

  /*********************************************************
  *** JAVASCRIPT:USER
  *********************************************************/

  grunt.registerTask('build:scripts', function () {
    var task = fs.src('./app/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(concat('scripts.js'));

    if (grunt.option('target') === 'prod') {
      task.pipe(uglify());
    }

    task.pipe(fs.dest('./build'))
      .on('end', this.async());
  });

  /*********************************************************
  *** VENDOR
  *********************************************************/

  grunt.registerTask('build:vendor', function () {
    grunt.task.run('copy:node_modules');

    var styles = fs.src(config.css.vendor)
        .pipe(concat('main.css'));

    var less_css = fs.src(config.less.vendor)
        .pipe(less())
        .pipe(concat('less.css'));

    var less_and_css = merge(styles, less_css)
        .pipe(concat('vendor.css'))

    var scripts = fs.src(config.scripts.vendor)
        .pipe(concat('vendor.js'));

    merge(less_and_css, scripts)
      .pipe(fs.dest('./build'))
      .on('end', this.async());
  });

  /*********************************************************
  *** TEMPLATES
  *********************************************************/

  grunt.registerTask('build:templates', function () {
    var task = fs.src('./app/**/*.tpl.html')
        .pipe(minifyHtml({
          empty: true,
          spare: true,
          quotes: true
        }))
        .pipe(html2Js({
          moduleName: 'templates',
          prefix: '/'
        }))
        .pipe(concat('templates.js'));

    if (grunt.option('target') === 'prod') {
      task.pipe(uglify());
    }

    task.pipe(fs.dest('./build'))
      .on('end', this.async());
  });
};
