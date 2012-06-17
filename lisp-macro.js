
// Perform one step of macroexpansion for given source term
// (source code).
// hasHead - if false, do not append to invoke a macro in the
//   head of the term
// quasiLevel - if >0, we're inside a quasiquote
lisp.macroExpandOne = function(term, hasHead, quasiLevel) {
    if (term.type != 'cons')
        return null;

    // first, try expanding the head
    var car = lisp.macroExpandOne(term.car, true, quasiLevel);
    if (car != null)
        return new lisp.Cons(car, term.cdr);

    // now, maybe the term itself is a macro invocation
    if (hasHead &&
        quasiLevel == 0 &&
        term.car.type == 'symbol')
    {
        var func = lisp.env.get('macro:'+term.car.s);
        if (func != null) {
            var args = lisp.termToList(term.cdr);
            return func.run(args);
        }
    }

    if (quasiLevel == 0 &&
        term.car.type == 'symbol' &&
        term.car.s == 'quote')
        // we don't expand quoted terms
        return null;

    if (hasHead && term.car.type == 'symbol') {
        if (term.car.s == 'quasiquote')
            quasiLevel++;
        if (term.car.s == 'unquote')
            quasiLevel--;
    }

    // lastly, try expanding the rest of list
    var cdr = lisp.macroExpandOne(term.cdr, false, quasiLevel);
    if (cdr != null)
        return new lisp.Cons(term.car, cdr);

    return null;
};

lisp.macroExpand = function(term) {
    var newTerm;
    while ((newTerm = lisp.macroExpandOne(term, true, 0)) != null)
        term = newTerm;
    return term;
};

lisp.addMacro = function(name, func) {
    lisp.env.vars['macro:'+name] = func;
};
