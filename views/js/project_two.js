
var currentIndex = 0;
function node(token, value) {
  this.node = {};
  this.node.id = currentIndex++;
  this.node.token = token;
  this.node.text = {
    name: `${value}`,
  };

  this.node.parent = {};
  this.node.children;

  this.node.appendChild = (child) => {
    //console.log('APPEND CHILD')
    //console.log(this.node)
    //console.log(child)
    if(!this.node.children) {
      this.node.children = [];
    }
    this.node.children.push(child);
    child.parent = this.node;
  }

  this.node.setParent = (parent) => {
    this.parent = parent;
    parent.appendChild(this.node);
  }

  this.node.nextNode = () => {
    console.log(this.node)
    var pool = this.node.parent.children;
    console.log(pool)
    return pool.find((item, i) => {if(item === this.node) {return pool[i+1];}});
  }

  return this.node;
}


function edge(from, to) {
  var edge = {};
  edge.from = from;
  edge.to = to;
  return edge;
}

var cstContainer = document.querySelector('#output_cst');
var options = {
  layout: {
    hierarchical: {
      enabled: true,

    }
  }
}


var shift = [];
/*
function matchConsume(values) {
  var valid = true;

  for(var i = 0; i < values.length; i++) {

    //console.log(tokenSet[0].value, (typeof values[i] === 'function') ? 'func' : values[i]);

    if(tokenSet[0].value.match((typeof values[i] === 'function') ? values[i]() : values[i]) && valid) {

      //console.log(`CONSUME - ${tokenSet[0].value}`);
      //console.log()
      shift.push(tokenSet.shift());
      console.log(Object.assign({}, tokenSet))
      //console.log(shift)

    }else {
      valid = false;
      break;
    }

    //console.log(`Valid:${valid}`)
  }

  return valid;
}*/


var tokenSet;
var cst = {};
var edges = [];
function parse(programTokens, p) {
  tokenSet = programTokens; //Update tokens refernce
  console.log(JSON.parse(JSON.stringify(tokenSet)));

  outputParse(`${id > 0 ? '\n' : ''}INFO PARSER - Parsing program ${p}...`);
  var result = match([program]);
  if(result.isValid) {
    cst = result.nodes[0].node;
  }else {
    outputParse(`${id > 0 ? '\n' : ''}INFO PARSER - Encountered fatal errors when parsing program ${p}...`);
    console.log('No program??')
  }

  outputParse(`INFO PARSER - Completed parsing program ${p}`);
  console.log(cst)
  //cst =
  //new vis.Network(cstContainer, cst, options)

  new Treant({
    chart: {
      container: '#output_cst'
    },
    nodeStructure: cst
  });

  //outputCST(cst.toString());

  //var nodes = new vis.DataSet([]);
  //var edges = new vis.DataSet([]);
  //cst.setData({nodes:nodes, edges:edges});
}

var context = 0;

var curr = 0;
function match(targetTokens) {

  //tokenSet = Object.assign([], tokenSet);
  var valid = {
    isValid: true,
    epsilon: null,
    nodes: []
  };
  //console.log(`MATCH: ${typeof targetTokens[curr]}`)
  console.log(targetTokens)


  for(var i = 0; i < targetTokens.length; i++) {
    console.log(`CURR = ${curr}`)

    var check = null;
    var target = null;
    var isTerminal = typeof targetTokens[i] === 'function';
    if(isTerminal) {
      target = targetTokens[i]();
      if(target) {
        check = true;
      }else {
        check = false
      }
    }else if(curr > tokenSet.length) {
      check = false;
    }else {
      check = tokenSet[curr].value.match(targetTokens[i]);
    }

    if(check) {
      console.log('MATCHED', targetTokens[i])
      console.log(check, target)
      if(target) {
        valid.nodes.push({node: target})
      }else {
        valid.nodes.push({target: targetTokens[i], token: tokenSet[curr]})
        curr++;
      }

    }else {
      valid.nodes.forEach((node) => {
        valid.nodes.pop();
        curr--;
      });

      valid.isValid = false;
      console.log(`FAILED`, targetTokens, check)
      break;
    }

  }
  console.log(valid)
  return valid;
}





