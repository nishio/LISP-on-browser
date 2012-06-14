// REPL - using the jQuery Terminal script

lisp.repl_terminal = function(selector) {
    $(selector).terminal(
        function(str, terminal) {
            try {
                var term = lisp.parse(str);
                if (term != null) {
                    terminal.echo(term.print());
                    terminal.echo('');
                }
            } catch (err) {
                terminal.error(err);
                terminal.echo('');
            }
        },
        {
            greetings: "LISP Interpreter. Type 'clear' to clear",
            prompt: '> ',
        });
};

