/**
 * @file Tree-sitter parser for `jj desc` buffers.
 * @author Riley Bruins <ribru17@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: 'jjdescription',

  rules: {
    // TODO: add the actual grammar rules
    source_file: ($) => 'hello',
  },
});
