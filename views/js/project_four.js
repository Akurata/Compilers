
/**
 * @file Project 4
 * @author Alex Kurata
*/


class x6502 {
  constructor() {
    this.opCodes = {
      'A9': {
        mnemonic: 'LDA',
        desc: 'Load the accumulator with a constant.'
      },
      'AD': {
        mnemonic: 'LDA',
        desc: 'Load the accumulator from memory.'
      },
      '8D': {
        mnemonic: 'STA',
        desc: 'Store the accumulator in memory.'
      },
      '6D': {
        mnemonic: 'ADC',
        desc: 'Add with carry.'
      },
      'A2': {
        mnemonic: 'LDX',
        desc: 'Load the X register with a constant.'
      },
      'AE': {
        mnemonic: 'LDX',
        desc: 'Load the X register from memory.'
      },
      'A0': {
        mnemonic: 'LDY',
        desc: 'Load the Y register with a constant.'
      },
      'AC': {
        mnemonic: 'LDY',
        desc: 'Load the Y register from memory.'
      },
      'EA': {
        mnemonic: 'NOP',
        desc: 'No Operation.'
      },
      '00': {
        mnemonic: 'BRK',
        desc: 'Break (which is really a system call).'
      },
      'EC': {
        mnemonic: 'CPX',
        desc: 'Compare a byte in memory to the X reg.'
      },
      'D0': {
        mnemonic: 'BNE',
        desc: 'Branch n bytes if Z flag = 0.'
      },
      'EE': {
        mnemonic: 'INC',
        desc: 'Increment the value of a byte.'
      },
      'FF': {
        mnemonic: 'SYS',
        desc: 'System Call.'
      }
    };
  }

  getInfo(opCode) {
    return (this.opCodes[opCode] ? this.opCodes[opCode] : {desc: 'value'});
  }
}





/**
 * @class JumpTable
 *
*/
class JumpTable {
  constructor() {
    this.contents = {};
    this.jumpCounter = 0;
  }

  set(tempAddress, start, end, ref, distance) {
    var addr = (tempAddress) ? tempAddress : `J${this.jumpCounter++}`;
    this.contents[addr] = (this.contents[addr] ? this.contents[addr] : {});
    this.contents[addr].start = (start) ? start : this.contents[addr].start;
    this.contents[addr].end = (end) ? end : (this.contents[addr].end ? this.contents[addr].end : null);
    this.contents[addr].ref = ref;
    this.contents[addr].distance = distance;
    return addr;
  }

  resolve(ref) {
    Object.keys(this.contents).forEach((jump) => {
      if(!this.contents[jump].end && this.contents[jump].ref == ref) {
        this.contents[jump].end = code.value().length;
      }
    })
  }
}


/**
 * @class StaticTable
 *
*/
class StaticTable {
  constructor() {
    this.contents = [];
    this.offset = 0;
  }

  add(varName, type, value) {
    console.log(JSON.parse(JSON.stringify(codeScope)))
    if(!varName) {
      varName = `T${tempAddrCount}`
    }

    var search = this.findVar(varName, codeScope.currentScope);
    if(search) {
      console.log('existing value', varName, value)
      return this.update(varName, value, codeScope.currentScope);
    }else {
      var hold = {};
      if(type === "STRING") {
        hold = {
          tempAddress: `T${tempAddrCount++}`,
          type: type,
          varName: varName,
          offset: [],
          value: []
        };
      }else {
        hold = {
          tempAddress: `T${tempAddrCount++}`,
          type: type,
          varName: varName,
          offset: this.offset++,
          value: (value ? value : '00')
        };
      }

      this.contents.push(hold);
      return hold;
    }

  }

  findVar(varName, tmpScope) {
    var search = tmpScope.static.contents.find((a) => {return a.varName == varName});
    if(search) {
      return search;
    }

    if(tmpScope.parentLevel != null) {
      var tmp = codeScope.children.find((a) => {return a.level == tmpScope.parentLevel});
      return this.findVar(varName, tmp);
    }else {
      return false;
    }
  }

