
function node(key, token, value) {
  this.node = {};
  this.node.id = key;
  this.node.token = token;
  this.node.value = value;

  this.node.parent = {};
  this.node.children = [];

  this.node.appendChild = (child) => {
    //console.log('APPEND CHILD')
    //console.log(this.node)
    //console.log(child)
    this.node.children.push(child);
    child.parent = this.node;
  }

  this.node.setParent = (parent) => {
    this.parent = parent;
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
var cst = {
  head: {},
  currentNode: null
}
var currentIndex = 0;
var edges = [];
function parse(programTokens, p) {
  tokenSet = programTokens; //Update tokens refernce

  cst.currentNode = new node(currentIndex++, ``, `Program ${p}`); //Start CST
  cst.head = cst.currentNode;

  outputParse(`${id > 0 ? '\n' : ''}INFO PARSER - Parsing program ${p}...`);

  //var check = matchConsume([program]);
  //console.log(check);

  if(match([program])) {
    edges.push(edge(currentIndex-1, currentIndex));
    console.log(cst.currentNode)
  }else {
    console.log('No program??')
  }

  outputParse(`INFO PARSER - Successfully completed parsing program ${p}`);
  console.log(cst)
  //cst =
  new vis.Network(cstContainer, cst, options)

  //outputCST(cst.toString());

  //var nodes = new vis.DataSet([]);
  //var edges = new vis.DataSet([]);
  //cst.setData({nodes:nodes, edges:edges});
}


var curr = 0;
function match(targetTokens) {
  tokenSet = Object.assign([], tokenSet);
  var valid = false;
  //console.log(`MATCH: ${typeof targetTokens[curr]}`)
  console.log(targetTokens)

  for(var i = 0; i < targetTokens.length; i++) {
    var isTerminal = typeof targetTokens[i] === 'function';
    var numTokens = (tokenSet.length - curr);

    if(numTokens > 1) {
      if((isTerminal) ? targetTokens[i]() : tokenSet[curr].value.match(targetTokens[i])) {
        console.log('MATCHED', targetTokens[i])
        //console.log(tokenSet[curr])
        //console.log(cst.currentNode)
        valid = true;
      }else {
        valid = false;
        break;
      }
      curr++;
    }

    console.log(tokenSet.length, numTokens)
  }


  /*
  tokenSet.forEach((token) => {
    var isTerminal = typeof targetTokens[curr] === 'function';
    if((isTerminal) ? targetTokens[curr]() : token.value.match(targetTokens[curr])) {//Match tokens in order
      curr++;
      console.log(`MATCH: ${targetTokens[curr]}`)
    }
  });
  */
  //console.log(curr, targetTokens.length)
  /*
  if(valid) {//If all the tokens were matched
    return true;
  }else {
    return false;
  }*/
  return valid;
}



function program() {
  console.log('PARSE PROGRAM');
  outputParse(`  DEBUG PARSER - program()`);
  //return matchConsume([block, '$']);

  if(match([block, '$'])) {
    edges.push(edge(currentIndex, currentIndex+1));
    var program = new node(currentIndex++, '', 'Program');
    program.appendChild(cst.currentNode)
    cst.head = cst.currentNode;

    return true;
  }else {
    return false;
  }
}


function block() {
  console.log('PARSE BLOCK');
  outputParse(`  DEBUG PARSER - block()`);

  if(match(['{', statementList, '}'])) {
    console.log('THERE IS BLOCK')

    var stmtList = new node(currentIndex++, '', 'Statement List');
    var block = new node(currentIndex++, '', 'Block');
    block.appendChild(new node(currentIndex++, tokenSet.shift(), '{'));
    block.appendChild(stmtList);
    block.appendChild(new node(currentIndex++, tokenSet.shift(), '}'));

    console.log(Object.assign({}, cst.currentNode))
    cst.currentNode.appendChild(block);
    cst.currentNode = block;
    cst.currentNode = stmtList;
    //edges.push(edge(currentIndex, currentIndex+1));

    return true;
  }else {
    return false;
  }

}


function statementList() {
  console.log('PARSE STATEMENT LIST');
  outputParse(`  DEBUG PARSER - statementList()`);
  if(match([statement, statementList])) {

    //edges.push(edge(currentIndex, currentIndex+1));
    var stmtList = new node(currentIndex++, '', 'Statement List');
    cst.currentNode.appendChild(stmtList);
    cst.currentNode = stmtList;

    return true;
  }else {
    console.log('THERE IS STATEMENT LIST WITH E')
    //cst.endChildren();
    return false;
  }

}


function statement() {
  console.log('PARSE STATEMENT');
  outputParse(`  DEBUG PARSER - statement()`);
  var stmt = new node(currentIndex++, '', 'Statement');
  if(match([printStatement])) {
    cst.currentNode.appendChild(stmt);
    cst.currentNode = stmt;
    return true;
  }else if(match([assignmentStatement])) {
    cst.currentNode.appendChild(stmt);
    cst.currentNode = stmt;
    return true;
  }else if(match([varDecl])) {
    cst.currentNode.appendChild(stmt);
    cst.currentNode = stmt;
    return true;
  }else if(match([whileStatement])) {
    cst.currentNode.appendChild(stmt);
    cst.currentNode = stmt;
    return true;
  }else if(match([ifStatement])) {
    cst.currentNode.appendChild(stmt);
    cst.currentNode = stmt;
    return true;
  }else if(match([block])) {
    cst.currentNode.appendChild(stmt);
    cst.currentNode = stmt;
    return true;
  }else {
    return false;
  }
}


function printStatement() {
  console.log('PARSE PRINT STATEMENT');
  outputParse(`  DEBUG PARSER - printStatement()`);
  if(match(['print', /\(/, expr, /\)/])) {

    edges.push(edge(currentIndex, currentIndex+1));
    var printStmt =new  node(currentIndex++, tokenSet.shift(), 'Print Statement');
    edges.push(edge(currentIndex, currentIndex+1));
    var lParen = new node(currentIndex++, tokenSet.shift(), '(');
    edges.push(edge(currentIndex, currentIndex+1));
    var express = new node(currentIndex++, '', 'Expression');
    edges.push(edge(currentIndex, currentIndex+1));
    var rParen = new node(currentIndex++, tokenSet.shift(), ')');

    cst.currentNode.appendChild(printStmt);
    cst.currentNode.appendChild(lParen);
    cst.currentNode.appendChild(express);
    cst.currentNode.appendChild(rParen);
    cst.currentNode = express;

    console.log('MATCHED PRINT STMT');
    console.log(cst.currentNode)

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
  console.log('PARSE EXPR');
  outputParse(`  DEBUG PARSER - expr()`);
  var exp = new node(currentIndex++, '', 'Expression')
  if(match([intExpr])) {
    exp.appendChild(new node(currentIndex++, '', 'Int Expr'))
    cst.currentNode.appendChild(exp);
    cst.currentNode = exp;
    return true;
  }else if(match([stringExpr])) {
    exp.appendChild(new node(currentIndex++, '', 'String Expr'))
    cst.currentNode.appendChild(exp);
    cst.currentNode = exp;
    return true;
  }else if(match([booleanExpr])) {
    exp.appendChild(new node(currentIndex++, '', 'Bool Expr'))
    cst.currentNode.appendChild(exp);
    cst.currentNode = exp;
    return true;
  }else if(match([id])) {
    exp.appendChild(new node(currentIndex++, '', 'ID'))
    cst.currentNode.appendChild(exp);
    cst.currentNode = exp;
    return true;
  }else {
    return false;
  }
}


function intExpr() {
  console.log('PARSE INT EXPR');
  outputParse(`  DEBUG PARSER - intExpr()`);
  if(match([digit, intOp, expr])) {
    return true;
  }else if(match([digit])) {
    return true;
  }else {
    return false;
  }
}


function stringExpr() {
  console.log('PARSE STRING EXPR');
  outputParse(`  DEBUG PARSER - stringExpr()`);
  if(match(['\"', charList, '\"'])) {
    edges.push(edge(currentIndex, currentIndex+1));
    var lQuote = new node(currentIndex++, tokenSet.shift(), '\"');
    edges.push(edge(currentIndex, currentIndex+1));
    var charlist = new node(currentIndex++, '', 'Char List');
    edges.push(edge(currentIndex, currentIndex+1));
    var rQuote = new node(currentIndex++, tokenSet.shift(), '\"');

    cst.currentNode.appendChild(lQuote);
    cst.currentNode.appendChild(charlist);
    cst.currentNode.appendChild(rQuote);
    cst.currentNode = charlist;

    return true;
  }else {
    return false;
  }
}


function booleanExpr() {
  //console.log('PARSE BOOLEAN EXPR');
  outputParse(`  DEBUG PARSER - booleanExpr()`);
  if(match([/^(\()$/, expr, /^(\))$/])) {
    edges.push(edge(currentIndex, currentIndex+1));
    var bool = new node(currentIndex++, '', 'Boolean');
    cst.currentNode.appendChild(bool);
    cst.currentNode = charlist;

    edges.push(edge(currentIndex, currentIndex+1));
    var temp = tokenSet.shift();
    var val = new node(currentIndex++, temp, temp.value);
    cst.currentNode.appendChild(val);
    cst.currentNode = val;

    return true;
  }else {
    return false;
  }

}


function id() {
  //console.log('PARSE ID');
  outputParse(`  DEBUG PARSER - id()`);
  if(match([char])) {
    edges.push(edge(currentIndex, currentIndex+1));
    var varid = new node(currentIndex++, '', 'ID');
    cst.currentNode.appendChild(varid);
    cst.currentNode = varid;

    //edges.push(edge(currentIndex, currentIndex+1));
    var temp = tokenSet.shift();
    var varVal = new node(currentIndex++, temp, temp.value);
    cst.currentNode.appendChild(varVal);
    cst.currentNode = varVal;

    return true;
  }else {
    return false;
  }
}


function charList() {
  console.log('PARSE CHAR LIST');
  outputParse(`  DEBUG PARSER - charList()`);
  if(matchConsume([char, charList])) {
    edges.push(edge(currentIndex, currentIndex+1));
    var chara = node(currentIndex++, '', 'Char');
    edges.push(edge(currentIndex, currentIndex+1));
    var charlist = node(currentIndex++, '', 'Char List');

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


function type() {
  //console.log('PARSE TYPE');
  outputParse(`  DEBUG PARSER - type()`);
  return matchConsume([/^(int|string|boolean)$/]);
}


function char() {
  console.log('PARSE CHAR');
  outputParse(`  DEBUG PARSER - char()`);
  if(match([/^[a-z]$/])) {
    //edges.push(edge(currentIndex, currentIndex+1));

    var charNode = new node(currentIndex++, '', 'Char');
    //charNode.appendChild(val);
    charNode.setParent(cst.currentNode);
    cst.currentNode = charNode;

    //edges.push(edge(currentIndex, currentIndex+1));


    return true;
  }else {
    return false;
  }
}


function space() {
  //console.log('PARSE SPACE');
  outputParse(`  DEBUG PARSER - space()`);
  return matchConsume([/\s/]);
}


function digit() {
  console.log('PARSE DIGIT');
  outputParse(`  DEBUG PARSER - digit()`);
  if(match([/^[0-9]$/])) {
    edges.push(edge(currentIndex, currentIndex+1));
    var digit = node(currentIndex++, '', 'Digit');
    cst.currentNode.appendChild(digit);
    cst.currentNode = digit;

    edges.push(edge(currentIndex, currentIndex+1));
    var temp = tokenSet.shift();
    var val = node(currentIndex++, temp, temp.value);
    cst.currentNode.appendChild(val);

    return true;
  }else {
    return false;
  }
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
  console.log('PARSE INT OP');
  outputParse(`  DEBUG PARSER - intOp()`);
  if(match([/^\+$/])) {
    edges.push(edge(currentIndex, currentIndex+1));
    var temp = tokenSet.shift();
    var intop = node(currentIndex++, temp, temp.value);
    cst.currentNode.appendChild(intop);

    return true;
  }else {
    return false;
  }
}
