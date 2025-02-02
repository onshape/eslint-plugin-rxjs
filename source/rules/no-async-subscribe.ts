/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/eslint-plugin-rxjs
 */

import { Rule } from "eslint";
import * as es from "estree";
import { getParent, typecheck } from "../utils";

const rule: Rule.RuleModule = {
  meta: {
    docs: {
      category: "RxJS",
      description: "Disallows passing async functions to subscribe.",
      recommended: true
    },
    fixable: null,
    messages: {
      forbidden: "Passing async functions to subscribe is forbidden."
    },
    schema: []
  },
  create: context => {
    const { couldBeObservable } = typecheck(context);

    function report(node: es.FunctionExpression | es.ArrowFunctionExpression) {
      const parentNode = getParent(node) as es.CallExpression;
      const callee = parentNode.callee as es.MemberExpression;

      if (couldBeObservable(callee.object)) {
        const { loc } = node;
        // only report the `async` keyword
        const asyncLoc = {
          ...loc,
          end: {
            ...loc.start,
            column: loc.start.column + 4
          }
        };

        context.report({
          messageId: "forbidden",
          loc: asyncLoc
        });
      }
    }
    return {
      "ExpressionStatement > CallExpression:has(MemberExpression[property.name='subscribe']) > FunctionExpression[async=true]": report,
      "ExpressionStatement > CallExpression:has(MemberExpression[property.name='subscribe']) > ArrowFunctionExpression[async=true]": report
    };
  }
};

export = rule;
