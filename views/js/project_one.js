
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
    values: /^[a-z\s]$/
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
  '\n': 'NEW_LINE',
  '\s': 'SPACE',
  '{': 'L_BRACE',
  '}': 'R_BRACE',
  '$': 'EOP'
}

var lastToken = {};
var tokens = {};

function lex(input) {
  resetAll();
  tokens = {};
  lastToken = {};
  document.querySelector('#output_lex').innerHTML = ''; //Clear Output
  document.querySelector('#output_parse').innerHTML = ''; //Clear Output

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

    outputLex(`${id > 0 ? '\n' : ''}INFO LEXER - Lexing program ${id}...`);
    console.log(`${id > 0 ? '\n' : ''}INFO LEXER - Lexing program ${id}...`);

    while(start < p.length && !error) {

      if(p[start].match(/\r|\n/)) { //If identified white space, increment the row count
        row++;
        col = 0;
        end++;
      }else {
        //console.log(start, end, p[start], lastToken.value)
        if(p[start] === '\"') { //lastToken.value
          quotes++;
        }

        if(quotes > 0 && quotes%2 !== 0) { //Detect and build strings
          if(p[end].match(/([A-Z]|[0-9])/g)) { //Catch errors in strings
            console.log('err 1')
            error = true;
            outputLex(`ERROR LEXER - Unexpected Character [${JSON.stringify(p[end])}] at (${row}:${col}) via 105`);
            break;
          }

          bestCandidate.key = 'CHAR';
          bestCandidate.priority = 1;
          bestCandidate.value = p[end];
          bestCandidate.col = col;
          bestCandidate.row = row;
          bestCandidate.endIndex = end;
          didUpdate = true;

          start = end;
          if(p[end+1] == "$") {
            console.log('err 2')
            error = true;
            outputLex(`ERROR LEXER - Unterminated string at (${row}:${col}) via 105`);
            break;
          }else {
            end++;
          }

        }else { //Otherwise build tokens

          if(p[start].match(/\S/)) {
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
          }else {
            end++;
          }

        }

        col += bestCandidate.value.length;

        if(didUpdate && !error) {
          //console.log(`LAST TOKEN: ${lastToken.value}`);
          //console.log(`CURRENT TOKEN: ${bestCandidate.value}`);
          createToken(bestCandidate, id);
        }else if(currentString[0].match(/\s/)) { //Catch errors
          //Do nothing?
        }else if(p[start].match(/\S/)) {
          console.log('err 3')
          error = true;
          for(var i = 0; i < currentString.length; i++) {
            if(!currentString[i].match(/\s/)) {
              outputLex(`ERROR LEXER - Unexpected Character [ ${currentString[i]} ] at (${row}:${col+i}) via 156`);
              row += currentString.split(/\n/).length - 1;
              break;
            }
          }
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
    if(!error) {
      outputLex(`INFO LEXER - Successfully completed lexing program ${id}`);
      console.log(Object.assign({}, tokens[id]));
      parse(tokens[id], id);
    }
  });
}

function createToken(bestCandidate, program) {
  var val = `   DEBUG LEXER - ${lexer_index[bestCandidate.value] ? `${lexer_index[bestCandidate.value]} [ ${bestCandidate.value} ]` : `${bestCandidate.key} [ ${bestCandidate.value} ]`} found at (${bestCandidate.row}:${bestCandidate.col})`
  var token = {
    value: bestCandidate.value,
    priority: bestCandidate.priority,
    key: bestCandidate.key,
    row: bestCandidate.row,
    col: bestCandidate.col
  };

  if(!tokens[program]) {
    tokens[program] = [];
  }

  if(token.key !== 'COMMENT') {
    tokens[program].push(token);
    lastToken = token;
    outputLex(val);
  }

}

function outputLex(info) { //Print to screen
  document.querySelector('#output_lex').innerHTML += `\n${info}`;
}

function outputParse(info) { //Print to screen
  document.querySelector('#output_parse').innerHTML += `\n${info}`;
}

function outputCST(info) {
  document.querySelector('#output_cst').innerHTML += `\n${info}`;
}

function outputSA(info) {
  document.querySelector('#output_sa_errors').innerHTML += `\n${info}`;
}

function outputCodeLog(info) {
  document.querySelector('#output_code_log').innerHTML += `\n${info}`;
}

function outputCodeGen(info) {
  document.querySelector('#output_code').innerHTML += ` ${info}`;
}

function copyCode() {
  var copyText = document.getElementById('output_code');
  copyText.select();
  copyText.setSelectionRange(0, 99999); /*For mobile devices*/
  document.execCommand("copy");
  notification("Copied!", "top", "right", "success");
}

/**
 * JQuery NotifyJS handler.
 * @function
 * @param { String } msg Text to be displayed on notification.
 * @param { String } from Direction for notification window to come from. One of: {top, bottom, left, right}.
 * @param { String } align Where to position notification window One of: {left, right, center}.
 * @param { String } type General bootstrap standard style tag for displaying modal, and determining its icon One of: {success, danger, info, primary}.
 * @see https://notifyjs.jpillora.com/
*/
function notification(msg, from, align, type) {
  $.notify({
      message: msg
  },{
      type: type,
      timer: 4000,
      placement: {
          from: from,
          align: align
      }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('#input').value = `{
    int a
    a = 0
    string z
    z = "bond"
    while (a != 9) {
       if (a != 5) {
           print("bond")
       }
       {
           a = 1 + a
           string b
           b = "james bond"
           print(b)
       }
    }
    {}
    boolean c
    c = true
    boolean d
    int b
    b = 7
    d = (true == (true == false))
    d = (a == b)
    d = (1 == a)
    d = (1 != 1)
    d = ("string" == z)
    d = (z != "string")
    d = ("string" != "string")
    if (d == true) {
        int c
        c = 1 + b
        if (c == 1) {
            print("ugh")
        }
    }
    while ("string" == z) {
        while (d == true) {
            a = 1 + b
        }
    }
}$`
});
/*

{
	if (true == true) {
		print("stringcheck")
	}
	print(" ")
	if (true != false) {
		print("noequal")
	}
}$

  `/* This statement shows that addition
- checking and printing are both valid
- options that can be performed. Credit: Tien
- Result: 666addition checkfalse
{
int a
if (1+1+1+1+1 == 2+3) {
print("addition check")
}
while (a != 3) {
print(1 + 2 + 3)
a = 1 + a
}
if (1+5+3 != 8) {
print(false)
}
} $`//"{stringaa=\"hello\"print(a)}$";

**/

function resetAll() {
  document.querySelector('#output_lex').innerHTML = "";
  document.querySelector('#output_parse').innerHTML = "";
  document.querySelector('#output_cst').innerHTML = "";
  document.querySelector('#output_sa_errors').innerHTML = "";
  document.querySelector('#output_code_log').innerHTML = "";
  document.querySelector('#output_code').innerHTML = "";
  var saWrap = document.querySelector('#output_symbol_table');
  while(saWrap.hasChildNodes()) {
    saWrap.removeChild(saWrap.firstChild);
  }
  cstTree;
  tokenSet;
  curr = 0;
  context = 0;
  cst = {};
  edges = [];
  list = [];
  start = 0;
  charArray = [];
  ast = new stem('Root');
  current = ast;
  scopes = [];
  refs = [];
  cpu = new x6502();
  jump = new JumpTable();
  codeScope = new ScopeTable();
  code = new Code();
  tempAddrCount = 0;
}
