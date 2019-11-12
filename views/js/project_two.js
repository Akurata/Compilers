
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

  this.node.nextChildOver = () => {
    //return this.parent.children
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
  currentNode: {}
}
var edges = [];
function parse(programTokens, p) {
  tokenSet = programTokens; //Update tokens refernce

  outputParse(`${id > 0 ? '\n' : ''}INFO PARSER - Parsing program ${p}...`);
  var result = match([program]);
  if(result.isValid) {
    var prog = new node('', `Program ${p}`)
    prog.appendChild(cst.currentNode);
    cst.currentNode = prog;
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
    nodeStructure: cst.head
  });

  //outputCST(cst.toString());

  //var nodes = new vis.DataSet([]);
  //var edges = new vis.DataSet([]);
  //cst.setData({nodes:nodes, edges:edges});
}


var curr = 0;
function match(targetTokens) {
  tokenSet = Object.assign([], tokenSet);
  var valid = {
    isValid: false,
    epsilon: false,
    tokens: []
  };
  //console.log(`MATCH: ${typeof targetTokens[curr]}`)
  console.log(targetTokens)

  for(var i = 0; i < targetTokens.length; i++) {
    var isTerminal = typeof targetTokens[i] === 'function';
    var numTokens = (tokenSet.length - curr);

    if(numTokens > 1) {
      if((isTerminal) ? targetTokens[i]() : tokenSet[curr].value.match(targetTokens[i])) {
        console.log('MATCHED', targetTokens[i])
        //console.log(tokenSet[curr])
        console.log(Object.assign({}, cst.currentNode));
        console.log(tokenSet[curr])
        valid.isValid = true;
        valid.tokens.push(tokenSet[curr]);
      }else {
        valid.epsilon = true;
        break;
      }
      curr++;
    }

    console.log(tokenSet.length, numTokens)
  }

  return valid;
}



function program() {
  console.log('PARSE PROGRAM');

  outputParse(`  TRY - program()`);
  var result = match([block, '$']);
  if(result.isValid) {
    outputParse(`  SUCCESS - program()`);
    edges.push(edge(currentIndex, currentIndex+1));
    var program = new node('', 'Program');
    program.appendChild(cst.currentNode)
    cst.head = cst.currentNode;

    return true;
  }else {
    return false;
  }
}


function block() {
  console.log('PARSE BLOCK');

  outputParse(`  TRY - block()`);
  var result = match(['{', statementList, '}']);
  if(result.isValid) {
    outputParse(`  SUCCESS - block()`);
    var block = new node('', 'Block');
    block.appendChild(new node(null, '{'));
    block.appendChild(cst.currentNode);
    block.appendChild(new node(null, '}'));

    cst.currentNode = block;
    //edges.push(edge(currentIndex, currentIndex+1));

    return true;
  }else {
    return false;
  }

}
//{intaa=1}

function statementList() {
  console.log('PARSE STATEMENT LIST');

  outputParse(`  TRY - statementList()`);
  var result = match([statement, statementList]);
  if(result.isValid) {
    outputParse(`  SUCCESS - statementList()`);
    //edges.push(edge(currentIndex, currentIndex+1));
    var stmtWrap = new node('', 'Statement List');

    var stmtList = new node('', 'Statement List');
    //stmtList.appendChild(cst.currentNode); //CST next node maybe??

    stmtWrap.appendChild(cst.currentNode);
    stmtWrap.appendChild(stmtList);

    cst.currentNode = stmtWrap;

    return true;
  }else if(result.epsilon) {
    console.log('THERE IS STATEMENT LIST WITH E')
    var eps = new node('', '\u03B5');
    eps.appendChild(cst.currentNode)
    cst.currentNode = eps;
    //cst.endChildren();
    return true;
  }else {
    return false;
  }

}