  update(varName, value, scope) {
    //console.log(scope)
    var entry = this.findVar(varName, codeScope.currentScope);
    //console.log(entry)

    if(entry.type === "STRING") {
      entry.value = [];
      value.split('').forEach((char) => {
        entry.value.push(char.toString(16));
        entry.offset.push(this.offset++);
      });
      entry.value.push('00');
      entry.offset.push(this.offset++);
    }else {
      entry.value = value;
    }
    return entry;
  }

}


/**
 * @class ScopeTable
 *
*/
class ScopeTable {
  constructor() {
    this.scopeLevel = 0;
    this.currentScope = {};
    this.children = [];
  }

  newScope() {
    var hold = {
      level: this.scopeLevel++,
      static: new StaticTable(),
      parentLevel: this.currentScope.level
    };
    this.children.push(hold);
    //this.currentScope.next = hold;
    this.currentScope = hold;
    return this.currentScope;
  }

  leaveScope() {
    this.currentScope = this.children.find((a) => {return a.level === this.currentScope.parentLevel})
    //this.currentScope = this.parent;
    return this.currentScope;
  }
}


/**
 * @class Code
 *
*/
class Code {
  constructor() {
    this.contents = [];
    this.extra = [];
  }

  addCode(opCode, value, silent) {
    opCode = ((opCode.toString().length < 2) ? `0${opCode}` : opCode);
    this.contents.push(opCode);
    outputCodeGen(opCode);
    if(!silent) {
      if(this.contents.length + this.extra.length < 256) {
        outputCodeLog(`   Add OpCode ${opCode}.`);
        if(value) {
          outputCodeLog(`   -- ${opCode} ~ ${value}`);
        }else {
          outputCodeLog(`   -- ${(cpu.getInfo(opCode).mnemonic ? cpu.getInfo(opCode).mnemonic : opCode)} ~ ${cpu.getInfo(opCode).desc}`);
        }
      }else {
        outputCodeLog(`Warning: Program exceeds potential call stack size.`);
      }
    }
  }

  replace(target, val) {
    this.contents.forEach((opCode, i) => {
      if(opCode === target) {
        this.contents[i] = val;
      }
    });
  }

  value() {
    return this.contents;
  }
}


var cpu = new x6502();
var jump = new JumpTable();
var codeScope = new ScopeTable();
var code = new Code();
var tempAddrCount = 0;




function codeGen(ast) {
  var input = list;
  console.log(Object.assign({}, input));

  while(input.length > 0) {
    switch(input.shift().name) {
      case 'Block': generateBlock(); break;
      case 'EndBlock': generateEndBlock(); break;
      case 'VarDecl': generateVarDecl(input.shift(), input.shift()); break;
      case 'AssignStmt': generateAssignStmt(input.shift(), input); break;
      case 'WhileStmt': generateWhileStmt(input); break;
      case 'EndWhileStmt': generateEndWhileStmt(); break;
      case 'PrintStmt': generatePrint(input); break;
      case 'IfStmt': generateIfStmt(input); break;
      case 'EndIfStmt': jump.resolve('IF'); break;
      default: break;
    }
  }
  console.log(jump);
  console.log(codeScope);
  console.log(code);

  replaceTempAddr();
}

function generateBlock() {
  console.log('Gen Block');
  outputCodeLog('Generate Block - New Scope');
  //Go to new scope
  codeScope.newScope();
}

function generateEndBlock() {
  console.log('Gen EndBlock');
  outputCodeLog('Generate EndBlock - End Scope');
  //Go back one scope
  codeScope.leaveScope();
}


function generateVarDecl(type, varName) {
  console.log('Generate VarDecl');
  outputCodeLog('Generate VarDecl');

  //Enter var into static table to get temp address
  var input = codeScope.currentScope.static.add(varName.name, type.key);

  //Load accumulator with default 00
  code.addCode('A9');
  code.addCode('00', 'Default Value');

  //Store accumulator in memory at 00input.tempAddress
  code.addCode('8D');
  code.addCode(input.tempAddress, `Temporary address for [${varName.name}]`);
  code.addCode('00', 'Address');
}


