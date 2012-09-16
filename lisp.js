
// Lisp datatypes and helper functions

lisp = {};

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
        if (this.car.type == 'symbol' &&
            this.cdr.type == 'cons' &&
            this.cdr.cdr.type == 'nil') // one-argument form
        {
            var s = this.car.s;
            var arg = this.cdr.car;

            switch (s) {
            case 'quote':
                return "'" + arg.print();
            case 'quasiquote':
                return '`' + arg.print();
            case 'unquote':
                return ',' + arg.print();
            default: // fall through
            }
        }

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

lisp.checkType = function(term, type) {
    if (term.type != type)
        throw 'expected ' + type + ', got ' + term.print();
};

lisp.checkNumArgs = function(name, n, args) {
    if (args.length != n)
        throw 'wrong number of arguments for ' + name;
};

lisp.termToList = function(term) {
    var list = [];
    while (term.type != 'nil') {
        lisp.checkType(term, 'cons');
        list.push(term.car);
        term = term.cdr;
    }
    return list;
};

lisp.listToTerm = function(list, start) {
    var result = start;
    if (start == undefined)
        result = lisp.nil;
    for (var i = list.length - 1; i >= 0; i--)
        result = new lisp.Cons(list[i], result);
    return result;
};

// Construct a simple form (s arg)
lisp.form1 = function(s, arg) {
    return new lisp.Cons(new lisp.Symbol(s),
                         new lisp.Cons(arg,
                                       lisp.nil));
};
