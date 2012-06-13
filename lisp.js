lisp = {};

// Lisp datatypes 

lisp.Number = function(n) {
    this.n = n;
};
lisp.Number.prototype = {
    type: 'number',
    print: function() { return String(this.n); }
};

lisp.Symbol = function(s) {
    this.s = s;
};
lisp.Symbol.prototype = {
    type: 'symbol',
    print: function() { return this.s; }
};

lisp.Cons = function(car, cdr) {
    this.car = car;
    this.cdr = cdr;
};
lisp.Cons.prototype = {
    type: 'cons',
    print: function() {
        var s = '(' + this.car.print();
        var rest = this.cdr;
        while (rest.type == 'cons') {
            s += ' ' + rest.car.print();
            rest = rest.cdr;
        }
        if (rest.type != 'nil')
            s += ' . ' + rest.print();
        s += ')';
        return s;
    }
};
    
lisp.nil = { 
    type: 'nil',
    print: function() { return 'nil'; }
};

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
    }
    
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
}


// Testing
// TODO this is extremely crude, change to something better

function assertEqual(e1, e2) {
    if (e1 != e2) {
        var err = 'Assertion failed: ' + e1 + ' != ' + e2;
        throw err;
    }
};

lisp.test = function() {
    try {
        var num = new lisp.Number(5);
        var sym = new lisp.Symbol('bla');
        assertEqual(num.print(), '5');
        assertEqual(sym.print(), 'bla');
        assertEqual(new lisp.Cons(num, num).print(), '(5 . 5)');
        assertEqual(
            new lisp.Cons(num, new lisp.Cons(sym, lisp.nil)).print(), 
            '(5 bla)');
        
        assertEqual(lisp.parse('(A B C)').print(), '(a b c)');
        assertEqual(lisp.parse('(1 2 3 . 4)').print(), '(1 2 3 . 4)');
        assertEqual(lisp.parse('(+ . (1 . (2 . (3 . ()))))').print(), '(+ 1 2 3)');
    } catch (err) {
        alert(err);
    }
}

lisp.test();
