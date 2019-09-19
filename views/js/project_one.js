
var lexer_syntax = {
  keywords: {
    priority: 5,
    values: /\b^print$|\b^while$|\b^if$|\b^int$|\b^string$|\b^boolean$|\b^false$|\b^true$|\b^==$|\b^!=$/g
  },
  id: {
    priority: 4,
    values: /^[A-z]{1}$/
  },
  symbol: {
    priority: 3,
    values: /^\{$|^\}$|^\($|^\)$|^\"$|^\=$|^\!$|^\+$|^\$$/
  },
  digit: {
    priority: 2,
    values: /^[0-9]$/
  },
  char: {
    priority: 1,
    values: /^[A-z]$/
  },
  comment: {
    priority: 0,
    values: /(\/\*).+(\*\/)$/g
  }
}

var lexer_index = {
  'print': 'PrintStatement',
  'while': 'WhileStatement',
  'if': 'IfStatement',
  '(': 'L_PAREN',
  ')': 'R_PAREN',
  '"': 'QUOTE',
  '*': 'ASTERISK',
  '=': 'ASSIGN_OP',
  '==': 'IS_EQUAL',
  '!=': 'NOT_EQUAL',
  'int': 'INT_DECL',
  'string': 'STRING_DECL',
  'boolean': 'BOOL_DECL',
  '\n': 'WHITESPACE',
  '{': 'L_BRACE',
  '}': 'R_BRACE',
  '$': 'EOP'
}





function lexer(input) {
  document.querySelector('#output').innerHTML = ''; //Clear Output
  var err = [];

  console.log(input)
  input = input.toLowerCase();
  //input = input.replace(/\s/g, '');

  var bestCandidate = {
    priority: -1,
    value: '',
    col: 0,
    row: 0,
    endIndex: 0
  }

  var programs = [];
  var temp = input.split('$'); //Divide up the programs
  console.log(temp)
  temp.forEach((t, i) => {
    if(t != '') {
      t += '$';
      programs.push(t);
    }
  });
  console.log(programs)

  var row = 0;
  programs.forEach((p, id) => {
    var start = 0;
    var end = 0;
    var col = 0;
    var currentString;



    console.log('PROGRAM: ' + id)
    output(`INFO LEXER - Lexing program ${id}...`);
    while(start < p.length) {
      if(p[start] == '\n') {
        //console.log(`WHITESPACE at ${row}`);
        row++;
        col = 0;
        end++;
      }else {
        while(end <= p.length) {
          currentString = p.substring(start, end+1);
          console.log(currentString)

          var didUpdate = false;
          Object.keys(lexer_syntax).forEach((key) => {
            if(currentString.match(lexer_syntax[key].values)) { //If a pattern is identified
              if(bestCandidate.priority < lexer_syntax[key].priority) { //Update bestCandidate to alwasy have highest priority possible
                bestCandidate.priority = lexer_syntax[key].priority;
                bestCandidate.value = currentString;
                bestCandidate.col = col;
                bestCandidate.row = row;
                bestCandidate.endIndex = end;
                didUpdate = true;

              }
            }
          });
          if(didUpdate) {
            start = bestCandidate.endIndex;
          }
          end++;
        }
        col++;
        if(bestCandidate.priority > 0) {
          createToken(bestCandidate);
        }


      }
      start++; //Start looking for new keyphrase
      //start = bestCandidate.endIndex;
      end = start;
      //start = end;
      bestCandidate = { //Reset bestCandidate
        priority: -1,
        value: '',
        col: 0,
        row: 0,
        endIndex: 0
      }
    }

  });


}

var tokens = [];
function createToken(bestCandidate) {
  output(`\tDEBUG LEXER - ${lexer_index[bestCandidate.value]} found at (${bestCandidate.row}:${bestCandidate.col})`)
  console.log(bestCandidate);
}


function output(info) {
  document.querySelector('#output').innerHTML += `\n${info}`;
}


function start() {
  document.querySelector('#input').value = "{}$\n\n{{{{{{}}}}}}$\n\n{{{{{{}}} /* comments are ignored */ }}}}$\n\n{ /* comments	are	still	ignored	*/ int @}$\n\n{\nint a\na = a\nstring b\na = b\n}$"
}
start();
