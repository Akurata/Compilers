
var currentIndex = 0;
function node(token, value, type) {
  this.node = {};
  this.node.id = currentIndex++;
  this.node.token = token;
  if(type) {
    this.node.type = type;
  }
  this.node.text = {
    name: `${value}`,
  };
  this.node.parent = {};
  this.node.children;
  this.node.appendChild = (child) => {
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
    var pool = this.node.parent.children;
    return pool.find((item, i) => {if(item === this.node) {return pool[i+1];}});
  }
  return this.node;
}

var cstContainer = document.querySelector('#output_cst');
var options = {
  layout: {
    hierarchical: {
      enabled: true,

    }
  }
}

var cstTree;
var tokenSet;
var curr = 0;
var context = 0;
var cst = {};
var edges = [];
function parse(programTokens, p) {
  curr = 0;
  context = 0;
  tokenSet = programTokens; //Update tokens refernce

  outputParse(`${id > 0 ? '\n' : ''}INFO PARSER - Parsing program ${p}...`);
  var result = match([program]);
  if(result.isValid) {
    cst = result.nodes[0].node;
  }else {
    outputParse(`${id > 0 ? '\n' : ''}INFO PARSER - Encountered fatal errors when parsing program ${p}...`);
  }

  outputParse(`INFO PARSER - Completed parsing program ${p}`);

  cstTree = new Treant({
    chart: {
      container: '#output_cst'
    },
    nodeStructure: cst
  });
  semanticAnalysis(cst, p);
}

function match(targetTokens) {
  var valid = {
    isValid: true,
    nodes: [],
    errs: []
  };
  for(var i = 0; i < targetTokens.length; i++) {
    var check = null;
    var target = null;
    var isTerminal = typeof targetTokens[i] === 'function';
    if(isTerminal) { //Check if is terminal
      target = targetTokens[i](); //Call nested nonterminal
      if(target) {
        check = true;
      }else {
        check = false
      }
    }else if(curr > tokenSet.length) { //If the parser ran out of tokens to check, return false
      check = false;
    }else { //Otherwise check regex string/terminal against target tokens
      check = tokenSet[curr].value.match(targetTokens[i]);
    }
    if(check) { //Append valid nodes if it passes
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
      break;
    }
  }
  return valid;
}

