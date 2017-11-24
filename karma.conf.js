var path = require('path');
var uuid = require('uuid');


module.exports = function(config) {
    var phantomStoragePath = path.resolve('.phantomjs/' + uuid.v4());

    config.set({
        basePath: './',
        frameworks: ['jasmine'],

        files: [
            'node_modules/babel-polyfill/dist/polyfill.js',
            'node_modules/jasmine-promises/dist/jasmine-promises.js',

            'tests/init.js',

            {pattern: 'tests/*_tests.js', watched: false},
            {pattern: 'tests/**/*_tests.js', watched: false}
        ],

        preprocessors: {
            'tests/*_tests.js': ['webpack', 'sourcemap'],
            'tests/**/*_tests.js': ['webpack', 'sourcemap']
        },

        reporters: [
            'progress',

            'coverage',
            'html'
        ],

        coverageReporter: {
            dir: 'build/coverage',

            reporters: [
                { type: 'html', subdir: '.' },
                { type: 'lcovonly', subdir: '.' },
            ]
        },

        htmlReporter: {
            outputDir: 'build/test',

            focusOnFailures: true,
            preserveDescribeNesting: true,
        },

        customLaunchers: {
            'PhantomJS_D2': {
                base: 'PhantomJS',

                flags: [
                    '--local-storage-path=' + phantomStoragePath,
                    '--local-storage-quota=32768',

                    '--offline-storage-path=' + phantomStoragePath,
                    '--offline-storage-quota=32768'
                ],

                options: {
                    settings: {
                        webSecurityEnabled: false
                    }
                }
            }
        },

        webpack: {
            devtool: 'inline-source-map',

            module: {
                rules: [
                    {
                        test: /\.js$/,
                        include: path.resolve('src/'),

                        use: {
                            loader: 'babel-loader',
                            options: {
                                plugins: [
                                    "istanbul",
                                    "transform-class-properties",
                                    "transform-object-rest-spread"
                                ],
                                presets: ['es2015', 'react']
                            }
                        }
                    },
                    {
                        test: /\.js$/,
                        include: path.resolve('tests/'),

                        use: {
                            loader: 'babel-loader',
                            options: {
                                plugins: [
                                    "transform-class-properties",
                                    "transform-object-rest-spread"
                                ],
                                presets: ['es2015', 'react']
                            }
                        }
                    }
                ]
            },

            resolve: {
                alias: {
                    'neon-extension-framework': path.resolve(__dirname, 'src/')
                }
            }
        },

        webpackMiddleware: {
            stats: 'errors-only'
        }
    });
};
