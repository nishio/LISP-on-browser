// REPL - using the jQuery Terminal script

// Install a LISP terminal in a given jQuery element
lisp.replTerminal = function(elt) {
    elt.terminal(
        function(str, terminal) {
            try {
                var term = lisp.parse(str);
                if (term != null) {
                    var result = term.eval(lisp.env);
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

// Clicking 'button' will load 'source' to the interpreter
lisp.replLoader = function(source, button) {
    button.click(
        function() {
            lisp.terminal.echo('Loading source...');
            var parser = new lisp.Parser(source.val());
            try {
                while (!parser.empty()) {
                    var term = parser.readTerm();
                    if (term != null) {
                        var result = term.eval(lisp.env);
                        lisp.terminal.echo(result.print());
                    } else { // term == null
                        if (!parser.empty())
                            parser.parseError();
                    }
                }
            } catch(err) {
                console.log(err);
                lisp.terminal.error(err);
            }
        });
};