function statement() {
  console.log('PARSE STATEMENT');

  outputParse(`  TRY - statement()`);
  var stmt = new node('', 'Statement');
  if(match([printStatement]).isValid) {
    outputParse(`  SUCCESS - statement()`);
    stmt.appendChild(cst.currentNode);
    cst.currentNode = stmt;
    return true;
  }else if(match([assignmentStatement]).isValid) {
    outputParse(`  SUCCESS - statement()`);
    stmt.appendChild(cst.currentNode);
    cst.currentNode = stmt;
    return true;
  }else if(match([varDecl]).isValid) {
    outputParse(`  SUCCESS - statement()`);
    stmt.appendChild(cst.currentNode);
    cst.currentNode = stmt;
    return true;
  }else if(match([whileStatement]).isValid) {
    outputParse(`  SUCCESS - statement()`);
    stmt.appendChild(cst.currentNode);
    cst.currentNode = stmt;
    return true;
  }else if(match([ifStatement]).isValid) {
    outputParse(`  SUCCESS - statement()`);
    stmt.appendChild(cst.currentNode);
    cst.currentNode = stmt;
    return true;
  }else if(match([block]).isValid) {
    outputParse(`  SUCCESS - statement()`);
    stmt.appendChild(cst.currentNode);
    cst.currentNode = stmt;
    return true;
  }else {
    return false;
  }
}


function printStatement() {
  console.log('PARSE PRINT STATEMENT');

  outputParse(`  TRY - printStatement()`);
  var result = match(['print', /\(/, expr, /\)/]);
  if(result.isValid) {
    outputParse(`  SUCCESS - printStatement()`);
    var printStmt = new node(result.tokens[0], 'Print Statement');
    printStmt.appendChild(new node(result.tokens[1], 'Print'));
    printStmt.appendChild(new node(result.tokens[2], '('));
    printStmt.appendChild(cst.currentNode);
    printStmt.appendChild(new node(result.tokens[3], ')'));
    cst.currentNode = printStmt;

    return true;
  }else {
    return false;
  }
}


function assignmentStatement() {
  console.log('PARSE ASSIGNMENT STATEMENT');

  outputParse(`  TRY - assignmentStatement()`);
  var result = match([id, /\=/, expr]);
  if(result.isValid) {
    outputParse(`  SUCCESS - assignmentStatement()`);
    var assStmt = new node('', 'Assignment Statement');

    var idStmt = new node('', 'ID')
    id.appendChild(new node(result.tokens[0], result.tokens[0].value));
    assStmt.appendChild(id);

    var eqSign = new node(result.tokens[1], result.tokens[1].value);
    assStmt.appendChild(eqSign);

    var exprStmt = new node(result.tokens[2], result.tokens[2].value);
    expr.appendChild(cst.currentNode);
    assStmt.appendChild(expr);

    cst.currentNode = assStmt;
    return true;
  }else {
    return false;
  }

}


function varDecl() {
  //console.log('PARSE VAR DECL');
  outputParse(`  TRY - varDecl()`);
  var result = match([type, id]);
  if(result.isValid) {
    outputParse(`  SUCCESS - varDecl()`);
    var varDecStmt = new node('', 'Var Decl');
    varDecStmt.appendChild(cst.currentNode);
    cst.currentNode = varDecStmt;
    return true;
  }else {
    return false;
  }
}


function whileStatement() {
  //console.log('PARSE WHILE STATEMENT');
  outputParse(`  TRY - whileStatement()`);
  var result = match(['while', booleanExpr, block]);
  if(result.isValid) {
    outputParse(`  SUCCESS - whileStatement()`);

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
    return false;
  }
}


function ifStatement() {
  //console.log('PARSE IF STATEMENT');
  outputParse(`  TRY - ifStatement()`);
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
  }
}


function expr() {
  console.log('PARSE EXPR');

  outputParse(`  TRY - expr()`);
  var exp = new node('', 'Expression')
  if(match([intExpr]).isValid) {
    outputParse(`  SUCCESS - expr()`);
    exp.appendChild(cst.currentNode);
    cst.currentNode = exp;
    return true;
  }else if(match([stringExpr]).isValid) {
    outputParse(`  SUCCESS - expr()`);
    exp.appendChild(cst.currentNode);
    cst.currentNode = exp;
    return true;
  }else if(match([booleanExpr]).isValid) {
    outputParse(`  SUCCESS - expr()`);
    exp.appendChild(cst.currentNode);
    cst.currentNode = exp;
    return true;
  }else if(match([id]).isValid) {
    outputParse(`  SUCCESS - expr()`);
    exp.appendChild(cst.currentNode);
    cst.currentNode = exp;
    return true;
  }else {
    return false;
  }
}


