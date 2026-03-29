/**
 * @file Tree-sitter parser for `jj desc` buffers.
 * @author Riley Bruins <ribru17@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const NEWLINE = /\r?\n/;
const ANYTHING = /[^\r\n]+/;

module.exports = grammar({
  name: 'jjdescription',

  extras: ($) => [NEWLINE, $.comment],

  externals: ($) => [$.type, $._change_id, $._diff_summary, $._error_sentinel],

  rules: {
    source: ($) =>
      seq(
        optional($.subject),
        repeat(
          choice(
            $.body_line,
            $.ignore_rest,
            $.generated_comment,
          ),
        ),
      ),

    comment: (_) => token(seq('JJ:', optional(ANYTHING))),

    subject: ($) =>
      prec.right(
        1,
        choice(
          seq($.prefix, optional(ANYTHING)),
          ANYTHING,
        ),
      ),

    prefix: ($) =>
      seq(
        $.type,
        optional(seq('(', $.scope, ')')),
        optional('!'),
        alias(/[:\uff1a]/, ':'),
      ),

    scope: (_) => /[^\r\n()]+/,

    body_line: (_) => ANYTHING,

    ignore_rest: ($) =>
      seq('JJ: ignore-rest', optional(seq(NEWLINE, optional($.rest)))),

    rest: (_) => /[\s\S]+/,

    generated_comment: ($) =>
      choice(
        seq($._change_id, $.change_id, NEWLINE),
        seq(
          $._diff_summary,
          choice('A', 'M', 'D', 'C', 'R'),
          / /,
          $.filepath,
          NEWLINE,
        ),
      ),

    change_id: (_) => /[k-z]+/,

    filepath: (_) => ANYTHING,
  },
});
