// REPL - using the jQuery Terminal script

// Install a LISP terminal in a given jQuery element
lisp.replTerminal = function(elt) {
    elt.terminal(
        function(str, terminal) {
            try {
                var term = lisp.parse(str);
                if (term != null) {
                    var result = term.eval();
                    terminal.echo(result.print());
                }
            } catch (err) {
                terminal.error(err);
            }
        },
        {
            greetings: "LISP Interpreter. Type 'clear' to clear",
            prompt: '> '
        });
    lisp.terminal = elt.terminal();
};

