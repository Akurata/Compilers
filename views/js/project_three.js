
var astTree;
//var order = []; //Leaf node container
var list = [];
var charArray = []; //Char array container
function depthFirstSearch(node) {
  var hold;
  var hit = null;
  if(node.type) {
    if(node.type === "stem") {
      var sNode = new stem(node.text.name, node.token, node.token.key); //Create leaf node
      //sNode.children = order; //Apend leaf nodes to stem children
      //order = []; //Reset leaf node container
      charArray = []; //Reset char array container
      list.push(sNode); //Way to track the returned values from the DFS
      //stems.push(sNode); //Enqueue stem
      hit = sNode;
    }else if(node.type === "leaf") {
      var lNode = new leaf(node.text.name, node.token, node.token.key); //Create leaf node
      if(lNode.name === "\"" || lNode.key === "CHAR") { //Combine chars into strings
        charArray.push(lNode);
      }else {
        list.push(lNode); //Way to track the returned values from the DFS
        //order.push(lNode);
      }
    }
  }
  if(node.children) {
    node.children.forEach((child) => {
      depthFirstSearch(child);
    });
  }
  if(hit) {
    if(charArray.length > 0 && node.type === "stem") { //If there is a char string
      var str = charArray.map((char) => {return char.name}).join('');
      var test = str.indexOf('\"\"');
      if(test > 0) { //Join the array and create leaf node
        var alpha = new leaf(str.substring(0, test), charArray, "STRING");
        list.push(alpha);
        sNode.appendChild(alpha); //Append that to children
        var beta = new leaf(str.substring(test+1, str.length), charArray, "STRING");
        list.push(beta);
        sNode.appendChild(beta); //Append that to children
      }else {
        var temp = new leaf(str, charArray, "STRING")
        list.push(temp);
        sNode.appendChild(temp); //Append that to children
      }
      charArray = [];
    }
    list.push(new stem(`End${node.text.name}`));
  }
}


function stem(name, token, key) {
  var stemNode = {text: {}};
  stemNode.name = name;
  stemNode.text.name = name;
  stemNode.token = token;
  stemNode.type = "stem";
  stemNode.key = key;
  stemNode.parent = null;
  stemNode.children = [];
  stemNode.appendChild = (child) => {
    if(!stemNode.children) {
      stemNode.children = [];
    }
    stemNode.children.push(child);
    if(child) {
      child.parent = stemNode;
    }
  }
  return stemNode;
}


function leaf(name, token, key) {
  var leafNode = {text: {}};
  leafNode.name = name;
  leafNode.text.name = name;
  leafNode.token = token;
  leafNode.type = "leaf";
  leafNode.key = key;
  leafNode.parent = null;
  leafNode.children = [];
  leafNode.appendChild = (child) => {
    if(!leafNode.children) {
      leafNode.children = [];
    }
    leafNode.children.push(child);
    child.parent = leafNode;
  }
  return leafNode;
}


var ast = new stem('Root');
var current = ast;
var start = 0;
var end = 0;
var blocks = [];
var currentBlock = -1;

function semanticAnalysis(cst, id) {
  //cstTree

  depthFirstSearch(cst);

  list.forEach((node) => {
    switch(node.text.name) {
      case "Block": saBlock(node); break;
      case "EndBlock": setToParent(); break;
      case "PrintStmt": saPrintStatement(node); break;
      case "EndPrintStmt": setToParent(); break;
      case "AssignStmt": saAssignmentStatement(node); break;
      case "EndAssignStmt": setToParent(); break;
      case "VarDecl": saVarDecl(node); break;
      case "EndVarDecl": setToParent(); break;
      case "WhileStmt": saWhileStatement(node); break;
      case "EndWhileStmt": setToParent(); break;
      case "IfStmt": saIfStatement(node); break;
      case "EndIfStmt": setToParent(); break;
      default: break;
    }
  });

  //Display AST
  cstTree = new Treant({
    chart: {
      container: '#output_ast'
    },
    nodeStructure: ast
  });

  //Scope Check
  scopeCheck(id);

  //Code Gen time
  codeGen(ast);
}


function saBlock(node) {
  var blockNode = new stem(node.name, node.token);
  current.appendChild(blockNode);
  current = blockNode;
  start++;
}


function saPrintStatement(node) {
  var printStmtNode = node;
  printStmtNode.children = [];
  start++; //Increment past print token
  if(list[start].key === "DIGIT" || list[start].key === "ID") {
    var printLink = operationExpr("EndPrintStmt");
    printStmtNode.appendChild(printLink);
  }else if(list[start].key === "STRING" || list[start].key === "KEYWORDS") {
    printStmtNode.appendChild(list[start]);
    start++;
  }
  start++;
  current.appendChild(printStmtNode);
  current = printStmtNode;
}


function saAssignmentStatement(node) {
  var assignNode = node;
  assignNode.children = [];
  start++;
  assignNode.appendChild(list[start]); //Grab variable to be assigned
  start++;
  var assLink = operationExpr("EndAssignStmt"); //Append sub-tree of components
  start++;
  assignNode.appendChild(assLink);
  current.appendChild(assignNode);
  current = assignNode;
}


function saVarDecl(node) {
  var varDeclNode = node//new stem(node.name, node.token);
  start++ //Increment past VarDecl token
  while(list[start].name !== "EndVarDecl") {
    varDeclNode.appendChild(list[start]);
    start++;
  }
  start++;
  current.appendChild(varDeclNode);
  current = varDeclNode;
}


function saWhileStatement(node) {
  var whileStmtNode = node;
  start++; //Increment past while token
  start++; //Increment past Boolean Expr token
  var whileLink = operationExpr("EndBooleanExpr");
  start++;
  whileStmtNode.children = [whileLink];
  current.appendChild(whileStmtNode);
  current = whileStmtNode;
}


function saIfStatement(node) {
  var ifStmtNode = node;
  start++; //Increment past if token
  start++; //Increment past boolean expr token
  var ifLink = operationExpr("EndBooleanExpr");
  start++;
  ifStmtNode.children = [ifLink];
  current.appendChild(ifStmtNode);
  current = ifStmtNode;
}


function operationExpr(matchString) {
  var link = null;
  var vals = [];
  var length = 0;
  while(list[start].name !== matchString) { //Determine range of tokens
    length++;
    if(list[start].key === "KEYWORDS" && list[start].name !== 'true' && list[start].name !== 'false' || list[start].key === "SYMBOL") { //If matched bool/int op
      vals.forEach(() => {
        list[start].appendChild(vals.pop());
      });
      if(link) { //If Op already exists
        list[start].appendChild(link); //Add it to this items chldren
      }
      link = list[start];
    }else if(list[start].key) { //Must be ID or Digit
      if(link) {
        link.appendChild(list[start]);
      }else {
        vals.push(list[start])
      }
    }
    start++;
  }
  if(length === 1) {
    link = vals[0]
  }
  return link;
}


function setToParent() {
  current = current.parent;
}
