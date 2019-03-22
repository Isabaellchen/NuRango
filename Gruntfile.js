module.exports = function(grunt) {

  const arango_host = 'localhost';
  const arango_port = '8529';
  const arango_user = 'root';
  const arango_pass = '';

  const app_identifier = 'myNuxtApp';



  const path = require('path');

  // Default logdir for the logs created by nginx, has to be writeable 
  const log_dir = path.resolve(__dirname, 'nginx/logs');

  //Declaring all available tasks
  grunt.initConfig({ 
    // The regular webpack building for vuejs
    run: {
      build: {
        cmd: 'npm',
        args: [
          'run',
          'generate'
        ]
      }
    },
    // Create a zip file for Arango-Foxx deployment
    compress: {
      package: {
        options: {
          archive: './deploy/foxx-service.zip',
          mode: 'zip'
        },
        files: [
          { cwd: 'dist/', src: ['**'], dest: 'files/', expand: true },
          { cwd: 'foxx/', src: ['**'], dest: '/', expand: true }
        ]
      }
    },
    // Access the Arango-Foxx management API https://docs.arangodb.com/devel/HTTP/Foxx/Management.html
    http: {
      install: {
        options: {
          url: 'http://' + arango_host + ':' + arango_port + '/_api/foxx' + '?mount=/' + app_identifier,
          method: 'POST',
          auth: {
            user: arango_user,
            pass: arango_pass
          },
          headers: {
            'Content-Type': 'application/zip'
          },
          body: function () {
            return grunt.file.read(path.join(__dirname, 'deploy', 'foxx-service.zip'), {encoding: null});
          }
        }
      },
      replace: {
        options: {
          url: 'http://' + arango_host + ':' + arango_port + '/_api/foxx/service' + '?mount=/' + app_identifier,
          method: 'PUT',
          auth: {
            user: arango_user,
            pass: arango_pass
          },
          headers: {
            'Content-Type': 'application/zip'
          },
          body: function () {
            return grunt.file.read(path.join(__dirname, 'deploy', 'foxx-service.zip'), {encoding: null});
          }
        }
      },
      upgrade: {
        options: {
          url: 'http://' + arango_host + ':' + arango_port + '/_api/foxx/service' + '?mount=/' + app_identifier,
          method: 'PATCH',
          auth: {
            user: arango_user,
            pass: arango_pass
          },
          headers: {
            'Content-Type': 'application/zip'
          },
          body: function () {
            return grunt.file.read(path.join(__dirname, 'deploy', 'foxx-service.zip'), {encoding: null});
          }
        }
      }
    },
    // Initialise the logfiles needed for nginx
    touch: [
      log_dir + '/error.log',
      log_dir + '/access.log'
    ],
    // Replace configurable variables
    'string-replace': {
      dist: {
        files: {
          'deploy/nginx.conf': 'nginx/conf.template',
        },
        options: {
          replacements: [{
            pattern: 'app_identifier',
            replacement: app_identifier
          },{
            pattern: /log_dir/g,
            replacement: log_dir
          }]
        }
      }
    },
    // Configure the nginx task
    nginx: {
      options: {
        config: path.join(__dirname, 'deploy', 'nginx.conf'),
        globals: ['error_log ' + log_dir + '/error.log warn;']
      }
    }
  });

  // Lets import all modules in package.json that begin with 'grunt-' so we dont have to call them one by one
  Object.keys(require('./package.json').devDependencies).forEach(function(dep) {
    if(dep.substring(0,6) == "grunt-") {
      grunt.loadNpmTasks(dep);
    }
  });

  grunt.registerTask('build', ["run", "compress"]);

  grunt.registerTask('foxx-install', ["build", "http:install"]);
  grunt.registerTask('foxx-replace', ["build", "http:replace"]);
  grunt.registerTask('foxx-upgrade', ["build", "http:upgrade"]);

  grunt.registerTask('start-server', ["touch", "string-replace", "nginx:start"]);
  grunt.registerTask('stop-server', ["nginx:stop"]);







};