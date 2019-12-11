
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
    this.contents = [];
  }

  add(tempAddress, distance) {
    this.contents.push({
      tempAddress: tempAddress,
      distance: distance
    });
  }

  getDistance(address) {
    return this.contents.find((a) => {return a.tempAddress === address});
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
    this.tempAddrCount = 0;
  }

  add(varName, type) {
    var hold = {};
    if(type === "STRING") {
      hold = {
        tempAddress: `T${this.tempAddrCount++}`,
        type: type,
        varName: varName,
        offset: [],
        value: []
      };
    }else {
      hold = {
        tempAddress: `T${this.tempAddrCount++}`,
        type: type,
        varName: varName,
        offset: this.offset++,
        value: '01'
      };
    }

    this.contents.push(hold);
    return hold;
  }

  findVar(varName, tmpScope) {
    var search = tmpScope.static.contents.find((a) => {return a.varName == varName});
    if(search) {
      return search;
    }else {
      var tmp = codeScope.contents.find((a) => {return a.level == tmpScope.level-1});
      return this.findVar(varName, tmp);
    }
  }

  update(varName, value, scope) {
    console.log(scope)
    var entry = this.findVar(varName, scope);
    console.log(entry)

    if(entry.type === "STRING") {
      entry.value = [];
      value.split().forEach((char) => {
        entry.value.push(char.charCodeAt(0));
        entry.offset.push(this.offset++);
      });
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
    this.contents = [];
  }

  newScope() {
    var hold = {
      level: this.scopeLevel++,
      static: new StaticTable(),
      //next: null
    };
    this.contents.push(hold);
    //this.currentScope.next = hold;
    this.currentScope = hold;
    return this.currentScope;
  }

  leaveScope() {
    this.currentScope = this.contents.find((a) => {return a.level === this.currentScope.level-1});
    return this.currentScope;
  }

  value() {
    return this.contents;
  }
}


/**
 * @class Code
 *
*/
class Code {
  constructor() {
    this.contents = [];
  }

  addCode(opCode) {
    opCode = ((opCode.toString().length < 2) ? `0${opCode}` : opCode);
    this.contents.push(opCode);
    outputCodeGen(opCode);
    if(this.contents.length < 256) {
      outputCodeLog(`Added OpCode ${opCode}.`);
      if(opCode.match(/^T./g)) {
        outputCodeLog(`-- ${opCode} ~ Temporary Address`);
      }else {
        outputCodeLog(`-- ${(cpu.getInfo(opCode).mnemonic ? cpu.getInfo(opCode).mnemonic : opCode)} ~ ${cpu.getInfo(opCode).desc}`);
      }

    }else {
      outputCodeLog(`Warning: Program exceeds potential call stack size.`);
    }
  }

  value() {
    return this.contents;
  }
}


var cpu = new x6502();
var jump = new JumpTable();
var codeScope = new ScopeTable();
var code = new Code();





function codeGen(ast) {
  var input = list;
  console.log(Object.assign({}, input));
  console.log(codeScope)
  while(input.length > 0) {
    switch(input.shift().name) {
      case 'Block': generateBlock(); break;
      case 'EndBlock': generateEndBlock(); break;
      case 'VarDecl': generateVarDecl(input.shift(), input.shift()); break;
      case 'AssignStmt': generateAssignStmt(input.shift(), input.shift()); break;
      case 'WhileStmt': break;
      case 'BooleanExpr': break;
      case 'PrintStmt': generatePrint(input.shift()); break;
      case 'IfStmt': break;
      default: break;
    }
  }
  console.log(codeScope);
  console.log(code);
}

function generateBlock() {
  console.log('Gen Block');
  //Go to new scope
  codeScope.newScope();
}

function generateEndBlock() {
  console.log('Gen EndBlock');
  //Go back one scope
  codeScope.leaveScope();
}


function generateVarDecl(type, varName) {
  console.log('Gen VarDecl');

  //Enter var into static table to get temp address
  var input = codeScope.currentScope.static.add(varName.name, type.key);

  //Load accumulator with default 00
  code.addCode('A9');
  code.addCode('00');

  //Store accumulator in memory at 00input.tempAddress
  code.addCode('8D');
  code.addCode(input.tempAddress);
  code.addCode('00');
}


function generateAssignStmt(varName, value) {
  console.log('Gen AssignStmt');

  //Update var in static table
  var input = codeScope.currentScope.static.update(varName.name, value.name, codeScope.currentScope);

  //Load accumulator with assign value
  code.addCode('A9');
  if(value.key === "ID") {
    codeScope.findVar(varName.name, codeScope.currentScope)
  }else if(value.key === "DIGIT") {
    code.addCode(value.name);
  }
  console.log(value)

  //Store the accumulator in memory
  code.addCode('8D');
  code.addCode(input.tempAddress);
  code.addCode('00');
}


function generatePrint(value) {
  console.log('Gen Print');

  //if string
  if(value.key === "STRING") {
    //store string in memory
    codeScope.currentScope.static.add('tmp', value.key);
    codeScope.currentScope.static.update('tmp', value.name.replace('/\"/g', ''), codeScope.currentScope);

    //load y register with string memory address
  }else { //must be var
    //load y register with var memory address
  }





  //load 02 in x register
  //sys call ff
}
