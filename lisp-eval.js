
lisp.Func = function(name, run) {
    this.name = name;
    this.run = run;
};
lisp.Func.prototype = {
    type: 'function',
    print: function() {
        return '<function '+ this.name+ '>';
    }
};

lisp.Number.prototype.eval = function() {
    return this;
};

lisp.nil.eval = function() {
    return this;
};

lisp.Symbol.prototype.eval = function() {
    if (this.s in lisp.env)
        return lisp.env[this.s];
    else
        throw 'undefined variable: '+this.s;
};

lisp.Cons.prototype.eval = function() {
    var args = lisp.termToList(this.cdr);

    // check for special forms
    if (this.car.type == 'symbol') {
        var s = this.car.s;

        if (s == 'if') {
            lisp.checkNumArgs('if', 3, args);
            var test = args[0].eval();
            if (test.type == 'nil')
                return args[2].eval();
            else
                return args[1].eval();
        }

        if (s == 'quote') {
            lisp.checkNumArgs('quote', 1, args);
            return args[0];
        }
    }

    // ordinary function
    var car = this.car.eval();
    lisp.checkType(car, 'function');
    for (var i = 0; i < args.length; ++i)
        args[i] = args[i].eval();

    return car.run(args);
};

lisp.Func.prototype.eval = function() {
    throw 'trying to evaluate '+this.print()+' again';
};

lisp.numFunc = function(name, func) {
    return new lisp.Func(
        name, function(args) {
            if (args.length == 0)
                throw 'too few arguments to '+name;
            var n = args[0].n;
            for (var i = 1; i < args.length; i++) {
                lisp.checkType(args[i], 'number');
                n = func(n, args[i].n);
            }
            return new lisp.Number(n);
        });
};

lisp.env = {};
lisp.env['+'] = lisp.numFunc('+', function(a,b) { return a+b; });
lisp.env['-'] = lisp.numFunc('-', function(a,b) { return a-b; });
lisp.env['*'] = lisp.numFunc('*', function(a,b) { return a*b; });
lisp.env['/'] = lisp.numFunc('/', function(a,b) {
                                 if (b == 0)
                                     throw 'division by zero';
                                 else
                                     return a/b; });
lisp.env.t = new lisp.Symbol('t');
lisp.env.t.eval = function() { return this; };

lisp.env.eval = new lisp.Func('eval', function(args) {
                                  lisp.checkNumArgs('eval', 1, args);
                                  return args[0].eval();
                              });
