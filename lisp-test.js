
// Testing
// TODO this is extremely crude, change to something better

function assertEqual(e1, e2) {
    if (e1 != e2) {
        var err = 'Assertion failed: ' + e1 + ' != ' + e2;
        throw err;
    }
};

function assertParse(s1, s2) {
    assertEqual(lisp.parse(s1).print(), s2);
};

function assertEval(s1, s2) {
    assertEqual(lisp.parse(s1).eval().print(), s2);
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

        assertParse('(A B C)', '(a b c)');
        assertParse('(1 2 3 . 4)', '(1 2 3 . 4)');
        assertParse('(+ . (1 . (2 . (3 . ()))))', '(+ 1 2 3)');

        assertEval('(+ 2 (* 3 4) (/ 2 4))', '14.5');

        assertEval('(if () a 3)', '3');
        assertEval('(if 4 5 a)', '5');

        assertEval('(eval (quote (+ 2 2)))', '4');
    } catch (err) {
        alert(err);
    }
};

lisp.test();
