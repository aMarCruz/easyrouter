// @ts-check
/// <reference types="karma" />
'use strict'

const expect = './node_modules/expect/umd/expect.min.js'
const router = './dist/easyrouter.umd.js'

/*
  For headless chrome info see:
  https://developers.google.com/web/updates/2017/06/headless-karma-mocha-chai
*/
//const { excludeFromBrowser } = require('./utils')

/**
 * @param {import('karma').Config} config
 */
module.exports = function (config) {
  config.set({

    basePath: '..',

    frameworks: ['mocha'],

    files: [
      { pattern: expect, included: true, served: true, watched: false },
      { pattern: router, included: true, served: true, watched: false },
      'test/*.js',
    ],

    exclude: [
      'test/index.js',
      'test/browser.js',
    ],

    client: {
      // @ts-ignore
      mocha: {
        timeout: 999999,
      },
    },

    preprocessors: {},

    reporters: ['progress'],

    browsers: ['Firefox', 'Chrome'], //ChromeHeadless

    port: 9876,
    colors: true,
    autoWatch: true,
    singleRun: false,
    browserDisconnectTimeout: 20000,
    browserNoActivityTimeout: 30000,
  })
}
