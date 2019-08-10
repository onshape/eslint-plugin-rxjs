/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/eslint-plugin-rxjs
 */

import { Rule } from "eslint";
import * as es from "estree";
import { getTypeCheckerAndNodeMap } from "../utils";
import { couldBeType } from "tsutils-etc";

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
    const { nodeMap, typeChecker } = getTypeCheckerAndNodeMap(context);

    function report(node: es.FunctionExpression | es.ArrowFunctionExpression) {
      const parentNode = (node as any).parent as es.CallExpression;
      const callee = parentNode.callee as es.MemberExpression;
      const identifier = nodeMap.get(callee.object);
      const identifierType = typeChecker.getTypeAtLocation(identifier);

      if (couldBeType(identifierType, "Observable")) {
        // only report the `async` keyword
        const asyncLoc = {
          start: node.loc.start,
          end: {
            line: node.loc.start.line,
            column: node.loc.start.column + 4
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