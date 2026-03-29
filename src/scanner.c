#include <string.h>
#include <tree_sitter/parser.h>
#include <wctype.h>

enum TokenType { PREFIX_TYPE, CHANGE_ID, DIFF_SUMMARY, ERROR_SENTINEL };

void *tree_sitter_jjdescription_external_scanner_create() {
    return NULL;
}

void tree_sitter_jjdescription_external_scanner_destroy(void *p) {}

void tree_sitter_jjdescription_external_scanner_reset(void *p) {}

unsigned tree_sitter_jjdescription_external_scanner_serialize(void *p,
                                                              char *buffer) {
    return 0;
}

void tree_sitter_jjdescription_external_scanner_deserialize(void *p,
                                                            const char *b,
                                                            unsigned n) {}

bool tree_sitter_jjdescription_external_scanner_scan(
    void *payload, TSLexer *lexer, const bool *valid_symbols) {
    if (valid_symbols[ERROR_SENTINEL]) {
        return false;
    }

    if (valid_symbols[PREFIX_TYPE]) {
        lexer->result_symbol = PREFIX_TYPE;
        int js = 0;
        if (iswcntrl(lexer->lookahead) || iswspace(lexer->lookahead) ||
            lexer->lookahead == ':' || lexer->lookahead == '!' ||
            lexer->lookahead == 0xFF1A || lexer->eof(lexer)) {
            return false;
        }
        if (lexer->lookahead == 'J') {
            js++;
        }
        lexer->advance(lexer, false);

        while (!iswcntrl(lexer->lookahead) && !iswspace(lexer->lookahead) &&
               lexer->lookahead != ':' && lexer->lookahead != 0xFF1A &&
               lexer->lookahead != '!' && lexer->lookahead != '(' &&
               lexer->lookahead != ')' && !lexer->eof(lexer)) {
            if (lexer->lookahead == 'J') {
                js++;
            } else {
                // Just overflow here; in this case we will never have just
                // "JJ:".
                js = 3;
            }
            lexer->advance(lexer, false);
        }
        lexer->mark_end(lexer);

        if (lexer->lookahead == '(') {
            js = 0;
            lexer->advance(lexer, false);

            if (lexer->lookahead == ')') {
                return false;
            }

            while (!iswcntrl(lexer->lookahead) && lexer->lookahead != '(' &&
                   lexer->lookahead != ')' && !lexer->eof(lexer)) {
                lexer->advance(lexer, false);
            }

            if (lexer->lookahead != ')') {
                return false;
            }
            lexer->advance(lexer, false);
        }

        if (lexer->lookahead == '!') {
            js = 0;
            lexer->advance(lexer, false);
        }

        if (js == 2 ||
            (lexer->lookahead != ':' && lexer->lookahead != 0xFF1A)) {
            return false;
        }

        lexer->advance(lexer, false);

        return lexer->lookahead != '\r' && lexer->lookahead != '\n';
    }

    if (valid_symbols[CHANGE_ID] || valid_symbols[DIFF_SUMMARY]) {
        const char *comment_prefix = "JJ: ";
        int prefix_len = strlen(comment_prefix);
        int idx = 0;

        while (idx < prefix_len && lexer->lookahead == comment_prefix[idx] &&
               !lexer->eof(lexer)) {
            lexer->advance(lexer, false);
            idx++;
        }

        if (idx != prefix_len) {
            return false;
        }
    }

    if (valid_symbols[CHANGE_ID]) {
        const char *generated_string = "Change ID: ";
        int gen_str_len = strlen(generated_string);
        int idx = 0;

        while (idx < gen_str_len && lexer->lookahead == generated_string[idx] &&
               !lexer->eof(lexer)) {
            lexer->advance(lexer, false);
            idx++;
        }

        if (idx == gen_str_len && lexer->lookahead >= 'k' &&
            lexer->lookahead <= 'z') {
            lexer->result_symbol = CHANGE_ID;
            return true;
        } else if (idx > 0) {
            return false;
        }
    }

    if (valid_symbols[DIFF_SUMMARY]) {
        const char *generated_prefix = "    ";
        int gen_str_len = strlen(generated_prefix);
        int idx = 0;

        while (idx < gen_str_len && lexer->lookahead == generated_prefix[idx] &&
               !lexer->eof(lexer)) {
            lexer->advance(lexer, false);
            idx++;
        }

        lexer->mark_end(lexer);

        if (idx == gen_str_len &&
            (lexer->lookahead == 'A' || lexer->lookahead == 'M' ||
             lexer->lookahead == 'D' || lexer->lookahead == 'C' ||
             lexer->lookahead == 'R')) {
            lexer->advance(lexer, false);
        } else {
            return false;
        }

        if (lexer->lookahead == ' ') {
            lexer->advance(lexer, false);
            if (!iswspace(lexer->lookahead) && !lexer->eof(lexer)) {
                lexer->result_symbol = DIFF_SUMMARY;
                return true;
            }
        }
    }

    return false;
}
