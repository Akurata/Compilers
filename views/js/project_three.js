
var astTree;
//var order = []; //Leaf node container
var list = [];
var charArray = []; //Char array container
var dfs_quotes = 0;
function depthFirstSearch(node) {
  var hold;
  var hit = null;
  if(node.type) {
    if(node.type === "stem") {
      var sNode = new stem(node.text.name, node.token, node.token.key); //Create stem node
      charArray = []; //Reset char array container
      list.push(sNode); //Way to track the returned values from the DFS
      hit = sNode;
    }else if(node.type === "leaf") {
      var lNode = new leaf(node.text.name, node.token, node.token.key); //Create leaf node
      if(lNode.name === "\"" || lNode.key === "CHAR") { //Combine chars into strings
        if(lNode.name === "\"") {
          dfs_quotes++;
        }
        charArray.push(lNode);

        if(dfs_quotes > 0 && dfs_quotes%2 === 0) {
          var str = charArray.map((char) => {return char.name}).join('');
          var temp = new leaf(str.replace(/\"\"/g, '\"'), charArray, "STRING");
          list.push(temp);
          charArray = [];
        }
      }else {
        list.push(lNode); //Way to track the returned values from the DFS
      }
    }
  }

  if(node.children) {
    node.children.forEach((child) => {
      depthFirstSearch(child);
    });

    if(hit) {
      list.push(new stem(`End${node.text.name}`));
    }
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

  console.log(Object.assign([], list));
  console.log(ast);

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
  if(!cst_err) {
    codeGen(ast);
  }
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
  if(list[start+1] && list[start+1].name !== "EndPrintStmt") {
    start++; //Increment past print token
  }

  var printLink = operationExpr("EndPrintStmt");
  printStmtNode.appendChild(printLink);

  current.appendChild(printStmtNode);
  current = printStmtNode;
}


function saAssignmentStatement(node) {
  var assignNode = node;
  assignNode.children = [];

  if(list[start].name === "AssignStmt") {
    start++;
  }

  assignNode.appendChild(list[start]); //Grab variable to be assigned
  start++;
  var assLink = operationExpr("EndAssignStmt"); //Append sub-tree of components
  start++;
  assignNode.appendChild(assLink);
  current.appendChild(assignNode);
  current = assignNode;
}


function saVarDecl(node) {
  var varDeclNode = node
  while(list[start-1].name !== "VarDecl") { //Find VarDecl Start
    start++;
  }

  while(list[start].name !== "EndVarDecl") { //Add type and name
    varDeclNode.appendChild(list[start]);
    start++;
  }
  //start++;
  current.appendChild(varDeclNode);
  current = varDeclNode;
}


function saWhileStatement(node) {
  var whileStmtNode = node;
  /*
  if(list[start + 1].name !== "EndBooleanExpr") {
    console.log('check inc')
    start++; //Increment past while token
  }*/
  //start++; //Increment past Boolean Expr token
  var whileLink = operationExpr("EndBooleanExpr");
  start++;
  whileStmtNode.children = [whileLink];
  current.appendChild(whileStmtNode);
  current = whileStmtNode;
}


function saIfStatement(node) {
  var ifStmtNode = node;
  //start++; //Increment past if token
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
        vals.push(list[start]);
      }
    }
    start++;
  }
  if(length === 1) {
    link = vals[0]
  }
  if(!link) {
    console.log('RETURNING NULL', link, matchString)
  }
  return link;
}


function setToParent() {
  current = current.parent;
  start++; //NEW
}