/*
    var isTerminal = typeof targetTokens[i] === 'function';

    //check.unshift(tokenSet.shift());
    console.log(curr)
    console.log(tokenSet)

    var matchResult;
    if(isTerminal) {
      valid.res = targetTokens[i]();
    }else {
      valid.res = tokenSet[curr].value.match(targetTokens[i])
    }

    if(valid.res) {
      console.log('MATCHED', targetTokens[i])
      //console.log(JSON.parse(JSON.stringify(cst.currentNode)));
      console.log('TO', tokenSet[curr])
    }else {
      valid.epsilon = true;
      valid.isValid = false;
      //curr = curr - i
    }


    curr++;

    if(valid.isValid) {
      targetTokens.forEach((target) => {

        valid.nodes.push({target: target, token: tokenSet[curr-1]});
      });
    }

*/





function program() {
  console.log('PARSE PROGRAM');

  var index = context++;
  outputParse(`${indent(index)}TRY - program()`);
  var result = match([block, '$']);
  if(result.isValid) {
    outputParse(`${indent(index)}SUCCESS - program()`);
    context--;

    console.log(result)
    var programVal = new node('', 'Program');
    programVal.appendChild(result.nodes[0].node)

    return programVal;
  }else {
    outputParse(`${indent(index)}FAIL - program()`);
    context--;
    return false;
  }
}


function block() {
  console.log('PARSE BLOCK');

  var index = context++;
  outputParse(`${indent(index)}TRY - block()`);
  var result = match(['{', statementList, '}']);
  if(result.isValid) {
    outputParse(`${indent(index)}SUCCESS - block()`);
    context--;

    console.log(result)
    var block = new node('', 'Block');
    block.appendChild(new node(result.nodes[0].token, result.nodes[0].token.value));
    block.appendChild(result.nodes[1].node);
    block.appendChild(new node(result.nodes[2].token, result.nodes[2].token.value));

    return block;
  }else {
    outputParse(`${indent(index)}FAIL - block()`);
    context--;
    return false;
  }

}
//{intaa=1}

function statementList() {
  console.log('PARSE STATEMENT LIST');

  var index = context++;
  outputParse(`${indent(index)}TRY - statementList()`);
  var result = match([statement, statementList]);
  console.log(result)
  //if(result.)

  var stmtList = new node('', 'StatementList');
  if(result.isValid) {
    outputParse(`${indent(index)}SUCCESS - statementList()`);
    context--;
    //edges.push(edge(currentIndex, currentIndex+1));

    stmtList.appendChild(result.nodes[0].node);
    stmtList.appendChild(result.nodes[1].node);

  }else {
    outputParse(`${indent(index)}FAIL - statementList() [Epsilon]`);
    context--;

    console.log(result.epsilon)
    var eps = new node('', '\u03B5')
    stmtList.appendChild(eps);

  }

  return stmtList;

}


function statement() {
  console.log('PARSE STATEMENT');

  var index = context++;
  outputParse(`${indent(index)}TRY - statement()`);
  var stmt = new node('', 'Statement');

  var printVal = printStatement();
  if(printVal) {
    outputParse(`${indent(index)}SUCCESS - statement()`);
    context--;

    stmt.appendChild(printVal);
    return stmt;
  }

  if(match([assignmentStatement]).isValid) {
    outputParse(`${indent(index)}SUCCESS - statement()`);
    context--;

    stmt.appendChild(cst.currentNode);
    cst.currentNode = stmt;
    return true;
  }

  if(match([varDecl]).isValid) {
    outputParse(`${indent(index)}SUCCESS - statement()`);
    context--;

    stmt.appendChild(cst.currentNode);
    cst.currentNode = stmt;
    return true;
  }

  if(match([whileStatement]).isValid) {
    outputParse(`${indent(index)}SUCCESS - statement()`);
    context--;

    stmt.appendChild(cst.currentNode);
    cst.currentNode = stmt;
    return true;
  }

  if(match([ifStatement]).isValid) {
    outputParse(`${indent(index)}SUCCESS - statement()`);
    context--;

    stmt.appendChild(cst.currentNode);
    cst.currentNode = stmt;
    return true;
  }

  if(match([block]).isValid) {
    outputParse(`${indent(index)}SUCCESS - statement()`);
    context--;

    stmt.appendChild(cst.currentNode);
    cst.currentNode = stmt;
    return true;
  }

  //Default
  outputParse(`${indent(index)}FAIL - statement()`);
  context--;

  //console.log(cst)
  //var eps = new node('', '\u03B5')
  return false;//E????
}


