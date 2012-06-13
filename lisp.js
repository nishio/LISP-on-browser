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
    } catch (err) {
        alert(err);
    }
}

lisp.test();
