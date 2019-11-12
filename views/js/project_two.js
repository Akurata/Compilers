
function node(key, token, value) {
  var node = {};
  node.id = key;
  node.token = token;
  node.value = value;

  node.parent = {};
  node.children = [];

  node.appendChild = (child) => {
    node.children.push(child);
    child.parent = node;
  }

  return node;
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

var cst = new vis.Network(cstContainer, null, options)


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


var currentNode;

var tokenSet;
var currentIndex = 0;
var edges = [];
function parse(programTokens, p) {
  currentNode = node(currentIndex++, ``, `Program ${p}`); //Start CST
  tokenSet = programTokens; //Update tokens refernce

  outputParse(`${id > 0 ? '\n' : ''}INFO PARSER - Parsing program ${p}...`);

  //var check = matchConsume([program]);
  //console.log(check);

  if(match([program])) {
    edges.push(edge(currentIndex-1, currentIndex));
    console.log(currentNode)
  }else {
    console.log('No program??')
  }

  outputParse(`INFO PARSER - Successfully completed parsing program ${p}`);
  //outputCST(cst.toString());

  //var nodes = new vis.DataSet([]);
  //var edges = new vis.DataSet([]);
  //cst.setData({nodes:nodes, edges:edges});
}


var curr = 0;
function match(targetTokens) {
  var valid = true;
  //console.log(`MATCH: ${typeof targetTokens[curr]}`)
  console.log(targetTokens)

  for(var i = 0; i < targetTokens.length; i++) {
    console.log(`MATCH: ${targetTokens[i]}`)
    console.log(tokenSet[curr])
    var isTerminal = typeof targetTokens[i] === 'function';
    var numTokens = (tokenSet.length - curr);

    if(numTokens > 1) {
      if((isTerminal) ? targetTokens[i]() : tokenSet[curr].value.match(targetTokens[i])) {
        console.log('MATCHED', targetTokens[i])
        console.log(currentNode)
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
    var program = node(currentIndex++, '', 'Program');
    currentNode.appendChild(program);
    currentNode = program;

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

    var block = node(currentIndex++, '', 'Block');
    var stmtList = node(currentIndex++, '', 'Statement List');

    currentNode.appendChild(block);
    block.appendChild(node(currentIndex++, tokenSet.shift(), '{'));
    edges.push(edge(currentIndex, currentIndex+1));
    block.appendChild(stmtList);
    block.appendChild(node(currentIndex++, tokenSet.shift(), '}'));
    currentNode = stmtList;

    return true;
  }else {
    return false;
  }

}


function statementList() {
  console.log('PARSE STATEMENT LIST');
  outputParse(`  DEBUG PARSER - statementList()`);
  if(match([statement, statementList])) {
    var stmt = node(currentIndex++, '', 'Statement');
    edges.push(edge(currentIndex, currentIndex+1));
    var stmtList = node(currentIndex++, '', 'Statement List');

    currentNode.appendChild(stmt);
    currentNode.appendChild(stmtList);
    currentNode = stmtList;

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
  if(match([printStatement])) {
    return true;
  }else if(match([assignmentStatement])) {
    return true;
  }else if(match([varDecl])) {
    return true;
  }else if(match([whileStatement])) {
    return true;
  }else if(match([ifStatement])) {
    return true;
  }else if(match([block])) {
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
    var printStmt = node(currentIndex++, tokenSet.shift(), 'Print Statement');
    edges.push(edge(currentIndex, currentIndex+1));
    var lParen = node(currentIndex++, tokenSet.shift(), '(');
    edges.push(edge(currentIndex, currentIndex+1));
    var express = node(currentIndex++, '', 'Expression');
    edges.push(edge(currentIndex, currentIndex+1));
    var rParen = node(currentIndex++, tokenSet.shift(), ')');

    currentNode.appendChild(printStmt);
    currentNode.appendChild(lParen);
    currentNode.appendChild(expr);
    currentNode.appendChild(rParen);
    currentNode = express;

    console.log('MATCHED PRINT STMT');
    console.log(currentNode)

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
  if(match([intExpr])) {
    return true;
  }else if(match([stringExpr])) {
    return true;
  }else if(match([booleanExpr])) {
    return true;
  }else if(match([id])) {
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
    var lQuote = node(currentIndex++, tokenSet.shift(), '\"');
    edges.push(edge(currentIndex, currentIndex+1));
    var charlist = node(currentIndex++, '', 'Char List');
    edges.push(edge(currentIndex, currentIndex+1));
    var rQuote = node(currentIndex++, tokenSet.shift(), '\"');

    currentNode.appendChild(lQuote);
    currentNode.appendChild(charlist);
    currentNode.appendChild(rQuote);
    currentNode = charlist;

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
    var bool = node(currentIndex++, '', 'Boolean');
    currentNode.appendChild(bool);
    currentNode = charlist;

    edges.push(edge(currentIndex, currentIndex+1));
    var temp = tokenSet.shift();
    var val = node(currentIndex++, temp, temp.value);
    currentNode.appendChild(val);
    currentNode = val;

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
    var carid = node(currentIndex++, '', 'ID');
    currentNode.appendChild(carid);

    edges.push(edge(currentIndex, currentIndex+1));
    var temp = tokenSet.shift();
    var carid = node(currentIndex++, temp, temp.value);
    currentNode.appendChild(carid);

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

    currentNode.appendChild(chara);
    currentNode.appendChild(charlist);
    currentNode = charlist;

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
    edges.push(edge(currentIndex, currentIndex+1));
    var chara = node(currentIndex++, '', 'Char');
    currentNode = chara;

    edges.push(edge(currentIndex, currentIndex+1));
    var temp = tokenSet.shift();
    var val = node(currentIndex++, temp, temp.value);
    currentNode = val;

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
    currentNode.appendChild(digit);
    currentNode = digit;

    edges.push(edge(currentIndex, currentIndex+1));
    var temp = tokenSet.shift();
    var val = node(currentIndex++, temp, temp.value);
    currentNode.appendChild(val);

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
    currentNode.appendChild(intop);

    return true;
  }else {
    return false;
  }
}
