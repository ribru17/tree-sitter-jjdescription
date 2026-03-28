/**
 * @file Tree-sitter parser for `jj desc` buffers.
 * @author Riley Bruins <ribru17@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const NEWLINE = /\r?\n/;
const ANYTHING = /[^\r\n]+/;
const CHANGE_ID = /[k-z]+/;

module.exports = grammar({
  name: 'jjdescription',

  extras: ($) => [NEWLINE, $.comment],

  rules: {
    source: ($) =>
      seq(
        optional($.subject),
        repeat(
          choice(
            $.body_line,
            $.ignore_rest,
            // $.generated_comment,
          ),
        ),
      ),

    // generated_comment: ($) =>
    //   seq(
    //     'JJ: Change ID: ',
    //     $.change_id,
    //     // CHANGE_ID,
    //     NEWLINE,
    //   ),

    change_id: (_) => token.immediate(CHANGE_ID),

    comment: (_) => token(seq('JJ:', optional(ANYTHING))),

    subject: (_) => prec(1, ANYTHING),

    body_line: (_) => ANYTHING,

    ignore_rest: ($) =>
      seq('JJ: ignore-rest', optional(seq(NEWLINE, optional($.rest)))),

    rest: (_) => /[\s\S]+/,
  },
});