function printStatement() {
  console.log('PARSE PRINT STATEMENT');

  var index = context++;
  outputParse(`${indent(index)}TRY - printStatement()`);
  var result = match(['print', /\(/, expr, /\)/]);
  console.log(result)
  if(result.isValid) {
    outputParse(`${indent(index)}SUCCESS - printStatement()`);
    context--;
    var printStmt = new node('', 'Print Statement');
    printStmt.appendChild(new node(result.nodes[0].token, result.nodes[0].token.value));
    printStmt.appendChild(new node(result.nodes[1].token, result.nodes[1].token.value));
    printStmt.appendChild(result.nodes[2].node);
    printStmt.appendChild(new node(result.nodes[3].token, result.nodes[3].token.value));
    //cst.currentNode = printStmt;
    console.log(printStmt)
    return printStmt;
  }else {
    outputParse(`${indent(index)}FAIL - printStatement()`);
    context--;
    return false;
  }
}


function assignmentStatement() {
  console.log('PARSE ASSIGNMENT STATEMENT');

  var index = context++;
  outputParse(`${indent(index)}TRY - assignmentStatement()`);
  var result = match([id, /\=/, expr]);
  if(result.isValid) {
    outputParse(`${indent(index)}SUCCESS - assignmentStatement()`);
    context--;

    var assStmt = new node('', 'Assignment Statement');
    assStmt.appendChild(result.nodes[0].node);
    assStmt.appendChild(result.nodes[1].token, result.nodes[1].token.value);
    assStmt.appendChild(result.nodes[2].node);

    return assStmt;
  }else {
    outputParse(`${indent(index)}Fail - assignmentStatement()`);
    context--;
    return false;
  }

}


function varDecl() {
  console.log('PARSE VAR DECL');

  var index = context++;
  outputParse(`${indent(index)}TRY - varDecl()`);
  var result = match([type, id]);
  if(result.isValid) {
    outputParse(`${indent(index)}SUCCESS - varDecl()`);
    context--;

    var varDecStmt = new node('', 'Var Decl');
    varDecStmt.appendChild(result.nodes[0].node);
    varDecStmt.appendChild(result.nodes[1].node);

    return varDecStmt;
  }else {
    outputParse(`${indent(index)}Fail - varDecl()`);
    context--;
    return false;
  }
}


function whileStatement() {
  console.log('PARSE WHILE STATEMENT');

  var index = context++;
  outputParse(`${indent(index)}TRY - whileStatement()`);
  var result = match(['while', booleanExpr, block]);
  if(result.isValid) {
    outputParse(`${indent(index)}SUCCESS - whileStatement()`);
    context--;

    var whileStmt = new node('', 'While Statement');
    var whileVal = new node(result.tokens[0], result.tokens[0].value);
    var boolEx = new node('', 'Boolean Expression');
    boolEx.appendChild(cst.currentNode);
    var blockStmt = new node('', 'Block');

    whileStmt.appendChild(whileVal);
    whileStmt.appendChild(boolEx);
    whileStmt.appendChild(blockStmt);
    cst.currentNode = whileStmt;
  }else {
    outputParse(`${indent(index)}FAIL - whileStatement()`);
    context--;
    return false;
  }
}


function ifStatement() {
  console.log('PARSE IF STATEMENT');

  var index = context++;
  outputParse(`${indent(index)}TRY - ifStatement()`);
  var result = match(['if', booleanExpr, block]);
  if(result.isValid) {
    var ifStmt = new node('', 'If Statement');

    var ifVal = new node('', 'If');
    var boolEx = new node('', 'Boolean Expression');
    boolEx.appendChild(cst.currentNode);
    var blockStmt = new node('', 'Block');

    ifStmt.appendChild(ifVal);
    ifStmt.appendChild(boolEx);
    ifStmt.appendChild(blockStmt);
    cst.currentNode = ifStmt;
  }else {
    outputParse(`${indent(index)}FAIL - ifStatement()`);
    context--;
    return false;
  }
}


function expr() {
  console.log('PARSE EXPR');


  var index = context++;
  outputParse(`${indent(index)}TRY - expr()`);
  var exp = new node('', 'Expression')


  if(match([intExpr]).isValid) {
    outputParse(`${indent(index)}SUCCESS - expr()`);
    context--;

    exp.appendChild(cst.currentNode);
    cst.currentNode = exp;
    return true;
  }

  if(match([stringExpr]).isValid) {
    outputParse(`${indent(index)}SUCCESS - expr()`);
    context--;

    exp.appendChild(cst.currentNode);
    cst.currentNode = exp;
    return true;
  }

  if(match([booleanExpr]).isValid) {
    outputParse(`${indent(index)}SUCCESS - expr()`);
    context--;

    exp.appendChild(cst.currentNode);
    cst.currentNode = exp;
    return true;
  }

  var idRes = id();
  if(idRes) {
    outputParse(`${indent(index)}SUCCESS - expr()`);
    context--;

    exp.appendChild(idRes);
    //cst.currentNode = exp;
    return exp;
  }

  //Default
  outputParse(`${indent(index)}FAIL - expr()`);
  context--;
  return false;
}


