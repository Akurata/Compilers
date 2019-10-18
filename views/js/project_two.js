

function cst() {
  this.root = null;
  this.current = {children: []};

  this.addBranch = (token) => {
    //console.log('\n');
    //console.log(token);
    //console.log('\n');

    var node = this.node(token);
    if(!this.root) {
      this.root = node;
    }else {
      node.parent = this.current;
      this.current.children.push(node);
    }
    this.current = node;
  }

  this.node = (token, parent) => {
    return {
      key: token.key,
      token: token,
      value: token.value,
      parent: parent,
      children: []
    };
  }
}



var cst = new Tree();

function cstView() {
  this.root = {name: 'Root', children: [], parent: null};
  this.current = this.root;

  this.addNode = (name) => {
    var node = {
      name: name,
      children: [],
      parent: this.current
    }
    this.current.children.push(node)
  }


}

var shift = [];

function matchConsume(values) {
  var valid = true;

  for(var i = 0; i < values.length; i++) {

    //console.log(tokenSet[0].value, (typeof values[i] === 'function') ? 'func' : values[i]);

    if(tokenSet[0].value.match((typeof values[i] === 'function') ? values[i]() : values[i]) && valid) {

      console.log(`CONSUME - ${tokenSet[0].value}`);

      shift.push(tokenSet.shift());

    }else {
      valid = false;
      break;
    }

    //console.log(`Valid:${valid}`)
  }

  return valid;
}




var tokenSet;

function parse(programTokens, p) {
  cst = new Tree();
  cst.addNode(`Program ${p}`, 'branch');

  tokenSet = programTokens;
  //console.log(programTokens);
  //console.log(tokens[p]);
  //console.log(cst);

  outputParse(`${id > 0 ? '\n' : ''}INFO PARSER - Parsing program ${p}...`);
  //console.log(`${id > 0 ? '\n' : ''}INFO PARSER - Parsing program ${p}...`);

  var check = matchConsume([program]);
  //console.log(check);

  outputParse(`INFO PARSER - Successfully completed parsing program ${p}`);
  outputCST(cst.toString());
}






function program() {
  //console.log('PARSE PROGRAM');
  outputParse(`  DEBUG PARSER - program()`);
  return matchConsume([block, '$']);
}


function block() {
  console.log('PARSE BLOCK');
  outputParse(`  DEBUG PARSER - block()`);
  if(matchConsume(['{', statementList, '}'])) {
    console.log('THERE IS BLOCK')
    cst.addNode('Block', 'branch');
    //cst.addNode('{');

    //cst.addNode('StatementList', 'branch');
    //cst.endChildren();

    //cst.addNode('}');
    //cst.endChildren();
    return true;
  }else {
    return false;
  }

}


function statementList() {
  //console.log('PARSE STATEMENT LIST');
  outputParse(`  DEBUG PARSER - statementList()`);
  if(matchConsume([statement, statementList])) {
    console.log('THERE IS STATEMENT LIST WITH S')
    cst.addNode('Statement', 'branch');
    cst.addNode('StatementList', 'branch');
    return true;
  }else {
    console.log('THERE IS STATEMENT LIST WITH E')
    //cst.endChildren();
    return '';
  }

}


function statement() {
  //console.log('PARSE STATEMENT');
  outputParse(`  DEBUG PARSER - statement()`);
  if(matchConsume([printStatement])) {
    return true;
  }else if(matchConsume([assignmentStatement])) {
    return true;
  }else if(matchConsume([varDecl])) {
    return true;
  }else if(matchConsume([whileStatement])) {
    return true;
  }else if(matchConsume([ifStatement])) {
    return true;
  }else if(matchConsume([block])) {
    return true;
  }else {
    return false;
  }
}


function printStatement() {
  //console.log('PARSE PRINT STATEMENT');
  outputParse(`  DEBUG PARSER - printStatement()`);
  if(matchConsume(['print', /^(\()$/, expr, /^(\))$/])) {
    return true;
  }else {
    console.log('THERE IS NOT PRINT')
    return false;
  }
}


function assignmentStatement() {
  //console.log('PARSE ASSIGNMENT STATEMENT');
  outputParse(`  DEBUG PARSER - assignmentStatement()`);
  return matchConsume([id, /\=/, expr]);
}


function varDecl() {
  //console.log('PARSE VAR DECL');
  outputParse(`  DEBUG PARSER - varDecl()`);
  return matchConsume([type, id]);
}


function whileStatement() {
  //console.log('PARSE WHILE STATEMENT');
  outputParse(`  DEBUG PARSER - whileStatement()`);
  return matchConsume(['while', booleanExpr, block]);
}


function ifStatement() {
  //console.log('PARSE IF STATEMENT');
  outputParse(`  DEBUG PARSER - ifStatement()`);
  return matchConsume(['if', booleanExpr, block]);
}


function expr() {
  //console.log('PARSE EXPR');
  outputParse(`  DEBUG PARSER - expr()`);
  if(matchConsume([intExpr])) {
    return true;
  }else if(matchConsume([stringExpr])) {
    return true;
  }else if(matchConsume([booleanExpr])) {
    return true;
  }else if(matchConsume([id])) {
    return true;
  }else {
    return false;
  }
}


function intExpr() {
  //console.log('PARSE INT EXPR');
  outputParse(`  DEBUG PARSER - intExpr()`);
  if(matchConsume([digit, intOp, expr])) {
    return true;
  }else if(matchConsume([digit])) {
    return true;
  }else {
    return false;
  }
}


function stringExpr() {
  //console.log('PARSE STRING EXPR');
  outputParse(`  DEBUG PARSER - stringExpr()`);
  return matchConsume(['\"', charList, '\"']);
}


function booleanExpr() {
  //console.log('PARSE BOOLEAN EXPR');
  outputParse(`  DEBUG PARSER - booleanExpr()`);
  return matchConsume([/^(\()$/, expr, /^(\))$/]);
}


function id() {
  //console.log('PARSE ID');
  outputParse(`  DEBUG PARSER - id()`);
  return matchConsume([char]);
}


function charList() {
  //console.log('PARSE CHAR LIST');
  outputParse(`  DEBUG PARSER - charList()`);
  if(matchConsume([char(), charList()])) {
    return true;
  }else if(matchConsume([space(), charList()])) {
    return true;
  }else {
    return false;
  }
}


function type() {
  //console.log('PARSE TYPE');
  outputParse(`  DEBUG PARSER - type()`);
  return matchConsume([/^(int|string|boolean)$/]);
}


function char() {
  //console.log('PARSE CHAR');
  outputParse(`  DEBUG PARSER - char()`);
  return matchConsume([/^[a-z]$/]);
}


function space() {
  //console.log('PARSE SPACE');
  outputParse(`  DEBUG PARSER - space()`);
  return matchConsume([/\s/]);
}


function digit() {
  //console.log('PARSE DIGIT');
  outputParse(`  DEBUG PARSER - digit()`);
  return matchConsume([/^[0-9]$/]);
}


function boolOp() {
  //console.log('PARSE BOOL OP');
  outputParse(`  DEBUG PARSER - boolOp()`);
  return matchConsume([/^(==|!=)$/]);
}

function boolVal() {
  //console.log('PARSE BOOL VAL');
  outputParse(`  DEBUG PARSER - boolVal()`);
  return matchConsume([/^(false|true)$/]);
}


function intOp() {
  //console.log('PARSE INT OP');
  outputParse(`  DEBUG PARSER - intOp()`);
  return matchConsume([/^\+$/]);
}
