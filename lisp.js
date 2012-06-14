
// Lisp datatypes

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
