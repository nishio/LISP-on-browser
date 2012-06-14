
// Parser

// Parse a string. Returns a term, or null if the string is empty
lisp.parse = function(str) {
    // We parse by cutting off chunks from the beginning of the input string
    var input = str;

    // Return a nice error position description
    var parseError = function() {
        var pos = str.length - input.length;
        var start = str.substr(0, pos);
        throw 'parse error: ' + start + '<here>' + input;
    };

    // Try to parse a given regexp (must be anchored by ^) at the beginning
    // of input. Returns first group, whole match (if no groups) or null
    var tryConsume = function(re) {
        var m = re.exec(input);
        if (m != null) {
            if (m[0].length > 0)
                input = input.substr(m[0].length);
            return m.length > 1 ? m[1] : m[0];
        } else
            return null;
    };

    var deleteSpaces = function() {
        tryConsume(/^\s+/);
    };

    // Try to parse one term. Return null if we encounter something we don't
    // expect (like ')')
    var parseOne = function() {
        deleteSpaces();

        // end of input
        if (input.length == 0)
            return null;

        // number
        var s = tryConsume(/^(\d+\.\d*|\d+)/);
        if (s != null)
            return new lisp.Number(parseFloat(s));

        // symbol/nil
        var s = tryConsume(/^([^\s\(\)\.0-9][^\s\(\)]*)/);
        if (s != null) {
            s = s.toLowerCase();
            if (s == 'nil')
                return lisp.nil;
            else
                return new lisp.Symbol(s);
        }

        // cons/list - we respect the dot-notation (1 2 . 3)
        var s = tryConsume(/^(\()/);
        if (s != null) {
            var cdr = lisp.nil;
            var list = [];
            for (;;) {
                var term = parseOne();
                if (term == null) {
                    var s = tryConsume(/^\./);
                    if (s != null) {
                        cdr = parseOne();
                        if (cdr == null)
                            parseError();
                    }
                    deleteSpaces();
                    var s = tryConsume(/^\)/);
                    if (s == null)
                        parseError();
                    break;
                } else
                    list.push(term);
            }
            var result = cdr;
            for (var i = list.length-1; i >= 0; i--)
                result = new lisp.Cons(list[i], result);
            return result;
        }

        return null;
    };

    var term = parseOne();
    deleteSpaces();
    if (input.length > 0)
        parseError();
    else
        return term;
};
