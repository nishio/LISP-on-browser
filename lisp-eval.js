
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

        case 'quasiquote':
            return lisp.evalQuasi(this, 0, env);

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

        case 'define':
        case 'defmacro': {
            if (args.length == 0)
                throw 'too few arguments to '+s;
            if (args[0].type == 'symbol') {
                // form: (define x ...)
                if (s == 'defmacro')
                    throw 'symbol macros are not supported';
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
                if (s == 'define') {
                    lisp.env.vars[name] = func;
                    return func;
                } else {
                    lisp.macros[name] = func;
                    return new lisp.Symbol(name);
                }
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
    var restParam = null;
    var params = args[0];

    // Parse the argument list
    while (params.type == 'cons') {
        lisp.checkType(params.car, 'symbol');
        paramNames.push(params.car.s);
        params = params.cdr;
    }

    // Last argument - either a 'rest' symbol, e.g. (a b . c),
    // or nil
    if (params.type == 'symbol')
        restParam = params.s;
    else
        lisp.checkType(params, 'nil');

    return new lisp.Func(
        name, function(funcArgs) {
            // bind the values to param names
            if (restParam == null)
                lisp.checkNumArgs(name, paramNames.length, funcArgs);
            else {
                if (funcArgs.length < paramNames.length)
                    throw 'too few arguments for '+name;
            }

            var vars = {};
            for (var i = 0; i < paramNames.length; i++)
                vars[paramNames[i]] = funcArgs[i];
            if (restParam != null) {
                vars[restParam] = lisp.listToTerm(funcArgs.slice(paramNames.length));
            }

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

lisp.evalQuasi = function(term, level, env) {
    if (term.type == 'cons' && term.car.type == 'symbol') {
        var s = term.car.s;
        if (s == 'quasiquote' || s == 'unquote') {
            var args = lisp.termToList(term.cdr);
            lisp.checkNumArgs(s, 1, args);
            if (s == 'quasiquote') {
                if (level == 0)
                    return lisp.evalQuasi(args[0], level+1, env);
                else // level > 0
                    return lisp.form1('quasiquote',
                                      lisp.evalQuasi(args[0], level+1, env));
            } else { // s == 'unquote'
                if (level == 0)
                    throw 'unquote without quasiquote';
                else if (level == 1)
                    return args[0].eval(env);
                else // level > 1
                    return lisp.form1('unquote',
                                      lisp.evalQuasi(args[0], level-1, env));
            }
        }
    }
    // not a quasiquote or unquote
    if (level == 0)
        return term.eval(env);
    else {
        if (term.type == 'cons')
            return new lisp.Cons(lisp.evalQuasi(term.car, level, env),
                                 lisp.evalQuasi(term.cdr, level, env));
        else
            return term;
    }
};

// Macroexpand and evaluate code
lisp.evalCode = function(term, env) {
    term = lisp.macroExpand(term);
    return term.eval(env);
};
