
// Testing
// TODO this is extremely crude, change to something better

function assertEqual(e1, e2) {
    if (e1 != e2) {
        var err = 'Assertion failed: ' + e1 + ' != ' + e2;
        throw err;
    }
}

function assertParse(s1, s2) {
    assertEqual(lisp.parse(s1).print(), s2);
}

function assertEval(s1, s2) {
    assertEqual(lisp.evalCode(lisp.parse(s1),
                              lisp.env).print(), s2);
}

lisp.test = function() {
    lisp.terminal.echo('Running tests...');
    try {
        var oldEnv = lisp.env;
        lisp.env = new lisp.Env({}, oldEnv);

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
        assertParse('-2.5', '-2.5');

        assertParse('a;b', 'a');
        assertParse('(a;b\nc)', '(a c)');

        assertParse("'(+ 2 2)", "'(+ 2 2)");
        assertParse("'A", "'a");
        assertEval("(car ''A)", 'quote');
        assertEval("'(+ 2 2)", '(+ 2 2)');

        assertParse('`(a ,b)', '`(a ,b)');
        assertParse('(quasiquote (a (unquote b)))', '`(a ,b)');

        assertEval('`(+ 1 2 ,(+ 3 4))', '(+ 1 2 7)');
        assertEval('``(+ 1 2 ,(+ 3 ,(+ 2 2)))', '`(+ 1 2 ,(+ 3 4))');

        assertEval('(+ 2 (* 3 4) (/ 2 4))', '14.5');
        assertEval('(+)', '0');
        assertEval('(*)', '1');
        assertEval('(- 1)', '-1');
        assertEval('(/ 4)', '0.25');

        assertEval('(if () a 3)', '3');
        assertEval('(if 4 5 a)', '5');

        assertEval('(when (= 2 3) \'a \'b)', 'nil');
        assertEval('(when (= 2 2) \'a \'b)', 'b');

        assertEval('(eval (quote (+ 2 2)))', '4');

        assertEval('(list)', 'nil');
        assertEval('(list (+ 2 2) 3)', '(4 3)');
        assertEval('(cons (cons 2 3) (cons 4 nil))', '((2 . 3) 4)');

        assertEval('(= 2 2)', 't');
        assertEval('(/= 2 2)', 'nil');
        assertEval('(< (* 3 5) (* 4 8))', 't');

        assertEval('(car \'(1 2 3))', '1');
        assertEval('(cdr \'(1 2 3))', '(2 3)');
        assertEval('(empty? ())', 't');
        assertEval('(empty? \'(1 2 3))', 'nil');

        assertEval('(let (a 2 b 5) (* a b))', '10');
        assertEval('(let (a 2) (let (a 3) a))', '3');

        assertEval('(do 1 2 3)', '3');
        assertEval('(do)', 'nil');

        assertEval('(let (f (lambda (x) (+ x 1))) (f 5))', '6');

        assertEval('(do (define (f x) (+ x 1)) t)', 't');
        assertEval('(f 5)', '6');

        assertEval('(let (a 3) (define (g x) (+ x a)) t)', 't');
        assertEval('(g 5)', '8');

        assertEval('(define x 10)', '10');
        assertEval('(set! x 11)', '11');
        assertEval('x', '11');

        assertEval('(let (f (lambda (x y . z) (list x y z))) (f 1 2 3 4))',
                   '(1 2 (3 4))');

        assertEval('(defmacro (foo x) (list \'+ x x))', 'foo');
        assertEval('(expand-code-1 \'(foo bar))', '(+ bar bar)');
        assertEval('(expand-code-1 \'(+ 2 (foo bar)))', '(+ 2 (+ bar bar))');

        assertEval('(* (foo 2) (foo 3))', '24');

        assertEval("(expand-code '`((foo 1) ,(foo 2)))", '`((foo 1) ,(+ 2 2))');
        assertEval("(expand-code '``((foo 1) ,(foo 2) ,,(foo 3)))",
                   '``((foo 1) ,(foo 2) ,,(+ 3 3))');

        assertEval('(defmacro (plus x . xs) '
                   + '(if (empty? xs) x '
                   + '  (list \'+ x (cons \'plus xs))))',
                   'plus');
        assertEval('(expand-code \'(plus a b c d))', '(+ a (+ b (+ c d)))');

        assertEval('(- (plus 1 2 3))', '-6');

        lisp.env = oldEnv;
        lisp.terminal.echo('All tests OK!');
    } catch (err) {
        lisp.terminal.error('test: ' + err);
    }
};
