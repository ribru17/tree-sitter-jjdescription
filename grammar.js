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

  extras: ($) => [NEWLINE, $.comment, $.generated_comment],

  externals: (
    $,
  ) => [
    $.type,
    $._change_id,
    $._diff_summary,
    $._jj_prefix,
    $._jj_ignore_rest,
    $._error_sentinel,
  ],

  rules: {
    source: ($) =>
      seq(
        optional(seq($.subject, repeat($.body_line))),
        optional($.ignore_rest),
      ),

    comment: ($) => seq($._jj_prefix, alias(/[^\r\n]*/, $.comment_content)),

    subject: ($) =>
      prec.right(
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
      seq($._jj_ignore_rest, optional($.rest)),

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
