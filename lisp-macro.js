
// Macro environment - a mapping from names to functions.
lisp.macros = {};

// Perform one step of macroexpansion for given source term
// (source code). If hasHead is false, do not append to invoke
// a macro in the head of the term.
lisp.macroExpandOne = function(term, hasHead) {
    if (term.type != 'cons')
        return null;

    // first, try expanding the head
    var car = lisp.macroExpandOne(term.car, true);
    if (car != null)
        return new lisp.Cons(car, term.cdr);

    // now, maybe the term itself is a macro invocation
    if (hasHead &&
        term.car.type == 'symbol' &&
        term.car.s in lisp.macros) {

        var func = lisp.macros[term.car.s];
        var args = lisp.termToList(term.cdr);
        return func.run(args);
    }

    if (term.car.type == 'symbol' &&
        term.car.s == 'quote')
        // we don't expand quoted terms
        return null;

    // lastly, try expanding the rest of list
    var cdr = lisp.macroExpandOne(term.cdr, false);
    if (cdr != null)
        return new lisp.Cons(term.car, cdr);

    return null;
};

lisp.macroExpand = function(term) {
    var newTerm;
    while ((newTerm = lisp.macroExpandOne(term, true)) != null)
        term = newTerm;
    return term;
};