function program() {
  var index = context++;
  outputParse(`${indent(index)}TRY - program()`);
  var result = match([block, '$']);
  if(result.isValid) {
    outputParse(`${indent(index)}SUCCESS - program()`);
    context--;
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
  var index = context++;
  outputParse(`${indent(index)}TRY - block()`);
  var result = match(['{', statementList, '}']);
  if(result.isValid) {
    outputParse(`${indent(index)}SUCCESS - block()`);
    context--;
    var blockNode = new node('', 'Block', 'stem');
    blockNode.appendChild(new node(result.nodes[0].token, result.nodes[0].token.value));
    blockNode.appendChild(result.nodes[1].node);
    blockNode.appendChild(new node(result.nodes[2].token, result.nodes[2].token.value));
    return blockNode;
  }else {
    outputParse(`${indent(index)}FAIL - block()`);
    context--;
    outputParse(`ERROR - Expected Block - found ${tokenSet[curr].value} (${tokenSet[curr].row}:${tokenSet[curr].col})`);
    return false;
  }
}

function statementList() {
  var index = context++;
  outputParse(`${indent(index)}TRY - statementList()`);
  var result = match([statement, statementList]);
  var stmtList = new node('', 'StmtList');
  if(result.isValid) {
    outputParse(`${indent(index)}SUCCESS - statementList()`);
    context--;
    stmtList.appendChild(result.nodes[0].node);
    stmtList.appendChild(result.nodes[1].node);
  }else {
    outputParse(`${indent(index)}FAIL - statementList() [Epsilon]`);
    context--;
    var eps = new node('', '\u03B5');
    stmtList.appendChild(eps);
  }
  return stmtList;
}

function statement() {
  var index = context++;
  outputParse(`${indent(index)}TRY - statement()`);
  var stmt = new node('', 'Stmt');
  var printRes = match([printStatement]);
  if(printRes.isValid) {
    outputParse(`${indent(index)}SUCCESS - statement()`);
    context--;
    stmt.appendChild(printRes.nodes[0].node);
    return stmt;
  }
  var assRes = match([assignmentStatement]);
  if(assRes.isValid) {
    outputParse(`${indent(index)}SUCCESS - statement()`);
    context--;
    stmt.appendChild(assRes.nodes[0].node);
    return stmt;
  }
  var varRes = match([varDecl]);
  if(varRes.isValid) {
    outputParse(`${indent(index)}SUCCESS - statement()`);
    context--;
    stmt.appendChild(varRes.nodes[0].node);
    return stmt;
  }
  var whileRes = match([whileStatement]);
  if(whileRes.isValid) {
    outputParse(`${indent(index)}SUCCESS - statement()`);
    context--;
    stmt.appendChild(whileRes.nodes[0].node);
    return stmt;
  }
  var ifRes = match([ifStatement]);
  if(ifRes.isValid) {
    outputParse(`${indent(index)}SUCCESS - statement()`);
    context--;
    stmt.appendChild(ifRes.nodes[0].node);
    return stmt;
  }
  var blockRes = match([block]);
  if(blockRes.isValid) {
    outputParse(`${indent(index)}SUCCESS - statement()`);
    context--;
    stmt.appendChild(blockRes.nodes[0].node);
    return stmt;
  }
  //Default
  outputParse(`${indent(index)}FAIL - statement()`);
  context--;
  return false;
}

function printStatement() {
  var index = context++;
  outputParse(`${indent(index)}TRY - printStatement()`);
  var result = match(['print', /\(/, expr, /\)/]);
  if(result.isValid) {
    outputParse(`${indent(index)}SUCCESS - printStatement()`);
    context--;
    var printStmt = new node('', 'PrintStmt', 'stem');
    printStmt.appendChild(new node(result.nodes[0].token, result.nodes[0].token.value));
    printStmt.appendChild(new node(result.nodes[1].token, result.nodes[1].token.value));
    printStmt.appendChild(result.nodes[2].node);
    printStmt.appendChild(new node(result.nodes[3].token, result.nodes[3].token.value));
    return printStmt;
  }else {
    outputParse(`${indent(index)}FAIL - printStatement()`);
    context--;
    return false;
  }
}

function assignmentStatement() {
  var index = context++;
  outputParse(`${indent(index)}TRY - assignmentStatement()`);
  var result = match([id, /\=/, expr]);
  if(result.isValid) {
    outputParse(`${indent(index)}SUCCESS - assignmentStatement()`);
    context--;
    var assStmt = new node('', 'AssignStmt', 'stem');
    assStmt.appendChild(result.nodes[0].node);
    assStmt.appendChild(new node(result.nodes[1].token, result.nodes[1].token.value));
    assStmt.appendChild(result.nodes[2].node);
    return assStmt;
  }else {
    outputParse(`${indent(index)}Fail - assignmentStatement()`);
    context--;
    return false;
  }
}

function varDecl() {
  var index = context++;
  outputParse(`${indent(index)}TRY - varDecl()`);
  var result = match([type, id]);
  if(result.isValid) {
    outputParse(`${indent(index)}SUCCESS - varDecl()`);
    context--;
    var varDecStmt = new node('', 'VarDecl', 'stem');
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
  var index = context++;
  outputParse(`${indent(index)}TRY - whileStatement()`);
  var result = match(['while', booleanExpr, block]);
  if(result.isValid) {
    outputParse(`${indent(index)}SUCCESS - whileStatement()`);
    context--;
    var whileStmt = new node('', 'WhileStmt', 'stem');
    whileStmt.appendChild(new node(result.nodes[0].token, result.nodes[0].token.value));
    whileStmt.appendChild(result.nodes[1].node);
    whileStmt.appendChild(result.nodes[2].node);
    return whileStmt;
  }else {
    outputParse(`${indent(index)}FAIL - whileStatement()`);
    context--;
    return false;
  }
}

function ifStatement() {
  var index = context++;
  outputParse(`${indent(index)}TRY - ifStatement()`);
  var result = match(['if', booleanExpr, block]);
  if(result.isValid) {
    var ifStmt = new node('', 'IfStmt', 'stem');
    ifStmt.appendChild(new node(result.nodes[0].token, result.nodes[0].token.value));
    ifStmt.appendChild(result.nodes[1].node);
    ifStmt.appendChild(result.nodes[2].node);
    return ifStmt;
  }else {
    outputParse(`${indent(index)}FAIL - ifStatement()`);
    context--;
    return false;
  }
}

function expr() {
  var index = context++;
  outputParse(`${indent(index)}TRY - expr()`);
  var exp = new node('', 'Expr')
  var intRes = match([intExpr]);
  if(intRes.isValid) {
    outputParse(`${indent(index)}SUCCESS - expr()`);
    context--;
    exp.appendChild(intRes.nodes[0].node);
    return exp;
  }
  var strRes = match([stringExpr]);
  if(strRes.isValid) {
    outputParse(`${indent(index)}SUCCESS - expr()`);
    context--;
    exp.appendChild(strRes.nodes[0].node);
    return exp;
  }
  var boolRes = match([booleanExpr]);
  if(boolRes.isValid) {
    outputParse(`${indent(index)}SUCCESS - expr()`);
    context--;
    exp.appendChild(boolRes.nodes[0].node);
    return exp;
  }
  var idRes = match([id]);
  if(idRes.isValid) {
    outputParse(`${indent(index)}SUCCESS - expr()`);
    context--;
    exp.appendChild(idRes.nodes[0].node);
    return exp;
  }
  //Default
  outputParse(`${indent(index)}FAIL - expr()`);
  context--;
  return false;
}

function intExpr() {
  var index = context++;
  outputParse(`${indent(index)}TRY - intExpr()`);
  var resInt;
  var intNode = new node('', 'IntExpr');
  resInt = match([digit, intOp, expr]);
  if(resInt.isValid) {
    outputParse(`${indent(index)}SUCCESS - intExpr()`);
    context--;
    intNode.appendChild(resInt.nodes[0].node);
    intNode.appendChild(resInt.nodes[1].node);
    intNode.appendChild(resInt.nodes[2].node);
    return intNode;
  }
  resInt = match([digit]);
  if(resInt.isValid) {
    outputParse(`${indent(index)}SUCCESS - intExpr()`);
    context--;
    intNode.appendChild(resInt.nodes[0].node);
    return intNode;
  }
  outputParse(`${indent(index)}FAIL - intExpr()`);
  context--;
  return false;
}

function stringExpr() {
  var index = context++;
  outputParse(`${indent(index)}TRY - stringExpr()`);
  var result = match(['\"', charList, '\"']);
  if(result.isValid) {
    outputParse(`${indent(index)}SUCCESS - stringExpr()`);
    context--;
    var strNode = new node('', 'StringExpr');
    strNode.appendChild(new node(result.nodes[0].token, result.nodes[0].token.value, 'leaf'));
    strNode.appendChild(result.nodes[1].node);
    strNode.appendChild(new node(result.nodes[2].token, result.nodes[2].token.value, 'leaf'));
    return strNode;
  }else {
    outputParse(`${indent(index)}FAIL - stringExpr()`);
    context--;
    return false;
  }
}

function booleanExpr() {
  var index = context++;
  outputParse(`${indent(index)}TRY - booleanExpr()`);
  var boolExprRes = match([/^(\()$/, expr, boolOp, expr, /^(\))$/]);
  if(boolExprRes.isValid) {
    outputParse(`${indent(index)}SUCCESS - booleanExpr()`);
    context--;
    var bool = new node('', 'BooleanExpr', 'stem');
    bool.appendChild(new node(boolExprRes.nodes[0].token, boolExprRes.nodes[0].token.value));
    bool.appendChild(boolExprRes.nodes[1].node);
    bool.appendChild(boolExprRes.nodes[2].node);
    bool.appendChild(boolExprRes.nodes[3].node);
    bool.appendChild(new node(boolExprRes.nodes[4].token, boolExprRes.nodes[4].token.value));
    return bool;
  }
  var boolValRes = match([boolVal]);
  if(boolValRes.isValid) {
    outputParse(`${indent(index)}SUCCESS - booleanExpr()`);
    context--;
    var bool = new node('', 'Boolean');
    bool.appendChild(boolValRes.nodes[0].node);
    return bool;
  }else {
    outputParse(`${indent(index)}FAIL - booleanExpr()`);
    context--;
    return false;
  }
}

function id() {
  var index = context++;
  outputParse(`${indent(index)}TRY - id()`);
  var result = char();
  if(result) {
    outputParse(`${indent(index)}SUCCESS - id()`);
    context--;
    var varid = new node('', 'ID');
    varid.appendChild(result);
    return varid;
  }else {
    outputParse(`${indent(index)}FAIL - id()`);
    context--;
    return false;
  }
}

function charList() {
  var index = context++;
  outputParse(`${indent(index)}TRY - charList()`);
  var charNode = new node('', 'CharList');
  var alpha = match([char, charList]);
  if(alpha.isValid) {
    outputParse(`${indent(index)}SUCCESS - charList()`);
    context--;
    charNode.appendChild(alpha.nodes[0].node);
    charNode.appendChild(alpha.nodes[1].node);
    return charNode;
  }
  var beta = match([space, charList]);
  if(beta.isValid) {
    outputParse(`${indent(index)}SUCCESS - charList()`);
    context--;
    charNode.appendChild(beta.nodes[0].node);
    charNode.appendChild(beta.nodes[1].node);
    return charNode
  }else {
    outputParse(`${indent(index)}SUCCESS - charList(\u03B5)`);
    context--;
    var eps = new node('', '\u03B5');
    charNode.appendChild(eps);
    return charNode;
  }

}


/*Terminals*/
function type() {
  var index = context++;
  outputParse(`${indent(index)}TRY - type()`);
  var result = match([/^(int|string|boolean)$/]);
  if(result.isValid) {
    outputParse(`${indent(index)}SUCCESS - type()`);
    context--;
    var typeNode = new node('', 'Type');
    var typeVal = new node(result.nodes[0].token, result.nodes[0].token.value, 'leaf');
    typeNode.appendChild(typeVal);
    return typeNode;
  }else {
    outputParse(`${indent(index)}FAIL - type()`);
    context--;
    return false;
  }
}

function char() {
  var index = context++;
  outputParse(`${indent(index)}TRY - char()`);
  var result = match([/^[a-z\s]$/]);
  if(result.isValid) {
    outputParse(`${indent(index)}SUCCESS - char(${result.nodes[0].token.value})`);
    context--;
    var charNode = new node('', 'Char');
    var charVal = new node(result.nodes[0].token, result.nodes[0].token.value, 'leaf');
    charNode.appendChild(charVal);
    return charNode;
  }else {
    outputParse(`${indent(index)}FAIL - char()`);
    context--;
    return false;
  }
}

function space() {
  var index = context++;
  outputParse(`${indent(index)}TRY - space()`);
  var result = match([/^(\s)$/]);
  if(result.isValid) {
    outputParse(`${indent(index)}SUCCESS - space()`);
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
  var index = context++;
  outputParse(`${indent(index)}TRY - digit()`);
  var result = match([/^[0-9]$/]);
  if(result.isValid) {
    outputParse(`${indent(index)}SUCCESS - digit()`);
    context--;
    var digitNode = new node('', 'Digit');
    var digitVal = new node(result.nodes[0].token, result.nodes[0].token.value, 'leaf');
    digitNode.appendChild(digitVal);
    return digitNode;
  }else {
    outputParse(`${indent(index)}FAIL - digit()`);
    context--;
    return false;
  }
}

function boolOp() {
  var index = context++;
  outputParse(`${indent(index)}TRY - boolOp()`);
  var result = match([/^(==|!=)$/]);
  if(result.isValid) {
    outputParse(`${indent(index)}SUCCESS - boolOp()`);
    context--;
    var boolNode = new node('', 'Boolean');
    var boolVal = new node(result.nodes[0].token, result.nodes[0].token.value, 'leaf');
    boolNode.appendChild(boolVal);
    return boolNode;
  }else {
    outputParse(`${indent(index)}FAIL - boolOp()`);
    context--;
    return false;
  }
}

function boolVal() {
  var index = context++;
  outputParse(`${indent(index)}TRY - boolVal()`);
  var result = match([/^(false|true)$/]);
  if(result.isValid) {
    outputParse(`${indent(index)}SUCCESS - boolVal()`);
    context--;
    var boolNode = new node('', 'Boolean');
    var boolVal = new node(result.nodes[0].token, result.nodes[0].token.value, 'leaf');
    boolNode.appendChild(boolVal);
    return boolNode;
  }else {
    outputParse(`${indent(index)}FAIL - boolVal()`);
    context--;
    return false;
  }
}

function intOp() {
  var index = context++;
  outputParse(`${indent(index)}TRY - intOp()`);
  var result = match([/^\+$/]);
  if(result.isValid) {
    outputParse(`${indent(index)}SUCCESS - intOp()`);
    context--;
    var intOpNode = new node('', 'IntOp');
    var intOpVal = new node(result.nodes[0].token, result.nodes[0].token.value, 'leaf');
    intOpNode.appendChild(intOpVal);
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
