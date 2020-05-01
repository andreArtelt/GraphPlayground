'use strict';

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    processhtml: {
      options: {
      },
      default: {
        files: {
          'dist/index.htm': ['index.htm']
        } 
      }
    },
    concat: {
      default: {
        src: [
          'ThirdPartyComponents/**/*.js',
          'Algorithms/**/*.js',
          'UI/**/*.js',
          'Utils/**/*.js'
        ],
        dest: 'dist/app.js'
      }
    },
    javascript_obfuscator: {
      options: {
        compact: true,
        controlFlowFlattening: false,
        controlFlowFlatteningThreshold: 0.75,
        deadCodeInjection: false,
        deadCodeInjectionThreshold: 0.4,
        debugProtection: false,
        debugProtectionInterval: false,
        disableConsoleOutput: false,
        domainLock: [],
        identifierNamesGenerator: 'hexadecimal',
        identifiersPrefix: '',
        log: false,
        renameGlobals: true,
        reservedNames: [],
        rotateStringArray: true,
        seed: 0,
        selfDefending: false,
        sourceMap: false,
        sourceMapBaseUrl: '',
        sourceMapFileName: '',
        sourceMapMode: 'separate',
        stringArray: true,
        stringArrayEncoding: true,
        stringArrayThreshold: 0.75,
        target: 'browser',
        transformObjectKeys: false,
        unicodeEscapeSequence: false
      },
      default: {
        files: {
          'dist/app.js': [
            'dist/app.js'
          ]
        }
      }
    },
    vulcanize: {
      default: {
        options: {
          abspath: '',
          inlineScripts: true,
          inlineCss: true,
          stripComments: true,
        },
        files: {
          'dist/index.htm': 'dist/index.htm'
        },
      }
    },
    htmlmin: {
      default: {
        options: {
          removeComments: true,
          collapseWhitespace: true,
          minifyCSS: true
        },
        files: {                                   
          'dist/index.htm': 'dist/index.htm'
        }
      }
    },
    copy: {
      default: {
        files: [
          {
            expand: true,
            src: [
              'LICENSE',
              'UI/LanguageRes/**'
            ],
            dest: 'dist/'
          },
          {
            expand: true,
            cwd: 'ThirdPartyComponents/vis.js/img/',
            src: [
              '**'
            ],
            dest: 'dist/img/'
          }
        ]
      }
    },
    clean: {
      default: {
        src: ['dist/app.js']
      }
    }
  });
  
  grunt.loadNpmTasks('grunt-processhtml');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-javascript-obfuscator');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-vulcanize');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask('default', [
    'processhtml',
    'concat',
    //'javascript_obfuscator',
    'vulcanize',
    'htmlmin',
    'copy',
    'clean'
  ]);
};