/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2014-2017 Mickael Jeanroy <mickael.jeanroy@gmail.com>
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

import {isArray} from '../util/is-array.js';

/**
 * Check that the tested object is an array (a real array, not an array-like object).
 * This matcher will use `Array.isArray` or a fallback if it is not available.
 *
 * @message Expect [actual] (not) to be an array
 * @example
 *   expect([]).toBeAnArray();
 *   expect('123').not.toBeAnArray();
 *   expect(1).not.toBeAnArray();
 *   expect(false).not.toBeAnArray();
 *   expect({}).not.toBeAnArray();
 *   expect(null).not.toBeAnArray();
 *   expect(undefined).not.toBeAnArray();
 *
 * @param {Object} ctx Test context.
 * @return {Object} Test result.
 * @since 0.1.0
 */
export function toBeAnArray(ctx) {
  const actual = ctx.actual;
  return {
    pass: isArray(actual),
    message: `Expect ${jasmine.pp(actual)} {{not}} to be an array`,
  };
}
