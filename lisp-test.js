
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

        assertEqual(lisp.parse('(+ 2 (* 3 4) (/ 2 4))').eval().print(), '14.5');

        assertEqual(lisp.parse('(if () a 3)').eval().print(), '3');
        assertEqual(lisp.parse('(if 4 5 a)').eval().print(), '5');
    } catch (err) {
        alert(err);
    }
}

lisp.test();
