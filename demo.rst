Demo
====

.. raw:: html

  <script src="repos/LISP-on-browser/jquery-1.7.2.min.js"></script>
  <script src="repos/LISP-on-browser/jquery.terminal-0.4.15.js"></script>
  <script src="repos/LISP-on-browser/lisp.js"></script>
  <script src="repos/LISP-on-browser/lisp-parser.js"></script>
  <script src="repos/LISP-on-browser/lisp-eval.js"></script>
  <script src="repos/LISP-on-browser/lisp-macro.js"></script>
  <script src="repos/LISP-on-browser/lisp-builtins.js"></script>
  <script src="repos/LISP-on-browser/lisp-repl.js"></script>
  <script src="repos/LISP-on-browser/lisp-test.js"></script>
  <link rel="stylesheet" type="text/css" href="repos/LISP-on-browser/terminal.css" />
  <script>
    $(function() {
          lisp.replTerminal($('#term'));
          lisp.replLoader($('#source'), $('#load'));
          lisp.test();
          $('body').click(function() { lisp.terminal.disable(); });
          $('#clear').click(function () { lisp.terminal.clear(); });
    });
  </script>

  <div id="term" style="width: 48%; height: 300px; float: left;"></div>
  <div style="width: 48%; float: right;">
    <textarea id="source" style="width: 100%; height: 300px;">
  ;; A few examples. Click 'Load source' to load them.

  ; Closures
  (let (count 0)
    (define (counter) (set! count (+ 1 count))))

  ; You can also define variables
  (define x 2)
  (set! x 3)

  ; Let
  (let (x 2 y 3) (+ x y))

  ; Lambda
  (set! x (lambda () 'bla))
  (x)

  ; Factorial example
  (define (fact n)
    (if (= n 0)
        1
        (* n (fact (- n 1)))))
  (fact 5)

  ; Length example
  (define (length list)
    (if (empty? list)
        0
        (+ 1 (length (cdr list)))))
  (length '(1 2 3))

  ; Map example
  (define (map func list)
    (if (empty? list)
        nil
        (cons (func (car list))
              (map func (cdr list)))))
  (map (lambda (x) (+ x 1)) '(1 2 3))

  ; And macro example
  (defmacro (and x . xs)
    (if (empty? xs)
        x
        `(when ,x (and . ,xs))))
  (expand-code '(and a b c d))
  ; and to demonstrate the short-circuit mechanism:
  ; ((unknown) should crash when run)
  (and (= 2 2) (= 2 3) (unknown))

  ;; Hygiene in macros
  ; Consider a simple macro:

  (defmacro (bad-swap a b)
    `(let (tmp ,a)
       (set! ,a ,b)
       (set! ,b tmp)))

  ; Usage example:
  (let (x 1 y 2)
     (bad-swap x y)
     (list x y))
  ; (2 1)

  ; Unfortunately, this fails if we have a variable called tmp!
  (let (x 1 tmp 2)
     (bad-swap x tmp)
     (list x tmp))
  ; (1 2)

  ; We solve that by using the gensym function to generate a new name
  ; that will not conflict with anything else:
  (defmacro (swap a b)
    (let (tmp (gensym 'tmp))
      `(let (,tmp ,a)
         (set! ,a ,b)
         (set! ,b ,tmp))))

  ; Now try:
  (expand-code '(swap x tmp))
  ; (let (#tmp-0 x) (set! x tmp) (set! tmp #tmp-0))

  </textarea>
    <input type="button" id="clear" value="Clear terminal" />
    <input type="button" id="load" value="Load source" />
  </div>
  <p style="clear: both"></p>
