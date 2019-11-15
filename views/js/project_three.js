//Tools for traversals
//Imported from algorithms class
var astTree;
var group = [];
var stems = [];
var order = [];
function depthFirstSearch(node) {
  var hold;
  if(node.children) { //If stem
    node.children.forEach((child) => {
      depthFirstSearch(child);
    });
  }
  if(node.type) {
    if(node.type == "stem") {
      var sNode = new stem(node.text.name, node.token);
      sNode.children = order;
      order = [];
      stems.push(sNode);
    }else if(node.type == "leaf") {
      order.push(new leaf(node.text.name, node.token))
    }
  }
}


function stem(name, token) {
  var stemNode = {text: {}};
  stemNode.name = name;
  stemNode.text.name = name;
  stemNode.token = token;
  stemNode.type = "stem";
  stemNode.children = [];
  return stemNode;
}
var leafs = [];
function leaf(name, token) {
  var leafNode = {text: {}};
  leafNode.name = name;
  leafNode.text.name = name;
  leafNode.token = token;
  leafNode.type = "leaf";
  return leafNode;
}



function semanticAnalysis(cst, id) {
  depthFirstSearch(cst);
  console.log('DFS\n', stems);
  var ast = new stem('Root');

  var refine = [];
  var hold = [];
  stems.forEach((stem, i) => {
    if(stems[i+1] && stems[i+1].type == "stem") {
      hold.push(stem);
    }else {
      stem.children = hold;
      refine.push(stem)
    }
  });
  console.log(refine)
  cstTree = new Treant({
    chart: {
      container: '#output_ast'
    },
    nodeStructure: refine[0]
  });
}