function generateAssignStmt(varName, list) {
  console.log('Gen AssignStmt');
  outputCodeLog('Generate AssignStmt');

  if(list[1].name.match(/^End./)) { //If assignment is single token
    var value = list.shift();

    //Update var in static table
    var input = codeScope.currentScope.static.update(varName.name, value.name, codeScope.currentScope);

    //Load accumulator with assign value
    if(value.key === "ID") {
      code.addCode('AD');
      code.addCode(codeScope.currentScope.static.findVar(varName.name, codeScope.currentScope).tempAddress);
      code.addCode('00', 'Address');
    }else if(value.key === "DIGIT") {
      code.addCode('A9');
      code.addCode(value.name);
    }

    //Store the accumulator in memory
    code.addCode('8D');
    code.addCode(input.tempAddress, `Temporary address for [${varName.name}]`);
    code.addCode('00', 'Address');
  }else { //Must be operation
    var buffer = [];
    while(!list[0].name.match(/^End./)) { //Gather all operation parts in order
      buffer.push(list.shift());
    }
    //generateOperation(varName.name, buffer);
    var result = generateAddition(varName.name, buffer);
    console.log(result)
    //code.addCode('AD');
    //code.addCode(result.tempAddress, 'Load temporary address from addition');
    //code.addCode('00', 'Address');

    //Save to permenant memory address
    //code.addCode('8D');
    //code.addCode(codeScope.currentScope.static.findVar(varName.name, codeScope.currentScope).tempAddress);
    //code.addCode('00', 'Address');
  }

}

var openWhile;
function generateWhileStmt(input) {
  console.log('Gen While');
  outputCodeLog('Generate While');

  openWhile = code.value().length;

  var boolRes = generateBoolExpr(input);


  var whileJump = jump.set(null, code.value().length-2, null, 'WHILE');
  code.addCode('D0');
  code.addCode(`J${whileJump.replace(/[A-Z]/g, '')}`)
  //console.log(Object.assign({}, input))


  //If z flag is 0, branch out of while
  //If z flag is 1, continue until end of block, then branch back

}


function generateEndWhileStmt() {
  jump.resolve('WHILE');
  //console.log(Math.abs((code.value().length - 255) - openWhile).toString(16))

  var endVal = (256 - code.value().length+3) + openWhile;
  var backJump = jump.set(null, code.value().length, null, 'WHILE_LOOP', endVal);
  code.addCode('D0');
  code.addCode(`J${backJump.replace(/[A-Z]/g, '')}`);
}


