/**
 * ver 1.0: added by Alan Yang 2016/05/17
 *      add 'grunt dev' task for run the server only without watching file changes for build or testing
  */


module.exports = function (grunt) {

    var modRewrite = require('connect-modrewrite');
    var serveStatic = require('serve-static');

    require('time-grunt')(grunt);

    //project configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        //watch
        watch: {
            all: {
                files: ['src/**'],
                options: {
                    livereload: true
                }
            },
            gruntfile: {
                files: 'Gruntfile.js',
                tasks: ['jshint:gruntfile']
            },
            jsfile: {
                files: ['src/**/*.js', 'test/**/*.js'],
                tasks: ['jshint', 'jasmine']
            }

        },  //watch end

        //web server
        connect: {
            options: {
                // base: ['.', './src'],
                directory: null,
                hostname: '*',
                port: 9090
            },
            devServer: {
                options: {
                    base: ['.', './src'],
                    livereload: true,
                    open: "http://localhost:9090/",
                    middleware: function (connect, options, middlewares) {
                        var proxy = require("grunt-connect-proxy/lib/utils").proxyRequest;
                        var rewriteModule = require('connect-modrewrite');
                        var rewrite = rewriteModule([
                            '^/$ /tamaleng [R]',
                            '^/tamaleng(.*) /$1',
                            '^[^\\.]*$ /index.html [L]'
                        ]);
                        return [proxy, rewrite].concat(middlewares);
                    }
                },
                proxies: [
                    {
                        context: '/restapi/2.0',
                        host: '127.0.0.1',
                        https: true,
                        port: '443',
                        secure: false
                    }
                ]
            },
            prodServer: {
                options: {
                    base: ['./dist/src'],
                    livereload: false,
                    keepalive: true,
                    open: "http://localhost:9090/",
                    middleware: function (connect, options, middlewares) {
                        var proxy = require("grunt-connect-proxy/lib/utils").proxyRequest;
                        var rewriteModule = require('connect-modrewrite');
                        var rewrite = rewriteModule([
                            '^/$ /tamaleng [R]',
                            '^/tamaleng(.*) /$1',
                            '^[^\\.]*$ /index.html [L]'
                        ]);
                        return [proxy, rewrite].concat(middlewares);
                    }
                },
                proxies: [
                    {
                        context: '/restapi/2.0',
                        host: '127.0.0.1',
                        https: true,
                        port: '443',
                        secure: false
                    }
                ]
            }
        },
        //connect end

        jasmine: {
            options: {
                keepRunner: true,
                specs: [
                    'test/**/*_spec.js'
                ],
                junit: {
                    path: 'test-reports'
                },
                template: require('grunt-template-jasmine-requirejs'),
                templateOptions: {
                    requireConfigFile: './src/main.js',
                    requireConfig: {
                        baseUrl: './src',
                        paths: {
                        },
                        shim: {
                        }
                    }
                }
            },
            app: {
            }
        },//jasmine end

        htmlmin: {
            dist: {
                options: {
                    collapseWhitespace: true,
                    conservativeCollapse: true,
                    collapseBooleanAttributes: false,
                    removeCommentsFromCDATA: true,
                    removeComments: true,
                    removeEmptyAttributes: true
                },
                files: [{
                    expand: true,
                    cwd: 'src',
                    src: ['**/*.html'],
                    dest: 'dist/src'
                }]
            }
        },//htmlmin end        

        jshint: {
            options: {
                jshintrc: '.jshintrc',
                browser: true,            // browser environment
                devel: true,
                ignores: ['bower_components', 'vendor']
            },
            gruntfile: 'Gruntfile.js',
            src: 'src/**/*.js',
            test: 'test/**/*.js'
        },

        requirejs: {
            compile: {
                options: {
                    baseUrl: 'src',
                    dir: 'dist/src',
                    modules: [{
                        name: 'main',
                    }],
                    removeCombined: true,
                    mainConfigFile: 'src/main.js',
                    preserveLicenseComments: false,
                    optimizeCss: 'standard'
                }
            }

        },//requirejs end

        copy: {
            bower: {
                files: [{
                    expand: true,
                    cwd: 'bower_components/',
                    src: ['requirejs/require.js'
                    ],
                    dest: 'dist/src/bower_components/'
                }]
            },
            vendor: {
                files: [{
                    expand: true,
                    cwd: 'vendor/',
                    src: [
                    ],
                    dest: 'dist/src/vendor/'
                }]
            }
        },

        clean: {
            dist: ['dist/**']
        },//clean end

        removeLoggingCalls: {
            files: ['src/**/*.js', '!bower_components/**/*.js', '!vendor/**/*.js'],
            options: {
                // an array of method names to remove 
                methods: ['log', 'info', 'debug'],
                // replacement strategy 
                strategy: function (consoleStatement) {
                    // return '/* ' + consoleStatement + '*/';
                    return '';
                },
                // when the logging statement is ended by a semicolon ';' 
                // include it in the 'consoleStatement' given to the strategy 
                removeSemicolonIfPossible: false
            }
        },

        concurrent: {
            options: {
                logConcurrentOutput: true
            },
            dev: {
                tasks: [['dev_prod_switch:dev', 'configureProxies:devServer', 'connect:devServer', 'watch:all'], [ 'jshint', 'jasmine', 'watch:jsfile']]
            }
        },

        dev_prod_switch: {
            options: {
                // Can be ran as `grunt --env=dev` or ``grunt --env=prod`` 
                environment: grunt.option('env') || 'dev', // 'prod' or 'dev' 
                env_char: '#',
                env_block_dev: 'env:dev',
                env_block_prod: 'env:prod',
                env_block_test: 'env:test'
            },
            dev: {
                files: {
                    'src/index.html': 'src/index.html',
                    'src/main.css': 'src/main.css',
                    'src/app.js': 'src/app.js'
                }
            },
            prod: {
                options: {
                    environment: 'prod'
                },
                files: {
                    'src/index.html': 'src/index.html',
                    'src/main.css': 'src/main.css',
                    'src/app.js': 'src/app.js'
                }
            },
            test: {
                options: {
                    environment: 'test'
                },
                files: {
                    'src/index.html': 'src/index.html',
                    'src/services/rest/baseRestService.js':'src/services/rest/baseRestService.js',
                    'src/views/login/login.html': 'src/views/login/login.html',
                    'src/views/login/login.js': 'src/views/login/login.js'
                }
            }
        }


    });

    grunt.loadNpmTasks('grunt-remove-logging-calls');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-connect-proxy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-dev-prod-switch');
    grunt.loadNpmTasks('grunt-bower');

    grunt.registerTask('default', ['concurrent:dev']);

    grunt.registerTask('build', ['clean', 'jshint', 'jasmine', 'dev_prod_switch:prod', 'removeLoggingCalls', 'requirejs', 'copy', 'htmlmin']);

    grunt.registerTask('prod', ['configureProxies:prodServer', 'connect:prodServer']);

    grunt.registerTask('perftest', ['clean', 'jshint', 'jasmine', 'dev_prod_switch:prod', 'dev_prod_switch:test', 'removeLoggingCalls', 'requirejs', 'copy', 'htmlmin']);
};