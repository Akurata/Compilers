
var refs = [];
var scopes = [];
function scopeCheck(id) {
  console.log(ast)
  var errs = false;
  var currentScope = new scope();
  var scopeTree = currentScope;
  var varEntry;
  for(var i = 0; i < list.length; i++) {
    if(list[i].name.match(/^(int|string|boolean)$/)) { //Identify new variable declerations
      if(list[i+1].key === "ID") { //Check for name
        varEntry = new variable(list[i].name, list[i+1].name);
        if(!currentScope.values[list[i+1].name]) { //Check if variable does not already exist in current scope
          currentScope.values[list[i+1].name] = varEntry;
        }else { //Else variable exists in current scope
          errs = true;
          console.log(list[i+1])
          outputSA(`ERROR - Variable ${list[i+1].name} is already declared in this scope (${list[i+1].token.row}:${list[i+1].token.col}).`)
        }
      }
    }else if(list[i].name === "Block") { //Create a new scope
      var newScope = new scope();
      currentScope.appendChild(newScope);
      currentScope = newScope;
    }else if(list[i].key === "ID") { //Check if program can access variable in scope
      if(!checkParentScopes(currentScope, list[i].name)) { //Check current + parent scopes for variable reference
        errs = true;
        outputSA(`ERROR - Variable ${list[i].name} has been called before being initialized (${list[i].token.row}:${list[i].token.col}).`);
      }
    }else if(list[i].name === "EndBlock") { //End current scope
      currentScope = currentScope.parentScope;
    }
  }
  if(!errs) {
    printScopeTree(scopeTree);
    outputSA(`INFO LEXER - Successfully completed semantic analysis on program ${id}`)
  }
}

function printScopeTree(scopeTree) {
  var stree = scopeTree;
  if(Object.keys(stree.values).length > 0) {
    Object.keys(stree.values).forEach((val) => {
      var row = document.createElement('tr');
      var index = document.createElement('td');
      index.innerHTML = stree.index;
      row.appendChild(index);
      var type = document.createElement('td');
      type.innerHTML = stree.values[val].type;
      row.appendChild(type);
      var name = document.createElement('td');
      name.innerHTML = val;
      row.appendChild(name);
      console.log(row)
      document.getElementById('output_symbol_table').appendChild(row);
    });
  }
  if(stree.children) {
    stree.children.forEach((child) => {
      printScopeTree(child);
    })
  }
}


function checkParentScopes(scope, target) {
  var testScope = scope;
  var found = false;
  while(!found && testScope.parentScope) {
    if(testScope.values[target]) {
      found = true;
    }else {
      testScope = testScope.parentScope;
    }
  }
  return found;
}


var scopeID = 0;
function scope() {
  var scopeEntry = {};
  scopeEntry.index = scopeID++;
  scopeEntry.values = {};
  scopeEntry.parentScope = {};
  scopeEntry.children = [];
  scopeEntry.appendChild = (child) => {
    if(!scopeEntry.children) {
      scopeEntry.children = [];
    }
    scopeEntry.children.push(child);
    child.parentScope = scopeEntry;
  }
  return scopeEntry;
}

function variable(type, name, value) {
  var variableEntry = {};
  variableEntry.type = type;
  variableEntry.name = name;
  variableEntry.value = value;
  return variableEntry;
}
