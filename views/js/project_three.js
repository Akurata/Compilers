//Tools for traversals
//Imported from algorithms class
var astTree;
var stems = [];
var order = []; //Leaf node container
var list = [];
var charArray = []; //Char array container
function depthFirstSearch(node) {

  /*
  console.log(node)
  var hit = false;
  switch(node.text.name) {
    case "Block": saBlock(node); hit = true; break;
    case "PrintStmt": saPrintStatement(node); hit = true; break;
    case "AssignStmt": saAssignmentStatement(node); hit = true; break;
    case "VarDecl": saVarDecl(node); hit = true; break;
    case "WhileStmt": saWhileStatement(node); hit = true; break;
    case "IfStmt": saIfStatement(node); hit = true; break;
    case "BoolOp": saBoolOp(node); hit = true; break;
    case "IntOp": saBoolVal(node); hit = true; break;
    default: break;
  }
  if(!hit) {
    if(node.children) {
      node.children.forEach((child) => {
        depthFirstSearch(child);
      });
    }
  }*/



  var hold;
  var hit = null;
  if(node.type) {
    if(node.type === "stem") {
      var sNode = new stem(node.text.name, node.token, node.token.key); //Create leaf node
      console.log(`HIT: ${node.text.name}`)
      //console.log(sNode);

      sNode.children = order; //Apend leaf nodes to stem children
      if(charArray.length > 0) { //If there is a char string
        var temp = new leaf(charArray.map((char) => {return char.name}).join(''), charArray); //Join the array and create leaf node
        list.push(temp)
        sNode.children.push(temp); //Append that to children
      }
      order = []; //Reset leaf node container
      charArray = []; //Reset char array container
      list.push(sNode); //Way to track the returned values from the DFS
      stems.push(sNode); //Enqueue stem
      hit = sNode;

    }else if(node.type === "leaf") {
      var lNode = new leaf(node.text.name, node.token, node.token.key); //Create leaf node
      console.log(`HIT: ${node.text.name}`)
      //console.log(lNode);

      if(lNode.name === "\"" || lNode.key === "CHAR") { //Combine chars into strings
        charArray.push(lNode);
      }else {
        list.push(lNode); //Way to track the returned values from the DFS
        order.push(lNode);
      }
      //hit = lNode;

    }
  }
  if(node.children) {
    node.children.forEach((child) => {
      depthFirstSearch(child);
    });
  }
  if(hit) {
    console.log(hit)
    console.log(`RESOLVE ${node.text.name}`)
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
  stemNode.children = [];
  return stemNode;
}
var leafs = [];
function leaf(name, token, key) {
  var leafNode = {text: {}};
  leafNode.name = name;
  leafNode.text.name = name;
  leafNode.token = token;
  leafNode.type = "leaf";
  leafNode.key = key;
  leafNode.children = [];
  return leafNode;
}


var ast = new stem('Root');
var current = ast;
var start = 0;
var end = 0;
function semanticAnalysis(cst, id) {
  depthFirstSearch(cst);

  var refine = [];
  var hold = [];


  stems.forEach((stem, i) => { //First Pass to organize stems as they appear.
    if(stems[i+1] && stems[i+1].type == "stem") {
      hold.push(stem);
    }else {
      stem.children = hold;
      refine.push(stem)
    }
  });


  console.log(list)
  list.forEach((node) => {
    switch(node.text.name) {
      case "Block": saBlock(node); break;
      case "PrintStmt": saPrintStatement(node); break;
      case "AssignStmt": saAssignmentStatement(node); break;
      case "VarDecl": saVarDecl(node); break;
      case "WhileStmt": saWhileStatement(node); break;
      case "IfStmt": saIfStatement(node); break;
      case "BoolOp": saBoolOp(node); break;
      case "IntOp": saBoolVal(node); break;
      default: break;
    }
  })



  //console.log(refine)
  //ast.children = stems;
  cstTree = new Treant({
    chart: {
      container: '#output_ast'
    },
    nodeStructure: ast
  });
}



function saBlock(node) {
  console.log('Call saBlock')
  var endindex = 0;
  for(var i = start; i < list.length; i++) { //Get range of tokens, block takes up
    if(list[i].name === "EndBlock") {
      endIndex = i;
      break;
    }
  }
  var blockNode = new stem(node.name, node.token);
  current.children.push(blockNode);
  current = blockNode;
  start++;
}


function saPrintStatement(node) {
  console.log('Call saPrintStatement')
}
function saAssignmentStatement(node) {
  console.log('Call saAssignmentStatement')
}


function saVarDecl(node) {
  console.log('Call saVarDecl');
  var varDeclNode = node//new stem(node.name, node.token);
  start++ //Increment past VarDecl token

  while(list[start].name !== "EndVarDecl") {
    varDeclNode.children.push(list[start]);
    start++;
  }
  start++;
  current.children.push(varDeclNode);
  //current = varDeclNode;
}


function saWhileStatement(node) {
  console.log('Call saWhileStatement')
  var whileStmtNode = node;
  start++; //Increment past while token
  start++; //Increment past Boolean Expr token


  var vals = [];
  var op = list[start+1];
  while(list[start].name !== "EndBooleanExpr") { //Determine range of tokens


    console.log(list[start])
    start++;
  }
  start++;




  //while(list[start].name !== "EndWhile") {

  //}
}


function saIfStatement(node) {
  console.log('Call saIfStatement')
}
function saBoolOp(node) {
  console.log('Call saBoolOp')
}
function saBoolVal(node) {
  console.log('Call saBoolVal')
}
