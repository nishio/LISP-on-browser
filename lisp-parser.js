
// Parser

lisp.Parser = function(str) {
    // We parse by cutting off chunks of 'input'
    this.str = str;
    this.input = str;
};
lisp.Parser.prototype = {
    // Return a nice error position description
    parseError: function() {
        var pos = this.str.length - this.input.length;
        var start = this.str.substr(0, pos);
        throw 'parse error: ' + start + '<here>' + this.input;
    },

    // Try to parse a given regexp (must be anchored by ^) at the beginning
    // of input. Returns first group, whole match (if no groups) or null
    tryConsume: function(re) {
        var m = re.exec(this.input);
        if (m != null) {
            if (m[0].length > 0)
                this.input = this.input.substr(m[0].length);
            return m.length > 1 ? m[1] : m[0];
        } else
            return null;
    },

    deleteSpaces: function() {
        this.tryConsume(/^\s+/);
    },

    // Try to parse one term. Return null if we encounter something we don't
    // expect (like ')')
    parseOne: function() {
        this.deleteSpaces();

        // end of input
        if (this.input.length == 0)
            return null;

        // number
        var s = this.tryConsume(/^(\d+\.\d*|\d+)/);
        if (s != null)
            return new lisp.Number(parseFloat(s));

        // symbol/nil
        var s = this.tryConsume(/^([^\s\(\)\.0-9][^\s\(\)]*)/);
        if (s != null) {
            s = s.toLowerCase();
            if (s == 'nil')
                return lisp.nil;
            else
                return new lisp.Symbol(s);
        }

        // cons/list - we respect the dot-notation (1 2 . 3)
        var s = this.tryConsume(/^(\()/);
        if (s != null) {
            var cdr = lisp.nil;
            var list = [];
            for (;;) {
                var term = this.parseOne();
                if (term == null) {
                    var s = this.tryConsume(/^\./);
                    if (s != null) {
                        cdr = this.parseOne();
                        if (cdr == null)
                            this.parseError();
                    }
                    this.deleteSpaces();
                    var s = this.tryConsume(/^\)/);
                    if (s == null)
                        this.parseError();
                    break;
                } else
                    list.push(term);
            }
            return lisp.listToTerm(list, cdr);
        }

        return null;
    },

    // Check if the rest of the string is empty
    ensureEmpty: function() {
        this.deleteSpaces();
        if (this.input.length > 0)
            this.parseError();
    }
};

// Parse a string. Returns a term, or null if the string is empty
lisp.parse = function(str) {
    var parser = new lisp.Parser(str);
    var term = parser.parseOne();
    parser.ensureEmpty();
    return term;
};