function intExpr() {
  console.log('PARSE INT EXPR');

  var index = context++;
  outputParse(`${indent(index)}TRY - intExpr()`);
  if(match([digit, intOp, expr]).isValid) {
    outputParse(`${indent(index)}SUCCESS - intExpr()`);
    context--;
    return true;
  }else if(match([digit]).isValid) {
    outputParse(`${indent(index)}SUCCESS - intExpr()`);
    context--;
    return true;
  }else {
    outputParse(`${indent(index)}FAIL - intExpr()`);
    context--;
    return false;
  }
}


function stringExpr() {
  console.log('PARSE STRING EXPR');

  var index = context++;
  outputParse(`${indent(index)}TRY - stringExpr()`);
  if(match(['\"', charList, '\"']).isValid) {
    outputParse(`${indent(index)}SUCCESS - stringExpr()`);
    context--;
    edges.push(edge(currentIndex, currentIndex+1));
    var lQuote = new node(tokenSet.shift(), '\"');
    edges.push(edge(currentIndex, currentIndex+1));
    var charlist = new node('', 'Char List');
    edges.push(edge(currentIndex, currentIndex+1));
    var rQuote = new node(tokenSet.shift(), '\"');

    cst.currentNode.appendChild(lQuote);
    cst.currentNode.appendChild(charlist);
    cst.currentNode.appendChild(rQuote);
    cst.currentNode = charlist;

    return true;
  }else {
    outputParse(`${indent(index)}FAIL - stringExpr()`);
    context--;
    return false;
  }
}


function booleanExpr() {
  console.log('PARSE BOOLEAN EXPR');

  var index = context++;
  outputParse(`${indent(index)}TRY - booleanExpr()`);
  var result = match([/^(\()$/, expr, /^(\))$/]);
  if(result.isValid) {
    outputParse(`${indent(index)}SUCCESS - booleanExpr()`);
    context--;

    edges.push(edge(currentIndex, currentIndex+1));
    var bool = new node('', 'Boolean');
    cst.currentNode.appendChild(bool);
    cst.currentNode = charlist;

    edges.push(edge(currentIndex, currentIndex+1));
    var val = new node(result.token, result.value);
    cst.currentNode.appendChild(val);
    cst.currentNode = val;

    return true;
  }else {
    outputParse(`${indent(index)}FAIL - booleanExpr()`);
    context--;
    return false;
  }

}


function id() {
  console.log('PARSE ID');

  var index = context++;
  outputParse(`${indent(index)}TRY - id()`);
  var result = char();//match([char]);
  console.log(result)
  if(result) {
    outputParse(`${indent(index)}SUCCESS - id()`);
    context--;

    //edges.push(edge(currentIndex, currentIndex+1));
    var varid = new node('', 'ID');
    varid.appendChild(result);
    //cst.currentNode = varid;

    //edges.push(edge(currentIndex, currentIndex+1));
    //var temp = tokenSet.shift();
    //var varVal = new node(temp, temp.value);
    //cst.currentNode.appendChild(varVal);
    //cst.currentNode = varVal;

    return varid;
  }else {
    outputParse(`${indent(index)}FAIL - id()`);
    context--;
    return false;
  }
}


function charList() {
  console.log('PARSE CHAR LIST');

  var index = context++;
  outputParse(`${indent(index)}TRY - charList()`);
  if(matchConsume([char, charList])) {
    outputParse(`${indent(index)}SUCCESS - charList()`);
    context--;

    edges.push(edge(currentIndex, currentIndex+1));
    var chara = new node('', 'Char');
    edges.push(edge(currentIndex, currentIndex+1));
    var charlist = new node('', 'Char List');

    cst.currentNode.appendChild(chara);
    cst.currentNode.appendChild(charlist);
    cst.currentNode = charlist;

    return true;
  }else if(matchConsume([space, charList])) {
    return true;
  }else {
    return false;
  }
}











