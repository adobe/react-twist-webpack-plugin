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

// We allow inclusionary properties. But exclusionary properties (like `exclude` and `not`)
// pose a problem: they could inadvertently affect settings at a higher level. For instance,
// `{ exclude: { exclude: 'foo' } }` is actually equivalent to `{ include: 'foo' }`.
// Since we add an `exclude` rule in ReactWebpackPlugin to ensure libraries' configurations
// properly override users' main ones for library files, we must be a little careful here.
// So to keep things simple, we only allow inclusionary properties. This should handle the
// vast majority of cases, e.g. matching files with a certain extension in a certain directory.
const ALLOWED_PROPERTIES = [ 'test', 'include', 'and', 'or' ];
const PROHIBITIED_PROPERTIES = [ 'exclude' , 'not' ];

/**
 * Create a Webpack Condition from a Webpack Rule by stripping out any nested Rule properties,
 * keeping only the conditions in which the rule would be applied. In other words, the return
 * value of this function could be passed to `exclude` on another rule, to exclude only the
 * files matched by the input rule.
 *
 * @param {Rule} rule
 * @return {Condition}
 */
function convertRuleToCondition(rule) {
    if (!rule || typeof rule !== 'object' || !Object.keys(rule).length) {
        return rule;
    }
    if (Array.isArray(rule)) {
        return rule.map(convertRuleToCondition);
    }
    const condition = {};
    // We allow certain properties...
    ALLOWED_PROPERTIES.forEach((prop) => {
        if (rule[prop]) {
            condition[prop] = convertRuleToCondition(rule[prop]);
        }
    });
    // We prohibit certain properties...
    PROHIBITIED_PROPERTIES.forEach((prop) => {
        if (rule[prop]) {
            throw new Error(`Webpack rules added in a Twist library cannot contain the property "${prop}". `
                + `Try to reformulate your rule with ${ALLOWED_PROPERTIES.join('/')}.`);
        }
    });
    // And the rest we ignore, because they're needed for a Rule but not a Condition.
    return condition;
}

module.exports = convertRuleToCondition;
