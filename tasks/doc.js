/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2014,205,2016 Mickael Jeanroy <mickael.jeanroy@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const Q = require('q');
const touch = require('touch');
const gulp = require('gulp');
const gutil = require('gulp-util');
const dox = require('dox');
const Handlebars = require('handlebars');
const options = require('../conf.js');
const matchers = path.join(options.src, 'core', 'matchers');

gulp.task('docs', (done) => {
  listFiles(matchers)
    // Read JSDoc
    .then((files) => {
      return Q.all(_(files)
        .reject((file) => file === 'index.js')
        .map((file) => path.join(matchers, file))
        .map((file) => readFile(file).then((content) => {
          const jsdoc = dox.parseComments(content, {raw: true});
          const api = keepFunctions(jsdoc);
          return parseComments(api);
        }))
        .value()
      );
    })

    // Generate Markdown
    .then((comments) => {
      return readFile(path.join(options.root, '.readme'))
        .then((template) => Handlebars.compile(template))
        .then((templateFn) => {
          return templateFn({
            matchers: _.map(comments, (comment) => comment[0]),
          });
        });
    })

    // Write Markdown
    .then((result) => {
      return writeFile(path.join(options.root, 'README.md'), result);
    })

    .catch((err) => {
      gutil.log(gutil.colors.red(`Error occured while generating documentation: ${err}`));
    })

    .finally(() => {
      done();
    });
});

/**
 * List all files in a directory asynchronously.
 * This function returns a promise resolved with the list of files in the
 * directory or rejected with the error.
 *
 * @param {string} dir The directory.
 * @returns {Promise} The promise.
 */
function listFiles(dir) {
  const deferred = Q.defer();

  fs.readdir(dir, (err, files) => {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(files);
    }
  });

  return deferred.promise;
}

/**
 * Read a file asynchronously.
 * This function returns a promise resolved with the file content or rejected with
 * the error.
 *
 * @param {string} file The full path.
 * @return {Promise} The promise.
 */
function readFile(file) {
  const deferred = Q.defer();

  gutil.log(gutil.colors.grey(`Reading: ${file}`));

  fs.readFile(file, 'utf-8', (err, data) => {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(data);
    }
  });

  return deferred.promise;
}

/**
 * Write a file asynchronously.
 * This function returns a promise resolved when the file is successfully written
 * or rejected with the error.
 *
 * @param {string} file The full path.
 * @param {string} content File content.
 * @return {Promise} The promise.
 */
function writeFile(file, content) {
  const deferred = Q.defer();

  gutil.log(gutil.colors.grey(`Writing: ${file}`));

  touch(file, (err) => {
    if (err) {
      deferred.reject(err);
    } else {
      fs.writeFile(file, content, 'utf-8', (err, data) => {
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve();
        }
      });
    }
  });

  return deferred.promise;
}

/**
 * Filter a list of comments object to keep only functions.
 *
 * @param {Array<Object>} comments List of comments.
 * @returns {Array<Object>} The array containing only jsdoc of functions.
 */
function keepFunctions(comments) {
  return _.filter(comments, (comment) => !!comment.ctx && comment.ctx.type === 'function');
}

/**
 * Trim all lines in a block of text.
 *
 * @param {string} txt Block of text.
 * @return {string} The same text with all lines trimmed.
 */
function trimAll(txt) {
  const lines = txt.split('\n');
  const trimmedLines = _.map(lines, _.trim);
  return trimmedLines.join('\n');
}

/**
 * Parse a comments block object to keep only interesting information to use
 * in the documentation template.
 *
 * @param {Array<Object>} comments Comments.
 * @returns {Array<Object>} The new comments.
 */
function parseComments(comments) {
  return _.map(comments, (comment) => {
    const tags = _.groupBy(comment.tags, 'type');
    return {
      name: comment.ctx.name,
      description: _.trim(comment.description.full),
      code: comment.code,

      since: _(tags.since)
        .map('string')
        .map(trimAll)
        .value()[0],

      messages: _(tags.message)
        .map('string')
        .map(trimAll)
        .value(),

      examples: _(tags.example)
        .map('string')
        .map(trimAll)
        .value(),

      params: _(tags.param)
        .slice(1)
        .map((param) => _.assign(param, {types: _.isEmpty(param.types) ? ['*'] : param.types}))
        .value(),
    };
  });
}