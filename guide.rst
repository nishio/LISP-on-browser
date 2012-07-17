============================
Lisp on browser - code guide
============================

This is a guide describing the development of a Lisp interpreter. It
does not mention all details, but highlights the most important
milestones.

Each sections contains Github links either to a commit, or to relevant
code at the time of writing. However, often looking at the *final*
version of the code can be instructive as well -- some code has been
since refactored and is now simpler.

Data types
==========

We start by defining the basic data types:

- numbers: these will be ordinary Javascript floats
- symbols: variable and names, like ``+`` or ``x`` (case-insensitive)
- cons cells: a basic building block for list
- nil: a special value representing the empty list.

A cons cell has two fields, ``car`` and ``cdr`` (the names are
historic). Usually the ``car`` is the head of the list and ``cdr`` is
the tail. Our values are all boxed inside objects with the ``type``
field.

`Data types code
<https://github.com/nishio/LISP-on-browser/blob/8755fe1b56943638ec9c054d82137faf2079b49d/lisp.js>`_


S-expression parser
===================

To parse S-expressions, we write a simple `recursive descent parser
<http://en.wikipedia.org/wiki/Recursive_descent_parser>`_. The parser
repeatedly tries to read an S-expression from the beginning of an
input.

First, it tries to match the beginning of input against a 'number'
regexp (digits, and possibly a decimal point). If it fails, it tries
to read a symbol. Finally, we look for an open paren (``(``) and try
to read a list.

The list reader is complicated, because it handles a cons
pairs/improper list notation, e.g. ``(a . b)`` is a cons cell whose
second element is ``b``, and ``(a b . c)`` is a so-called *improper
list* ending with ``c`` (instead of ``nil``).

We first read all the elements as a JavaScript array, so after we read
``(a b . c)``, we have ``list = [a,b]`` and ``result = c``. Then we
construct the actual cons cells in a loop.

`Parser code
<https://github.com/nishio/LISP-on-browser/commit/13a851732ff69197ae5433251f7212fb930c9aad>`_

The `final, refactored version of parser
<https://github.com/nishio/LISP-on-browser/blob/master/lisp-parser.js>`_
is slightly easier to read.

Simple evaluator
================

Next, we want to evaluate the S-expressions to create our first
interpreter. To do that, we define the ``eval()`` method for all
values.

Numbers and ``nil`` evaluate to themselves (``return this``). Symbols
evaluate to their values in a global environment (``return
lisp.env[this.s]``). Right now we define four values: ``+``, ``-``,
``*``, ``/``. They are of course the arithmetic functions.

To define them, we create a new type of value - a function
(``Func``). The function is expected to have a ``run(args)`` method
that returns the result.

Finally, we can evaluate Lisp *forms*, i.e. list expressions like
``(func arg1 arg2 arg3)``. The first element is the function, and the
rest of them are arguments.

The ``eval`` method for cons pairs (``Cons.prototype.eval()``) takes
care of them. We first evaluate the first element (a function), then
all others (the arguments). Finally, we pass the evaluated arguments
to a function and return its result.

For the interpreter to give sensible error messages, we also add
simple type checking (``lisp.checkType``).

`Simple evaluator code
<https://github.com/nishio/LISP-on-browser/commit/96fefb9ca1fb81822f98961b08c81e091796e89e>`_

Special forms
=============

Some forms in Lisp code are not function calls: they begin with a
special keyword, and their arguments are not necessarily evaluated. A
good example is ``quote``, which is actually used to suppress
evaluation. Another one is ``if``: in ``(if test then-part
else-part)`` we first evaluate ``test``, then decide whether to
evaluate ``then-part`` or ``else-part``.

Forms beginning with ``if`` and ``quote`` are called *special
forms*. We extend the evaluator for cons pairs to deal with these - if
a list begins with one of them, we invoke special behavior.

Everything except ``nil`` is considered true. We also add a special
symbol called ``t`` that represents truth and evaluates to itself.

Later we extend the parser with a special syntax for ``quote``, so
that ``'(a b c)`` reads as ``(quote (a b c))``.

`Special forms (if and quote) code
<https://github.com/nishio/LISP-on-browser/commit/235931b9b4048147274039588061efa7ffc0da38>`_

Local scope
===========

Right now all of our variables are global. We want the user to be able
to define local variables (e.g. ``(let (x 10) (+ x y))``), so we
introduce the concept of local environment.

The environment (``lisp.env``) now has a hierarchical structure -- we
can call the ``extend`` function to create a new one on top of the
old. For example, in ``(let (x 2 y 3) (let (x 4) (+ x y)))`` the
hierarchy in which ``(+ x y)`` gets evaluated is: ::

    (global variables)
      {x: 2, y: 3}
        {x: 4}

Every form is now evaluated in a specific environment, so the
``eval()`` function always receives the current environment. The code
handling the ``let`` special form creates an extended environment and
passes it down.

`Local scope code
<https://github.com/nishio/LISP-on-browser/blob/68bc4910498a837d1ecd710d935f9f2a973bba52/lisp-eval.js>`_
(look at ``let`` handling in ``lisp.Cons.prototype.eval``)

`Later version of environment
<https://github.com/nishio/LISP-on-browser/commit/1d6ae128a83cc4bb8cac5c87084d0491c888ae19>`_
is less hacky, and ``Env`` becomes a regular JavaScript constructor.

Defining your own functions
===========================

Now we can create ``lambda`` and ``define``, forms that allow the user
to create their own functions. They create a new ``Func`` value, which
stores code to be evaluated later.

An important detail is that the code is evaluated *in the environment
where it was defined* (extended with current arguments), not in the
one where it was called. In other words, each ``Func`` remembers its
own environment.

This is called *lexical scope*. It allows us to write code like ::

   (define (adder x)
      (lambda (y) (+ x y)))

The ``lambda``-function is returned outside ``adder``, but it keeps
the reference to ``x`` (the reference is called *lexical
closure*). The effect wouldn't be possible if we always used the
caller's environment -- that would be *dynamic scoping* (which also
has its uses).