/*Terminals*/
function type() {
  console.log('PARSE TYPE');
  var index = context++;

  outputParse(`${indent(index)}TRY - type()`);
  var result = match([/^(int|string|boolean)$/]);
  if(result.isValid) {
    outputParse(`${indent(index)}SUCCESS - type()`);
    context--;

    /*
    var typeVal = new node(result.nodes[0].token, result.nodes[0].token.value);
    typeVal.appendChild(cst.currentNode);
    var typeNode = new node('', 'Type');
    typeNode.appendChild(typeVal);
    */

    var typeNode = new node('', 'Type');
    var typeVal = new node(result.nodes[0].token, result.nodes[0].token.value);
    typeNode.appendChild(typeVal);

    return typeNode;
  }else {
    outputParse(`${indent(index)}FAIL - type()`);
    context--;
    return false;
  }

}


function char() {
  console.log('PARSE CHAR');

  var index = context++;
  outputParse(`${indent(index)}TRY - char()`);
  var result = match([/^[a-z]$/]);
  if(result.isValid) {

    outputParse(`${indent(index)}SUCCESS - char()`);
    context--;

    console.log(result)
    var charNode = new node('', 'Char');
    var charVal = new node(result.nodes[0].token, result.nodes[0].token.value);
    charNode.appendChild(charVal);


    return charNode;
  }else {
    outputParse(`${indent(index)}FAIL - char()`);
    context--;
    return false;
  }
}


function space() {
  console.log('PARSE SPACE');

  var index = context++;
  outputParse(`${indent(index)}TRY - space()`);
  var result = match([/\s/]);
  if(result.isValid) {
    var spaceNode = new node('', 'Space');
    var spaceVal = new node(result.nodes[0].token, result.nodes[0].token.value);
    spaceVal.appendChild(spaceNode);
    return spaceNode;
  }
  outputParse(`${indent(index)}FAIL - space()`);
  context--;
  return false;
}


function digit() {
  console.log('PARSE DIGIT');

  var index = context++;
  outputParse(`${indent(index)}TRY - digit()`);
  var result = match([/^[0-9]$/]);
  if(result.isValid) {
    outputParse(`${indent(index)}SUCCESS - digit()`);
    context--;

    var digitNode = new node('', 'Digit');
    var digitVal = new node(result.nodes[0].token, result.nodes[0].token.value);
    digitVal.appendChild(digitNode);

    return digitNode;
  }else {
    outputParse(`${indent(index)}FAIL - digit()`);
    context--;
    return false;
  }
}


function boolOp() {
  //console.log('PARSE BOOL OP');
  outputParse(`${indent(index)}TRY - boolOp()`);
  var result = match([/^(==|!=)$/]);
  if(result.isValid) {
    outputParse(`${indent(index)}SUCCESS - boolOp()`);
    context--;

    var boolNode = new node('', 'Boolean');
    var boolVal = new node(result.nodes[0].token, result.nodes[0].token.value);
    boolVal.appendChild(boolNode);

    return boolNode;
  }else {
    outputParse(`${indent(index)}FAIL - boolOp()`);
    context--;
    return false;
  }
}

function boolVal() {
  //console.log('PARSE BOOL VAL');
  outputParse(`${indent(index)}TRY - boolVal()`);
  var result = match([/^(false|true)$/]);
  if(result.isValid) {
    outputParse(`${indent(index)}SUCCESS - boolVal()`);
    context--;

    var boolNode = new node('', 'Boolean');
    var boolVal = new node(result.nodes[0].token, result.nodes[0].token.value);
    boolVal.appendChild(boolNode);

    return boolNode;
  }else {
    outputParse(`${indent(index)}FAIL - boolVal()`);
    context--;
    return false;
  }
}


function intOp() {
  console.log('PARSE INT OP');

  var index = context++;
  outputParse(`${indent(index)}TRY - intOp()`);
  var result = match([/^\+$/]);
  if(result.isValid) {
    outputParse(`${indent(index)}SUCCESS - intOp()`);
    context--;

    var intOpNode = new node('', 'IntOp');
    var intOpVal = new node(result.nodes[0].token, result.nodes[0].token.value);
    intOpVal.appendChild(intOpNode);

    return intOpNode;
  }else {
    outputParse(`${indent(index)}FAIL - intOp()`);
    context--;
    return false;
  }
}

function indent(n) {
  var str = "";
  for(var i = 0; i < n; i++) {
    str += "-";
  }
  return str;
}
