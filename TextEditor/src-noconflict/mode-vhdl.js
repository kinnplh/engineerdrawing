ace.define("ace/mode/vhdl_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"], function(require, exports, module) {
    "use strict";

    var oop = require("../lib/oop");
    var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

    var VHDLHighlightRules = function() {



        var keywords = "access|after|ailas|all|architecture|assert|attribute|"+
            "begin|block|buffer|bus|case|component|configuration|"+
            "disconnect|downto|else|elsif|end|entity|file|for|function|"+
            "generate|generic|guarded|if|impure|in|inertial|inout|is|"+
            "label|linkage|literal|loop|mapnew|next|of|on|open|"+
            "others|out|port|process|pure|range|record|reject|"+
            "report|return|select|shared|subtype|then|to|transport|"+
            "type|unaffected|united|until|wait|when|while|with";

        var storageType = "bit|bit_vector|boolean|character|integer|line|natural|"+
            "positive|real|register|severity|signal|signed|"+
            "std_logic|std_logic_vector|string||text|time|unsigned|"+
            "variable";

        var storageModifiers = "array|constant";

        var keywordOperators = "abs|and|mod|nand|nor|not|rem|rol|ror|sla|sll|sra"+
            "srl|xnor|xor";

        var builtinConstants = (
            "true|false|null"
        );


        var keywordMapper = this.createKeywordMapper({
            "keyword.operator": keywordOperators,
            "keyword": keywords,
            "constant.language": builtinConstants,
            "storage.modifier": storageModifiers,
            "storage.type": storageType
        }, "identifier", true);

        this.$rules = {
            "start" : [ {
                token : "comment",
                regex : "--.*$"
            }, {
                token : "string",           // " string
                regex : '".*?"'
            }, {
                token : "string",           // ' string
                regex : "'.*?'"
            }, {
                token : "constant.numeric", // float
                regex : "[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b"
            }, {
                token : "keyword", // pre-compiler directives
                regex : "\\s*(?:library|package|use)\\b"
            }, {
                token : keywordMapper,
                regex : "[a-zA-Z_$][a-zA-Z0-9_$]*\\b"
            }, {
                token : "keyword.operator",
                regex : "&|\\*|\\+|\\-|\\/|<|=|>|\\||=>|\\*\\*|:=|\\/=|>=|<=|<>"
            }, {
                token : "punctuation.operator",
                regex : "\\'|\\:|\\,|\\;|\\."
            },{
                token : "paren.lparen",
                regex : "[[(]"
            }, {
                token : "paren.rparen",
                regex : "[\\])]"
            }, {
                token : "text",
                regex : "\\s+"
            } ]


        };
    };

    oop.inherits(VHDLHighlightRules, TextHighlightRules);

    exports.VHDLHighlightRules = VHDLHighlightRules;
});

