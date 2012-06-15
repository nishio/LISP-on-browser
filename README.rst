=================
 LISP on browser
=================

This is small implementation of LISP,
which written in JavaScript and run on browsers.

I think it helps you to understand what goint on in programming languages
by using it and reading its source codes.


Design
======

Readability counts.

My goal is not to make complete features of Lisp.
It makes source codes huge and makes difficult to read.


TODO
====

- (done) Milestone1: S-expression Parser

  - given string such like "(* 1 (+ 2 3))" and return syntax trees
  - in this point forget about reader macros such as "'(1 2 3)"

- (done)Milestone2: Some Built-in function

  - arithmetic functions: +, -, *, /
  - other functions: eval, cons, list

- (done)Milestone3: A REPL interpreter(when user input (* 1 (+ 2 3)), it prints 5)
- (done)Milestone4: Special forms: quote and if
- (done)Milestone5: Reader syntax with apostrophe: '(+ 2 2) = (quote (+ 2 2))

- Next milestones:

  - equality and comparison: =, /=, <, etc.
  - lexical scope (let and variables)
  - defining your own functions (defun)
  - comments in the code
  - a textbox for loading examples into interpreter

- Further milestones (need to break into smaller milestones)

  - Macros (and quasiquote/unquote)
  - Strings, I/O (print, read) using terminal
  - Macros (and quasiquote/unquote)


License
=======

GPLv3


Thanks
======

Paweł Marczewski wrote almost codes.
