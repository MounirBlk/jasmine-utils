/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2014-2017 Mickael Jeanroy
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

const path = require('path');
const gulp = require('gulp');
const git = require('gulp-git');
const bump = require('gulp-bump');
const gulpFilter = require('gulp-filter');
const tagVersion = require('gulp-tag-version');
const options = require('../conf.js');

// Release tasks
['minor', 'major', 'patch'].forEach((level) => {
  gulp.task(`release:${level}`, ['build', 'docs'], function() {
    const jsonFilter = gulpFilter('**/*.json', {restore: true});
    const pkgJsonFilter = gulpFilter('**/package.json', {restore: true});
    const bundleFilter = gulpFilter('**/*.js', {restore: true});

    const src = [
      path.join(options.root, 'package.json'),
      path.join(options.root, 'bower.json'),
      path.join(options.root, 'README.md'),
      options.dest,
    ];

    return gulp.src(src)

      // Bump version.
      .pipe(jsonFilter)
      .pipe(bump({type: level}))
      .pipe(gulp.dest(options.root))
      .pipe(jsonFilter.restore)

      // Commit release.
      .pipe(git.add({args: '-f'}))
      .pipe(git.commit('release: release version'))

      // Create tag.
      .pipe(pkgJsonFilter)
      .pipe(tagVersion())
      .pipe(pkgJsonFilter.restore)

      // Remove generated bundle and commit for the next release.
      .pipe(bundleFilter)
      .pipe(git.rm({args: '-r'}))
      .pipe(git.commit('release: prepare next release'));
  });
});

gulp.task('release', ['release:minor']);