function intExpr() {
  console.log('PARSE INT EXPR');

  outputParse(`  TRY - intExpr()`);
  if(match([digit, intOp, expr]).isValid) {
    outputParse(`  SUCCESS - intExpr()`);
    return true;
  }else if(match([digit]).isValid) {
    return true;
  }else {
    return false;
  }
}


function stringExpr() {
  console.log('PARSE STRING EXPR');

  outputParse(`  TRY - stringExpr()`);
  if(match(['\"', charList, '\"']).isValid) {
    outputParse(`  SUCCESS - stringExpr()`);
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
    return false;
  }
}


function booleanExpr() {
  //console.log('PARSE BOOLEAN EXPR');

  outputParse(`  TRY - booleanExpr()`);
  var result = match([/^(\()$/, expr, /^(\))$/]);
  if(result.isValid) {
    outputParse(`  SUCCESS - booleanExpr()`);
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
    return false;
  }

}


function id() {
  console.log('PARSE ID');

  outputParse(`  TRY - id()`);
  if(match([char]).isValid) {
    outputParse(`  SUCCESS - id()`);
    //edges.push(edge(currentIndex, currentIndex+1));
    var varid = new node('', 'ID');
    varid.appendChild(cst.currentNode);
    cst.currentNode = varid;

    //edges.push(edge(currentIndex, currentIndex+1));
    //var temp = tokenSet.shift();
    //var varVal = new node(temp, temp.value);
    //cst.currentNode.appendChild(varVal);
    //cst.currentNode = varVal;

    return true;
  }else {
    return false;
  }
}


function charList() {
  console.log('PARSE CHAR LIST');

  utputParse(`  TRY - charList()`);
  if(matchConsume([char, charList])) {
    outputParse(`  SUCCESS - charList()`);
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


function type() {
  //console.log('PARSE TYPE');

  outputParse(`  TRY - type()`);
  var result = match([/^(int|string|boolean)$/]);
  if(result.isValid) {
    outputParse(`  SUCCESS - type()`);
    var typeVal = new node(result.tokens[0], result.tokens[0].value);
    typeVal.appendChild(cst.currentNode);
    var typeNode = new node('', 'Type');
    typeNode.appendChild(typeVal);

    return true;
  }else {
    return false;
  }

}


function char() {
  console.log('PARSE CHAR');
  outputParse(`  TRY - char()`);
  var result = match([/^[a-z]$/]);
  if(result.isValid) {
    //edges.push(edge(currentIndex, currentIndex+1));
    //cst.currentNode.children = [];

    outputParse(`  SUCCESS - char()`);
    var charNode = new node(result.tokens[0], result.tokens[0].value);
    //charNode.appendChild(cst.currentNode);
    //charNode.parent = null;
    cst.currentNode = charNode;

    //edges.push(edge(currentIndex, currentIndex+1));


    return true;
  }else {
    return false;
  }
}


function space() {
  //console.log('PARSE SPACE');
  outputParse(`  TRY - space()`);
  return matchConsume([/\s/]);
}


function digit() {
  console.log('PARSE DIGIT');
  outputParse(`  TRY - digit()`);
  if(match([/^[0-9]$/]).isValid) {
    outputParse(`  SUCCESS - digit()`);
    edges.push(edge(currentIndex, currentIndex+1));
    var digit = node('', 'Digit');
    cst.currentNode.appendChild(digit);
    cst.currentNode = digit;

    edges.push(edge(currentIndex, currentIndex+1));
    var temp = tokenSet.shift();
    var val = node(temp, temp.value);
    cst.currentNode.appendChild(val);

    return true;
  }else {
    return false;
  }
}


function boolOp() {
  //console.log('PARSE BOOL OP');
  outputParse(`  TRY - boolOp()`);
  return matchConsume([/^(==|!=)$/]);
}

function boolVal() {
  //console.log('PARSE BOOL VAL');
  outputParse(`  TRY - boolVal()`);
  return matchConsume([/^(false|true)$/]);
}


function intOp() {
  console.log('PARSE INT OP');
  outputParse(`  TRY - intOp()`);
  if(match([/^\+$/]).isValid) {
    outputParse(`  SUCCESS - intOp()`);
    edges.push(edge(currentIndex, currentIndex+1));
    var temp = tokenSet.shift();
    var intop = node(temp, temp.value);
    cst.currentNode.appendChild(intop);

    return true;
  }else {
    return false;
  }
}