Lexical scoping is very useful with higher order code -- we can store
and pass the newly created functions (e.g. ``(map (adder x) '(1 2
3))``), and be certain that they will keep using our local
variables. It also allows us to use the lexical closure as *state*,
making the code somewhat object-oriented: ::

   ; A counter with internal state
   (let (count 0)
     (define (counter)
        (set! count (+ 1 count))))

   (counter) ; -> 1
   (counter) ; -> 2
   (counter) ; -> 3


`Function code
<https://github.com/nishio/LISP-on-browser/blob/40c2ddf0d45ef477d5eedd10ad328caf004a9e7b/lisp-eval.js>`_
(look at ``lambda`` nad ``define`` handling)

Macros
======

Finally, the main feature of Lisp -- macros. A macro is a special kind
of function that operates on unevaluated arguments, before evaluating
the code. The process is called *macroexpansion*.

The ``defmacro`` form is implemented in a very similar way to
``define``. It reads the code as if it was a normal function, but puts
the resulting ``Func`` in a special dictionary called ``lisp.macros``.

We first implement a ``macroExpandOne`` function that performs one
step of macroexpansion (to expand the code fully, we invoke it
repeatedly). The function tries to expand the first element of a form,
then the form itself, then all other elements. We also omit
quoted expressions. For instance, in the code ``(a b '(c
d) (e f))``, we will try to

- expand ``a`` -- it's not a list so nothing happens,
- expand ``(a b (c d))``, if ``a`` is a macro,
- expand ``b`` -- it's not a list,
- expand ``'(c d)`` -- it's quoted so we omit it,
- expand ``(e f)``, if ``c`` is a macro.

`Defmacro and macroexpansion code
<https://github.com/nishio/LISP-on-browser/commit/9c82177001d907aa3e8cb4c44a8b076988c53267>`_

A `later version of environment
<https://github.com/nishio/LISP-on-browser/commit/1d6ae128a83cc4bb8cac5c87084d0491c888ae19>`_
puts the macros in ordinary ``lisp.env``, under special names
``macro:name``.

Quasiquoting
============

Quasiquoting is a very convenient feature that allows writing Lisp
macros more easily. The code ```(a b ,c)`` means that ``a`` and ``b``
are to be read literally, and ``c`` has to be evaluated
(unquoted). The result is a simple 'template' for writing code, for
instance ``(and ,x ,y)``.

It's easy to extend the parser to handle this syntax - just like
``quote``, we simply translate ````` to forms with ``quasiquote`` and
``,`` to ``unquote``. However, extending the evaluator and
macroexpansion is harder.

The complication comes from the fact that quasiquotes can be
nested. This is occasionally useful in *macro-defining macros* -- the
topic is described in depth in Paul Graham's book `On Lisp
<http://www.paulgraham.com/onlisp.html>`_, chapter 16.

To evaluate nested quasiquotes, we need to consider the *quotation
level* of the code - for example, in ````(a ,b ,,c)``, ``a`` has
level 2, ``b`` has level 1, and ``c`` has level 0 (and ``c`` is the
only code that gets evaluated). The ``lisp.evalQuasi`` function does
this processing.

The quotation level also has to be considered during macroexpansion --
we only macroexpand the code that will be immediately evaluated
(i.e. at level 0).

`Quasiquote evaluation code
<https://github.com/nishio/LISP-on-browser/commit/ca660400804e6b2adac581ee2edc1800ecc515d5>`_

`Handling quasiquotes in macros
<https://github.com/nishio/LISP-on-browser/commit/d291571bfb095c784d7b92e104b90213b9ea8691>`_