function generatePrint(value) {
  console.log('Gen Print');
  outputCodeLog('Generate Print');

  //if string
  if(value[0].key == 'STRING') {
    value = value.shift();
    //store string in memory
    var input = codeScope.currentScope.static.add(null, value.key);
    codeScope.currentScope.static.update(input.tempAddress, value.name.replace(/\"/g, ''), codeScope.currentScope);

    //Load string address
    code.addCode('A0');
    code.addCode(input.tempAddress);

    //Call Print
    code.addCode('A2');
    code.addCode('02');

  }else { //must be var
    //var input = codeScope.currentScope.static.add(null, value.key);

    //load y register with var memory address
    code.addCode('AC');
    code.addCode(codeScope.currentScope.static.findVar(value[0].name, codeScope.currentScope).tempAddress);
    code.addCode('00', 'Address');

    //Call Print
    code.addCode('A2');
    code.addCode('01');
  }

  code.addCode('FF', 'Print String');
}


function generateBoolExpr(input) {
  var boolGroup = [];
  var needsOperation = [];
  var comparatorIndex = 0;
  var comparatorWhich = null;
  var end;

  //Collect the boolean expression group
  for(var i = 0; i < input.length; i++) {
    if(input[i].name === 'EndBooleanExpr') {
      end = i;
      break;
    }else if(input[i].name !== 'BooleanExpr') {
      boolGroup.push(input[i]);
      if(input[i].key === 'SYMBOL') {
        needsOperation.push(i);
      }else if(input[i].key === 'KEYWORDS') {
        comparatorIndex = i;
      }
    }
  }
  comparatorWhich = input[comparatorIndex].name;
  input = input.slice(end);

  var sideA = boolGroup.slice(0, comparatorIndex-1);
  var sideB = boolGroup.slice(comparatorIndex);
  console.log(sideA, sideB)

  //Generate addition functions if needed
  if(needsOperation.length > 0) {
    if(needsOperation.find((a) => {return a < comparatorIndex}) || sideA[0].key === 'DIGIT') {
      sideA = generateAddition(null, sideA);
    }else {
      sideA = codeScope.currentScope.static.findVar(sideA[0], codeScope.currentScope);
    }

    if(needsOperation.find((a) => {return a > comparatorIndex}) || sideB[0].key === 'DIGIT') {
      sideB = generateAddition(null, sideB);
    }else {
      sideB = codeScope.currentScope.static.findVar(sideB[0], codeScope.currentScope);
    }
  }else {
    if(sideA[0].key == 'ID') {
      sideA = codeScope.currentScope.static.findVar(sideA[0].name, codeScope.currentScope);
    }else {
      sideA = codeScope.currentScope.static.add(null, sideA[0].key);
      code.addCode('A9');
      code.addCode(sideA.varName);
      code.addCode('8D');
      code.addCode(sideA.tempAddress);
      code.addCode('00', 'Address');
    }

    console.log(sideB)
    if(sideB[0].key == 'ID') {
      sideB = codeScope.currentScope.static.findVar(sideB[0].name, codeScope.currentScope);
    }else {
      sideB = codeScope.currentScope.static.add(sideB[0].name, sideB[0].key);
      console.log(sideB)
      code.addCode('A9');
      code.addCode(sideB.varName);
      code.addCode('8D');
      code.addCode(sideB.tempAddress);
      code.addCode('00', 'Address');
    }
  }

  //Load x register with side A
  code.addCode('AE');
  code.addCode(sideA.tempAddress, 'Temporary address A');
  code.addCode('00', 'Address');

  //CPX to saved location of side B
  code.addCode('EC');
  code.addCode(sideB.tempAddress, 'Temporary address B');
  code.addCode('00', 'Address');

  if(comparatorWhich == '!=') {
    console.log('nequals')
    //Jump 2
    code.addCode('A9');
    code.addCode('00');

    code.addCode('D0');
    code.addCode('02');

    code.addCode('A9');
    code.addCode('01');

    code.addCode('A2');
    code.addCode('00');

    code.addCode('8D');
    code.addCode('00');
    code.addCode('00');

    code.addCode('EC');
    code.addCode('00');
    code.addCode('00');

    code.addCode('A9');
    code.addCode('01');

    code.addCode('D0');
    code.addCode('02');

    code.addCode('A9');
    code.addCode('00');

    code.addCode('A2');
    code.addCode('00');

    code.addCode('8D');
    code.addCode('00');
    code.addCode('00');

    code.addCode('EC');
    code.addCode('00');
    code.addCode('00');

  }else { //Must be '=='
    console.log('equals')
  }

  return {a: sideA, b: sideB, op: needsOperation, comparator: comparatorIndex};
}


function generateIfStmt(input) {
  console.log('Gen IfStmt');
  outputCodeLog('Generate IfStmt');

  var boolRes = generateBoolExpr(input);

  var ifJump = jump.set(null, code.value().length, null, 'IF');
  code.addCode('D0');
  code.addCode(`J${ifJump.replace(/[A-Z]/g, '')}`)

  //console.log(Object.assign([], sideA), Object.assign([], sideB));
}



function generateAddition(tag, expr) {
  console.log('Gen Addition');
  outputCodeLog('Generate Addition');

  //Create placeholder memory value
  var input;
  //if(tag) {
  //  input = codeScope.currentScope.static.findVar(tag, codeScope.currentScope);
  //}else {
    input = codeScope.currentScope.static.add(null, null);
    //var tag = input.varName;
  //}

  console.log(input, tag)
  //var first = expr.shift();

  //Set first value in accumulator
  code.addCode('A9');
  code.addCode('00', 'Set clear accumulator');

  //Reset temp address
  code.addCode('8D');
  code.addCode(input.tempAddress);
  code.addCode('00');

  //Store first value to temporary address
  //input = codeScope.currentScope.static.update(tag, parseInt(input.value) + parseInt(first.name), codeScope.currentScope);
  //code.addCode('8D');
  //code.addCode(input.tempAddress, 'Store first value in temp address');
  //code.addCode('00', 'Address');



  for(var i = 0; i < expr.length; i++) {
    var item = expr[i];
    console.log(item.key)
    if(item.key !== 'SYMBOL') {
      if(item.key === 'DIGIT') {

        //Set next value in accumulator
        code.addCode('A9');
        code.addCode(item.name, 'Set next value');

        //Add with carry using temp address
        code.addCode('6D');
        code.addCode(input.tempAddress, 'Add total value');
        code.addCode('00', 'Address');

        //Store new total value to temporary address
        //input = codeScope.currentScope.static.update(tag, parseInt(input.value) + parseInt(first.name), codeScope.currentScope);
        code.addCode('8D');
        code.addCode(input.tempAddress, 'Store new total value in temp address');
        code.addCode('00', 'Address');

      }else if(item.key === 'ID') {
        var temp = codeScope.currentScope.static.findVar(item.name, codeScope.currentScope);

        //Load existing ID into accumulator
        code.addCode('AD');
        code.addCode(input.tempAddress, `Load ID [${item.name}] value`);
        code.addCode('00', 'Address');

        //Add with carry using temp address
        code.addCode('6D');
        code.addCode(temp.tempAddress, 'Add total value');
        code.addCode('00', 'Address');

        //Store new total value to temporary address
        //input = codeScope.currentScope.static.update(tag, parseInt(input.value) + parseInt(first.name), codeScope.currentScope);
        code.addCode('8D');
        code.addCode(input.tempAddress, 'Store new total value in temp address');
        code.addCode('00', 'Address');

      }

    }

  };


  if(tag) {
    var temp = codeScope.currentScope.static.findVar(tag, codeScope.currentScope);

    //Load existing ID into accumulator
    code.addCode('AD');
    code.addCode(input.tempAddress, `Load ID [${item.name}] value`);
    code.addCode('00', 'Address');

    //Store new total value to variable address
    code.addCode('8D');
    code.addCode(temp.tempAddress, 'Store new total value in var address');
    code.addCode('00', 'Address');
  }

  code.addCode('A2');
  code.addCode('01');

  code.addCode('EC');
  code.addCode('00');
  code.addCode('00');

  return input;
}

function replaceTempAddr() {
  code.addCode('00', 'Empty Space', true);
  code.addCode('00', 'Empty Space', true);

  var heap = code.value().length;
  console.log(heap.toString(16))

  //Replace Jump Table entries
  Object.keys(jump.contents).forEach((entry) => {
    var jmpAddr = (jump.contents[entry].end - jump.contents[entry].start - 2).toString(16);
    jmpAddr = (jump.contents[entry].distance ? jump.contents[entry].distance.toString(16).toUpperCase() : (jmpAddr.length < 2 ? `0${jmpAddr}` : jmpAddr).toUpperCase());
    code.replace(entry, jmpAddr);
    document.querySelector('#output_code').innerHTML = document.querySelector('#output_code').innerHTML.replace(new RegExp(entry, 'g'), jmpAddr);
  });

  //n^2 and horribly inefficent
  codeScope.children.forEach((scope) => {
    scope.static.contents.forEach((item, i) => {

      var newAddr;
      if(typeof item.value == 'object') {
        var sto = heap;
        console.log(sto.toString(16))
        item.value.forEach((char) => {
          code.addCode((char == '00') ? '00' : char.charCodeAt(0).toString(16).toUpperCase(), null, true);
          console.log(heap.toString(16), char.charCodeAt(0).toString(16).toUpperCase());
          //heap++;
        });
        console.log(sto, heap)
      }else {
        code.addCode('00');
      }

      newAddr = (heap++).toString(16);
      newAddr = (newAddr.length < 2 ? `0${newAddr}` : newAddr).toUpperCase();

      code.replace(item.tempAddress, newAddr);
      document.querySelector('#output_code').innerHTML = document.querySelector('#output_code').innerHTML.replace(new RegExp(item.tempAddress, 'g'), newAddr);

      console.log(item, newAddr)

    });
  });




  console.log(code.value().length);
  while(code.value().length < 255) {
    code.addCode('00', 'Empty Space', true);
  }
}
