/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/eslint-plugin-rxjs
 */

import { Rule } from "eslint";
import * as es from "estree";
import { isCallExpression, isIdentifier } from "../utils";

const rule: Rule.RuleModule = {
  meta: {
    docs: {
      category: "RxJS",
      description: "Forbids the application of operators after `takeUntil`.",
      recommended: true
    },
    fixable: null,
    messages: {
      forbidden: "Applying operators after takeUntil is forbidden."
    },
    schema: [
      {
        properties: {
          allow: { type: "array", items: { type: "string" } }
        },
        type: "object"
      }
    ]
  },
  create: context => {
    const [config] = context.options;
    const {
      allow = [
        "count",
        "defaultIfEmpty",
        "endWith",
        "every",
        "finalize",
        "finally",
        "isEmpty",
        "last",
        "max",
        "min",
        "publish",
        "publishBehavior",
        "publishLast",
        "publishReplay",
        "reduce",
        "share",
        "shareReplay",
        "skipLast",
        "takeLast",
        "throwIfEmpty",
        "toArray"
      ]
    } = config || {};
    return {
      "CallExpression[callee.property.name='pipe']": (
        node: es.CallExpression
      ) => {
        node.arguments.forEach((arg, index) => {
          if (
            isCallExpression(arg) &&
            isIdentifier(arg.callee) &&
            arg.callee.name === "takeUntil"
          ) {
            const after = node.arguments.slice(index + 1);
            if (
              after.some((arg: es.Expression) => {
                if (
                  isCallExpression(arg) &&
                  isIdentifier(arg.callee) &&
                  allow.indexOf(arg.callee.name) !== -1
                ) {
                  return false;
                }
                return true;
              })
            ) {
              context.report({
                messageId: "forbidden",
                node: arg.callee
              });
            }
          }
        });
      }
    };
  }
};

export = rule;
