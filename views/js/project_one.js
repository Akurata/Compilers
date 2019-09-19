
var lexer_syntax = {
  keywords: {
    priority: 5,
    values: /\b^print$|\b^while$|\b^if$|\b^int$|\b^string$|\b^boolean$|\b^false$|\b^true$/g
  },
  id: {
    priority: 4,
    values: /^[A-z]{1}$/
  },
  symbol: {
    priority: 3,
    values: /^\{$|^\}$|^\($|^\)$|^\"$|^\=$|^\!$|^\+$|^\$$|^\/$|^\*$/
  },
  digit: {
    priority: 2,
    values: /^[0-9]$/
  },
  char: {
    priority: 1,
    values: /^[A-z]$/
  }
}

var lexer_index = {

}





function lexer(input) {
  var result = '';
  console.log(input)
  input = input.toLowerCase();
  input = input.replace(/\s/g, '');

  var bestCandidate = {
    priority: 0,
    value: '',
    endIndex: 0
  }

  var programs = input.split('$'); //Divide up the programs
  programs.forEach((p, i) => { //Row = programs[index] + 1
    programs[i] += '$';
  });

  programs.forEach((p, id) => {
    var start = 0;
    var end = 0;
    var currentString;

    output(`INFO LEXER - Lexing program ${id}...`)
    while(start <= p.length) {
      while(end <= p.length) {
        currentString = p.substring(start, end+1);
        Object.keys(lexer_syntax).forEach((key) => {
          if(currentString.match(lexer_syntax[key].values)) { //If a pattern is identified
            if(bestCandidate.priority < lexer_syntax[key].priority) { //Update bestCandidate to alwasy have highest priority possible
              bestCandidate.priority = lexer_syntax[key].priority;
              bestCandidate.value = currentString;
              bestCandidate.endIndex = end;
            }
          }
        });
        end++;
        //console.log(start, end);
      }
      createToken(bestCandidate);
      start++;
      end = start;
      bestCandidate = { //Reset bestCandidate
        priority: 0,
        value: '',
        endIndex: 0
      }
    }

  });


}


function createToken(bestCandidate) {
  console.log(bestCandidate);
}


function output(info) {
  document.querySelector('#output').innerHTML += `\n${info}`;
}


function start() {
  document.querySelector('#input').value = "{}$\n\n{{{{{{}}}}}}$\n\n{{{{{{}}} /* comments are ignored */ }}}}$\n\n{ /* comments	are	still	ignored	*/ int @}$\n\n{\nint a\na = a\nstring b\na = b\n}$"
}
start();
