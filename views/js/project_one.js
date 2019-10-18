
var lexer_syntax = { //Predefined syntax for regex matching
  keywords: {
    priority: 5,
    values: /\b^print$|\b^while$|\b^if$|\b^int$|\b^string$|\b^boolean$|\b^false$|\b^true$|^={2}$|^\!\=$/g
  },
  id: {
    priority: 4,
    values: /^[a-z]{1}$/
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
    values: /^[a-z]$/
  },
  comment: {
    priority: 0,
    values: /(\/\*)(.)+(\*\/)$/sg
  }
}

var lexer_index = { //Index for token generateion + output
  'print': 'PRINT_STMT',
  'while': 'WHILE_STMT',
  'if': 'IF_STMT',
  '(': 'L_PAREN',
  ')': 'R_PAREN',
  '"': 'QUOTE',
  '+': 'PLUS',
  '*': 'ASTERISK',
  '=': 'ASSIGN_OP',
  '==': 'IS_EQUAL',
  '!=': 'NOT_EQUAL',
  'int': 'INT_DECL',
  'string': 'STRING_DECL',
  'boolean': 'BOOL_DECL',
  'true': 'BOOL_TRUE',
  'false': 'BOOL_FALSE',
  '\n': 'WHITESPACE',
  '{': 'L_BRACE',
  '}': 'R_BRACE',
  '$': 'EOP'
}


var lastToken = {};

function lexer(input) {
  document.querySelector('#output').innerHTML = ''; //Clear Output

  var bestCandidate = { //Set default best candidate
    key: null,
    priority: -1,
    value: '',
    col: 0,
    row: 0,
    endIndex: 0
  }

  var programs = [];
  var temp = input.split('$'); //Divide up the programs
  temp.forEach((t, i) => { //Add EOP[$] since js string.split emilinated the delimiter
    if(t != '') {
      t += '$';
      programs.push(t);
    }
  });

  var row = 0;
  programs.forEach((p, id) => {
    var start = 0; //Current position when generating string for best candidate
    var end = 0;
    var col = 0;
    var currentString = p.substring(start, end+1); //Create string to compare against indexed rules
    var didUpdate = false;
    var quotes = 0;
    var error = false;

    output(`${id > 0 ? '\n' : ''}INFO LEXER - Lexing program ${id}...`);
    console.log(`${id > 0 ? '\n' : ''}INFO LEXER - Lexing program ${id}...`);

    while(start < p.length && !error) {

      if(p[start].match(/\r|\n/)) { //If identified white space, increment the row count
        row++;
        col = 0;
        end++;
      }else {
          if(lastToken.value === '\"') {
            quotes++;
          }

          if(quotes > 0 && quotes%2 === 0) { //Detect and build strings
            while(p[end+1] != '\"') {
              currentString = p.substring(start, end+1);
              if(p[end] === '\n' || p[end].match(/([A-Z]|[0-9])/g)) { //Catch errors in strings
                error = true;
                output(`ERROR LEXER - Unexpected Character [${JSON.stringify(p[end])}] at (${row}:${col}) via 102`);
                break;
              }
              end++;
            }

            bestCandidate.key = 'STRING';
            bestCandidate.priority = 1;
            bestCandidate.value = currentString;
            bestCandidate.col = col;
            bestCandidate.row = row;
            bestCandidate.endIndex = end;
            didUpdate = true;

            start = end;
            end++;

          }else { //Otherwise build tokens
            while(end <= p.length) {
              currentString = p.substring(start, end+1);
              Object.keys(lexer_syntax).forEach((key) => {
                if(currentString.match(lexer_syntax[key].values)) { //If a pattern is identified
                  if(bestCandidate.priority < lexer_syntax[key].priority) { //Update bestCandidate to alwasy have highest priority possible
                    bestCandidate.key = key.toUpperCase();
                    bestCandidate.priority = lexer_syntax[key].priority;
                    bestCandidate.value = currentString;
                    bestCandidate.col = col;
                    bestCandidate.row = row;
                    bestCandidate.endIndex = end;
                    didUpdate = true;
                  }
                }
              });
              if(didUpdate) { //If there was an update to bestCandidate, that means all subsets of the candidate are not as prioritized
                start = bestCandidate.endIndex;
              }
              end++;
            }
          }

          col += bestCandidate.value.length;

          if(didUpdate && !error) {
            //console.log(`LAST TOKEN: ${lastToken.value}`);
            //console.log(`CURRENT TOKEN: ${bestCandidate.value}`);
            createToken(bestCandidate);
          }else { //Catch errors for characters/symbols that do not exist in grammar
            error = true;
            var errorChar;
            for(var i = 0; i < currentString.length; i++) {
              if(!currentString[i].match(/\s/)) {

                output(`ERROR LEXER - Unexpected Character [ ${currentString[i]} ] at (${row}:${col+i}) via 160`);
                console.log(JSON.stringify(currentString), currentString.split(/\n/).length - 1)
                row += currentString.split(/\n/).length - 1;
                break;
              }
            }
            console.log('ERROR');
          }
      }

      start++; //Start looking for new keyphrase
      end = start;
      didUpdate = false;
      bestCandidate = { //Reset bestCandidate
        key: null,
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
  var val = `   DEBUG LEXER - ${lexer_index[bestCandidate.value] ? `${lexer_index[bestCandidate.value]} [ ${bestCandidate.value} ]` : `${bestCandidate.key} [ ${bestCandidate.value} ]`} found at (${bestCandidate.row}:${bestCandidate.col})`
  tokens.push({
    text: val,
    value: bestCandidate.value,
    key: bestCandidate.key,
    row: bestCandidate.row,
    col: bestCandidate.col
  });
  lastToken = tokens[tokens.length-1];
  output(val);
}

function output(info) { //Print to screen
  document.querySelector('#output').innerHTML += `\n${info}`;
}

function start() { //Initialize with example programs
  //document.querySelector('#input').value = "{}$\n\n{{{{{{}}}}}}$\n\n{{{{{{}}} /* comments are ignored */ }}}}$\n\n{ /* comments	are	still	ignored	*/ int @}$\n\n{\nint a\na = a\nstring b\na = b\n}$"
  document.querySelector('#input').value = "{\n~@#%^&*_+{}|:<>?[];',./\nbool ean d\n}$\n\n{\nint A\n}$\n\n{intfintif=2}$";
}
start();