ace.define("ace/mode/folding/cstyle",["require","exports","module","ace/lib/oop","ace/range","ace/mode/folding/fold_mode"], function(require, exports, module) {
    "use strict";

    var oop = require("../../lib/oop");
    var Range = require("../../range").Range;
    var BaseFoldMode = require("./fold_mode").FoldMode;

    var FoldMode = exports.FoldMode = function(commentRegex) {
        if (commentRegex) {
            this.foldingStartMarker = new RegExp(
                this.foldingStartMarker.source.replace(/\|[^|]*?$/, "|" + commentRegex.start)
            );
            this.foldingStopMarker = new RegExp(
                this.foldingStopMarker.source.replace(/\|[^|]*?$/, "|" + commentRegex.end)
            );
        }
    };
    oop.inherits(FoldMode, BaseFoldMode);

    (function() {

        this.foldingStartMarker = /([^e][^n][^d]\s|^.{0,3})(\bCASE\b|\bBEGIN\b|\bIF\b)/i;

        this.startRegionRe = /^\s*(\/\*|--)#?region\b/;
        this.foldingStopMarker = /^[^\[\{]*(\}|\])|^[\s\*]*(\*\/)|(\bEND\b(\w+;)?)/;
        this.singleLineBlockCommentRe= /^\s*(\/\*).*\*\/\s*$/;
        this.tripleStarBlockCommentRe = /^\s*(\/\*\*\*).*\*\/\s*$/;
        //this.startRegionRe = /^\s*(\/\*|\/\/)#?region\b/;
        this._getFoldWidgetBase = this.getFoldWidget;
        this.getFoldWidget = function(session, foldStyle, row) {
            var line = session.getLine(row);

            if (this.singleLineBlockCommentRe.test(line)) {
                if (!this.startRegionRe.test(line) && !this.tripleStarBlockCommentRe.test(line))
                    return "";
            }

            var fw = this._getFoldWidgetBase(session, foldStyle, row);

            if (!fw && this.startRegionRe.test(line))
                return "start"; // lineCommentRegionStart

            return fw;
        };
        this.getBeginEndBlock = function(session, row, column, matchSequence) {
            var start = {
                row: row,
                column: column + matchSequence.length
            };
            var maxRow = session.getLength();
            var line;

            var depth = 1;
            var re = /((\bCASE\b|\bBEGIN\b|\bIF\b))|(\bEND\b(\w+;)?)/i;
            //([^e][^n][^d]\s|^(.{1,3})?)
            while (++row < maxRow) {
                line = session.getLine(row);
                var m = re.exec(line);
                if (!m) continue;
                if (m[1]) depth++;
                else depth--;

                if (!depth) break;
            }
            var endRow = row;
            if (endRow > start.row) {
                return new Range(start.row, start.column, endRow, line.length);
            }
        };
        this.getFoldWidgetRange = function(session, foldStyle, row, forceMultiline) {
            var line = session.getLine(row);

            if (this.startRegionRe.test(line))
                return this.getCommentRegionBlock(session, line, row);

            var match = line.match(this.foldingStartMarker);
            if (match) {
                var i = match.index;

                if (match[2]) {
                    return this.getBeginEndBlock(session, row, i+match[1].length, match[2]);
                }
                    //return this.openingBracketBlock(session, match[1], row, i);

                var range = session.getCommentFoldRange(row, i + match[0].length, 1);

                if (range && !range.isMultiLine()) {
                    if (forceMultiline) {
                        range = this.getSectionRange(session, row);
                    } else if (foldStyle != "all")
                        range = null;
                }

                return range;
            }

            if (foldStyle === "markbegin")
               return;

            var match = line.match(this.foldingStopMarker);
            if (match) {
                var i = match.index + match[0].length;

                if (match[1])
                    return this.closingBracketBlock(session, match[1], row, i);

                return session.getCommentFoldRange(row, i, -1);
            }
        };

        this.getSectionRange = function(session, row) {
            var line = session.getLine(row);
            var startIndent = line.search(/\S/);
            var startRow = row;
            var startColumn = line.length;
            row = row + 1;
            var endRow = row;
            var maxRow = session.getLength();
            while (++row < maxRow) {
                line = session.getLine(row);
                var indent = line.search(/\S/);
                if (indent === -1)
                    continue;
                if  (startIndent > indent)
                    break;
                var subRange = this.getFoldWidgetRange(session, "all", row);

                if (subRange) {
                    if (subRange.start.row <= startRow) {
                        break;
                    } else if (subRange.isMultiLine()) {
                        row = subRange.end.row;
                    } else if (startIndent == indent) {
                        break;
                    }
                }
                endRow = row;
            }

            return new Range(startRow, startColumn, endRow, session.getLine(endRow).length);
        };
        this.getCommentRegionBlock = function(session, line, row) {
            var startColumn = line.search(/\s*$/);
            var maxRow = session.getLength();
            var startRow = row;

            var re = /^\s*(?:\/\*|\/\/|--)#?(end)?region\b/;
            var depth = 1;
            while (++row < maxRow) {
                line = session.getLine(row);
                var m = re.exec(line);
                if (!m) continue;
                if (m[1]) depth--;
                else depth++;

                if (!depth) break;
            }

            var endRow = row;
            if (endRow > startRow) {
                return new Range(startRow, startColumn, endRow, line.length);
            }
        };

    }).call(FoldMode.prototype);

});

ace.define("ace/mode/vhdl",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/vhdl_highlight_rules","ace/range","ace/mode/folding/cstyle"], function(require, exports, module) {
    "use strict";
    var oop = require("../lib/oop");
    var TextMode = require("./text").Mode;
    var VHDLHighlightRules = require("./vhdl_highlight_rules").VHDLHighlightRules;

    var CStyleFoldMode = require("./folding/cstyle").FoldMode;
    var Range = require("../range").Range;
    var Mode = function() {
        this.HighlightRules = VHDLHighlightRules;
        this.foldingRules = new CStyleFoldMode();
    };
    oop.inherits(Mode, TextMode);

    (function() {
        this.lineCommentStart = "--";
        this.$id = "ace/mode/vhdl";
    }).call(Mode.prototype);

    exports.Mode = Mode;

});
