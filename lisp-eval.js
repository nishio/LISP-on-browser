
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
    var car = this.car.eval();
    var args = lisp.termToList(this.cdr);

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
