
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
    lisp.terminal.echo('Running tests...');
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

        assertParse('a;b', 'a');
        assertParse('(a;b\nc)', '(a c)');

        assertParse("'(+ 2 2)", '(quote (+ 2 2))');
        assertParse("'A", '(quote a)');
        assertEval("'(+ 2 2)", '(+ 2 2)');

        assertEval('(+ 2 (* 3 4) (/ 2 4))', '14.5');

        assertEval('(if () a 3)', '3');
        assertEval('(if 4 5 a)', '5');

        assertEval('(eval (quote (+ 2 2)))', '4');

        assertEval('(list)', 'nil');
        assertEval('(list (+ 2 2) 3)', '(4 3)');
        assertEval('(cons (cons 2 3) (cons 4 nil))', '((2 . 3) 4)');

        assertEval('(= 2 2)', 't');
        assertEval('(/= 2 2)', 'nil');
        assertEval('(< (* 3 5) (* 4 8))', 't');
        lisp.terminal.echo('All tests OK!');
    } catch (err) {
        lisp.terminal.error('test: '+err);
    }
};
