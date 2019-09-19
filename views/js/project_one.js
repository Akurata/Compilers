
var lexer_syntax = {
  keywords: {
    priority: 5,
    values: /\bprint|\bwhile|\bif|\bint|\bstring|\bboolean|\bfalse|\btrue/g
  },
  id: {
    priority: 4,
    values: /[A-z]{1}/
  },
  symbol: {
    priority: 3,
    values: /\{|\}|\(|\)|\"|\=|\!|\+|\$|\/|\*/
  },
  digit: {
    priority: 2,
    values: /[0-9]/
  },
  char: {
    priority: 1,
    values: /[A-z]/
  }
}



function lexer(input) {
  var result = '';
  console.log(input)
  input = input.toLowerCase();
  input = input.replace(/\s/g, '');
  var currentChar = 0;
  var currentString = input.substring(0, currentChar + 1);

  var bestCandidate = {
    priority: 0,
    value: ''
  }

  var programs = input.split('$'); //Divide up the programs
  programs.forEach((p, i) => { //Row = programs[index] + 1
    programs[i] += '$';
  });
  console.log(programs)

  //while(input[currentChar] != '$') {






    Object.keys(lexer_syntax).forEach((key) => {
      if(currentString.match(lexer_syntax[key].values)) { //If a pattern is identified
        if(bestCandidate.priority < lexer_syntax[key].priority) { //Update bestCandidate to alwasy have highest priority possible
          bestCandidate.priority = lexer_syntax[key].priority;
          bestCandidate.value = currentString;
        }
      }
    });
  //}


  input = input.split('');

  console.log(findBestCandidate());


  result += input;

  //Output results;
  document.querySelector('#output').value = result;
}

function findBestCandidate(string, bestCandidate) {

  return bestCandidate;
}






function start() {
  document.querySelector('#input').value = "{}$\n\n{{{{{{}}}}}}$\n\n{{{{{{}}} /* comments are ignored */ }}}}$\n\n{ /* comments	are	still	ignored	*/ int @}$\n\n{\nint a\na = a\nstring b\na = b\n}$"
}
start();
