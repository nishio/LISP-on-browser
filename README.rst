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

- Milestone2: Some Built-in function (+, *, eval)
- Milestone3: A REPL interpreter(when user input (* 1 (+ 2 3)), it prints 5)

- Further milestones (need to break into smaller milestones)

  - quote
  - Macros (and quasiquote/unquote)
  - other Built-in function
  - Variables, let
  - Defun and lambda
  - Strings, I/O (print, read) using terminal


License
=======

GPLv3


Thanks
======

Paweł Marczewski wrote almost codes.
