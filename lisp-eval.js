
// Evaluation engine

// A lisp function value. run has to be a function(args)
// (or just a function(args)
lisp.Func = function(name, run) {
    this.name = name;
    this.run = run;
};
lisp.Func.prototype = {
    type: 'function',
    print: function() {
        return '<function '+ this.name+ '>';
    },
    eval: function() {
        throw 'trying to evaluate '+this.print()+' again';
    }
};

lisp.Number.prototype.eval = function() {
    return this;
};

lisp.nil.eval = function() {
    return this;
};

lisp.Symbol.prototype.eval = function(env) {
    var v = env.get(this.s);
    if (v)
        return v;
    else
        throw 'undefined variable: '+this.s;
};

lisp.Cons.prototype.eval = function(env) {
    var args = lisp.termToList(this.cdr);

    // check for special forms
    if (this.car.type == 'symbol') {
        var s = this.car.s;

        switch(s) {

        case 'if': {
            lisp.checkNumArgs('if', 3, args);
            var test = args[0].eval(env);
            if (test.type == 'nil')
                return args[2].eval(env);
            else
                return args[1].eval(env);
        }

        case 'quote': {
            lisp.checkNumArgs('quote', 1, args);
            return args[0];
        }

        case 'let': {
            if (args.length == 0)
                throw 'too few arguments to let';

            // first, parse the bindings for let
            // we expect a list: (name value name value...)
            var bindings = lisp.termToList(args[0]);
            if (bindings.length % 2 != 0)
                throw 'bad bindings format: '+args[0].print();

            var vars = {};
            for (var i = 0; i < bindings.length; i+=2) {
                lisp.checkType(bindings[i], 'symbol');
                var name = bindings[i].s;
                var value = bindings[i+1].eval(env);
                vars[name] = value;
            }

            // now evaluate the rest of the form in a new environment
            var newEnv = env.extend(vars);
            return lisp.evalList(args, 1, newEnv);
        }

        case 'do':
            return lisp.evalList(args, 0, env);

        case 'lambda': {
            if (args.length == 0)
                throw 'too few arguments to lambda';
            return lisp.makeFuncFromDef(env, args, '(lambda)');
        }

        case 'define': {
            if (args.length == 0)
                throw 'too few arguments to define';
            if (args[0].type == 'symbol') {
                // form: (define x ...)
                var name = args[0].s;
                var value = lisp.evalList(args, 1, env);
                lisp.env.vars[name] = value;
                return value;
            } else {
                // form: (define (f ...) ...)
                lisp.checkType(args[0], 'cons');
                lisp.checkType(args[0].car, 'symbol');

                var name = args[0].car.s;
                // pop the name from args[0]
                args[0] = args[0].cdr;

                var func = lisp.makeFuncFromDef(env, args, name);
                lisp.env.vars[name] = func;
                return func;
            }
        }

        case 'set!': {
            lisp.checkNumArgs('set!', 2, args);
            lisp.checkType(args[0], 'symbol');
            var name = args[0].s;
            var value = args[1].eval(env);
            if (!env.set(name, value))
                throw 'undefined variable: '+name;
            return value;
        }

        default: // not a special form, do nothing (just proceed)
        }
    }

    // ordinary function
    var car = this.car.eval(env);
    lisp.checkType(car, 'function');
    for (var i = 0; i < args.length; ++i)
        args[i] = args[i].eval(env);

    return car.run(args);
};

lisp.evalList = function(terms, start, env) {
    var value = lisp.nil;
    for (var i = start; i < terms.length; i++) {
        value = terms[i].eval(env);
    }
    return value;
};

// Make a Func from arguments to (defun ...) or (lambda ...)
lisp.makeFuncFromDef = function(env, args, name) {
    var paramNames = [];
    var params = lisp.termToList(args[0]);
    for (var i = 0; i < params.length; i++) {
        lisp.checkType(params[i], 'symbol');
        paramNames = params[i].s;
    }

    return new lisp.Func(
        name, function(funcArgs) {
            // bind the values to param names
            lisp.checkNumArgs(name, paramNames.length, funcArgs);
            var vars = {};
            for (var i = 0; i < paramNames.length; i++)
                vars[paramNames[i]] = funcArgs[i];

            // now evaluate the function body
            var newEnv = env.extend(vars);
            return lisp.evalList(args, 1, newEnv);
        });
};

// A basic Lisp variables environment. Make new one using the extend() method
lisp.env = {
    vars: {},
    parent: null,

    // variable lookup
    get: function(name) {
        if (name in this.vars)
            return this.vars[name];
        else if (this.parent)
            return this.parent.get(name);
        return null;
    },

    set: function(name, value) {
        if (name in this.vars) {
            this.vars[name] = value;
            return true;
        } else if (this.parent)
            return this.parent.set(name, value);
        return false;
    },

    // make new environment on top of current and return it
    extend: function(vars) {
        return {
            __proto__: lisp.env,
            vars: vars,
            parent: this
        };
    }
};

// Builtin functions

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

lisp.env.vars['+'] = lisp.numFunc('+', function(a,b) { return a+b; });
lisp.env.vars['-'] = lisp.numFunc('-', function(a,b) { return a-b; });
lisp.env.vars['*'] = lisp.numFunc('*', function(a,b) { return a*b; });
lisp.env.vars['/'] = lisp.numFunc('/', function(a,b) {
                                      if (b == 0)
                                          throw 'division by zero';
                                      else
                                          return a/b; });

lisp.env.vars.t = new lisp.Symbol('t');
lisp.env.vars.t.eval = function() { return this; };

lisp.env.vars.eval = new lisp.Func('eval', function(args) {
                                       lisp.checkNumArgs('eval', 1, args);
                                       return args[0].eval(lisp.env);
                                   });

lisp.tSym = lisp.env.vars.t;

lisp.env.vars.list = new lisp.Func('list', function(args) {
                                  return lisp.listToTerm(args);
                              });
lisp.env.vars.cons = new lisp.Func('list', function(args) {
                                  lisp.checkNumArgs('cons', 2, args);
                                  return new lisp.Cons(args[0], args[1]);
                              });

lisp.compareFunc = function(name, func) {
    return new lisp.Func(
        name, function(args) {
            lisp.checkNumArgs(name, 2, args);
            lisp.checkType(args[0], 'number');
            lisp.checkType(args[1], 'number');
            return func(args[0].n, args[1].n) ? lisp.tSym : lisp.nil;
        });
};

lisp.env.vars['=']  = lisp.compareFunc('=',  function(a,b) { return a == b; });
lisp.env.vars['/='] = lisp.compareFunc('/=', function(a,b) { return a != b; });
lisp.env.vars['>']  = lisp.compareFunc('>',  function(a,b) { return a > b; });
lisp.env.vars['>='] = lisp.compareFunc('>=', function(a,b) { return a >= b; });
lisp.env.vars['<']  = lisp.compareFunc('<',  function(a,b) { return a < b; });
lisp.env.vars['<='] = lisp.compareFunc('<=', function(a,b) { return a <= b; });
