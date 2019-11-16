
var errs = false;
function scopeCheck(id) {
  console.log(ast)
  var currentScope = new scope();
  var scopeTree = currentScope;
  var varEntry;
  for(var i = 0; i < list.length; i++) {
    if(list[i].name.match(/^(int|string|boolean)$/)) { //Identify new variable declerations
      if(list[i+1].key === "ID") { //Check for name
        varEntry = new variable(list[i].name, list[i+1].name, list[i+1].token);
        if(!currentScope.values[list[i+1].name]) { //Check if variable does not already exist in current scope
          currentScope.values[list[i+1].name] = varEntry;
          i++;
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
    }else if(list[i].name === "AssignStmt") { //Validate type matches on assign statements
      var subContext = i+1;
      var find = checkParentScopes(currentScope, list[i+1].name);
      if(find) {
        while(list[subContext].name !== "EndAssignStmt") {
          if(list[subContext].key !== "SYMBOL" && list[subContext].key !== "ID") {
            if(find.type === "int") {
              if(list[subContext].key !== "DIGIT") {
                errs = true;
                outputSA(`ERROR - Type Mismatch for ${list[i].name} - expected typeof ${find.type} (${find.token.row}:${find.token.col})`);
              }
            }else if(find.type === "string") {
              if(list[subContext].key !== "STRING") {
                errs = true;
                outputSA(`ERROR - Type Mismatch for ${list[i].name} - expected typeof ${find.type} (${find.token.row}:${find.token.col})`);
              }
            }else if(find.type === "boolean") {
              if(list[subContext].name !== "false" || list[subContext].name !== "true") {
                errs = true;
                outputSA(`ERROR - Type Mismatch for ${list[i].name} - expected typeof ${find.type} (${find.token.row}:${find.token.col})`);
              }
            }
          }
          subContext++;
        }
      }else {
        errs = true;
        outputSA(`ERROR - Variable not declared in scope (${list[i].tokens.row}:${list[i].tokens.col})`)
      }
    }
  }
  if(!errs) {
    console.log(scopeTree)
    printScopeTree(scopeTree);
    outputSA(`\nINFO SemanticAnalysis - Successfully completed semantic analysis on program ${id}`)
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
      var varRow = document.createElement('td');
      varRow.innerHTML = stree.values[val].token.row;
      row.appendChild(varRow);
      var varCol = document.createElement('td');
      varCol.innerHTML = stree.values[val].token.col;
      row.appendChild(varCol);
      document.getElementById('output_symbol_table').appendChild(row);


      if(!stree.values[val].interaction) { //Check if a var is initialized but never used.
        outputSA(`WARNING - Variable ${stree.values[val].name} is declared but never used (${stree.values[val].token.row}:${stree.values[val].token.col}).\n`)
      }
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
      testScope.values[target].interaction = true; //Set this var marked as accessed
      found = testScope.values[target];
    }else {
      testScope = testScope.parentScope;
    }
  }
  return found;
}

function checkUnusedVar(scope) {
  var testScope = scope;
  var result = false;
  if(testScope.children.length > 0) {
    Object.keys(testScope.values).forEach((val) => {
      if(!testScope.values[val].interaction) {
        result = testScope.values[val];
      }
    });
    testScope.children.forEach((child) => {
      checkUnusedVar(child);
    });
  }
  return result;
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

function variable(type, name, token, value) {
  var variableEntry = {};
  variableEntry.type = type;
  variableEntry.name = name;
  variableEntry.token = token;
  variableEntry.value = value;
  variableEntry.interaction = false;
  return variableEntry;
}
