/*
 *  Copyright 2017 Adobe Systems Incorporated. All rights reserved.
 *  This file is licensed to you under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License. You may obtain a copy
 *  of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software distributed under
 *  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 *  OF ANY KIND, either express or implied. See the License for the specific language
 *  governing permissions and limitations under the License.
 *
 */

/* global describe it */

const convertRuleToCondition = require('../src/convertRuleToCondition');
const assert = require('assert');

describe('convertRuleToCondition', () => {

    it('preserves conditional properties and removes rule properties', () => {
        assert.deepEqual(convertRuleToCondition({
            include: [ 'a', 'b' ],
            test: /baz/,
            and: [ 1, 2 ],
            or: [ 3, 4 ],
            rules: [
                { loader: 'foo', test: /bar/ }
            ]
        }), {
            test: /baz/,
            include: [ 'a', 'b' ],
            and: [ 1, 2 ],
            or: [ 3, 4 ]
        });
    });

    it('throws errors on exclude/not properties', () => {
        assert.throws(() => {
            convertRuleToCondition({
                exclude: [ 'c', 'd' ],
            });
        }, /cannot contain the property "exclude"/);
        assert.throws(() => {
            convertRuleToCondition({
                not: [ 'c', 'd' ],
            });
        }, /cannot contain the property "not"/);
    });

    it('preserves nested conditionals', () => {
        let nestedStruct = {
            include: [ 'a', {
                and: [ { or: [ 'b', 'c' ] } ]
            } ]
        };
        assert.deepEqual(convertRuleToCondition(nestedStruct), nestedStruct);
    });

});
