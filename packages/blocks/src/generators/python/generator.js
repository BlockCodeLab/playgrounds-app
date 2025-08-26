import { ScratchBlocks } from '../../lib/scratch-blocks';

export class PythonGenerator extends ScratchBlocks.Generator {
  /**
   * Order of operation ENUMs.
   * http://docs.python.org/reference/expressions.html#summary
   */
  ORDER_ATOMIC = 0; // 0 "" ...
  ORDER_COLLECTION = 1; // tuples, lists, dictionaries
  ORDER_STRING_CONVERSION = 1; // `expression...`
  ORDER_MEMBER = 2.1; // . []
  ORDER_FUNCTION_CALL = 2.2; // ()
  ORDER_EXPONENTIATION = 3; // **
  ORDER_UNARY_SIGN = 4; // + -
  ORDER_BITWISE_NOT = 4; // ~
  ORDER_MULTIPLICATIVE = 5; // * / // %
  ORDER_ADDITIVE = 6; // + -
  ORDER_BITWISE_SHIFT = 7; // << >>
  ORDER_BITWISE_AND = 8; // &
  ORDER_BITWISE_XOR = 9; // ^
  ORDER_BITWISE_OR = 10; // |
  ORDER_RELATIONAL = 11; // in, not in, is, is not,
  //     <, <=, >, >=, <>, !=, ==
  ORDER_LOGICAL_NOT = 12; // not
  ORDER_LOGICAL_AND = 13; // and
  ORDER_LOGICAL_OR = 14; // or
  ORDER_CONDITIONAL = 15; // if else
  ORDER_LAMBDA = 16; // lambda
  ORDER_NONE = 99; // (...)

  constructor(name = 'Python') {
    super(name);

    /**
     * List of illegal variable names.
     * This is not intended to be a security feature.  Blockly is 100% client-side,
     * so bypassing this list is trivial.  This is intended to prevent users from
     * accidentally clobbering a built-in object or function.
     */
    this.addReservedWords(
      // import keyword
      // print(','.join(sorted(keyword.kwlist)))
      // https://docs.python.org/3/reference/lexical_analysis.html#keywords
      // https://docs.python.org/2/reference/lexical_analysis.html#keywords
      'False,None,True,and,as,assert,break,class,continue,def,del,elif,else,' +
        'except,exec,finally,for,from,global,if,import,in,is,lambda,nonlocal,not,' +
        'or,pass,print,raise,return,try,while,with,yield,' +
        // https://docs.python.org/3/library/constants.html
        // https://docs.python.org/2/library/constants.html
        'NotImplemented,Ellipsis,__debug__,quit,exit,copyright,license,credits,' +
        // >>> print(','.join(sorted(dir(__builtins__))))
        // https://docs.python.org/3/library/functions.html
        // https://docs.python.org/2/library/functions.html
        'ArithmeticError,AssertionError,AttributeError,BaseException,' +
        'BlockingIOError,BrokenPipeError,BufferError,BytesWarning,' +
        'ChildProcessError,ConnectionAbortedError,ConnectionError,' +
        'ConnectionRefusedError,ConnectionResetError,DeprecationWarning,EOFError,' +
        'Ellipsis,EnvironmentError,Exception,FileExistsError,FileNotFoundError,' +
        'FloatingPointError,FutureWarning,GeneratorExit,IOError,ImportError,' +
        'ImportWarning,IndentationError,IndexError,InterruptedError,' +
        'IsADirectoryError,KeyError,KeyboardInterrupt,LookupError,MemoryError,' +
        'ModuleNotFoundError,NameError,NotADirectoryError,NotImplemented,' +
        'NotImplementedError,OSError,OverflowError,PendingDeprecationWarning,' +
        'PermissionError,ProcessLookupError,RecursionError,ReferenceError,' +
        'ResourceWarning,RuntimeError,RuntimeWarning,StandardError,' +
        'StopAsyncIteration,StopIteration,SyntaxError,SyntaxWarning,SystemError,' +
        'SystemExit,TabError,TimeoutError,TypeError,UnboundLocalError,' +
        'UnicodeDecodeError,UnicodeEncodeError,UnicodeError,' +
        'UnicodeTranslateError,UnicodeWarning,UserWarning,ValueError,Warning,' +
        'ZeroDivisionError,_,__build_class__,__debug__,__doc__,__import__,' +
        '__loader__,__name__,__package__,__spec__,abs,all,any,apply,ascii,' +
        'basestring,bin,bool,buffer,bytearray,bytes,callable,chr,classmethod,cmp,' +
        'coerce,compile,complex,copyright,credits,delattr,dict,dir,divmod,' +
        'enumerate,eval,exec,execfile,exit,file,filter,float,format,frozenset,' +
        'getattr,globals,hasattr,hash,help,hex,id,input,int,intern,isinstance,' +
        'issubclass,iter,len,license,list,locals,long,map,max,memoryview,min,' +
        'next,object,oct,open,ord,pow,print,property,quit,range,raw_input,reduce,' +
        'reload,repr,reversed,round,set,setattr,slice,sorted,staticmethod,str,' +
        'sum,super,tuple,type,unichr,unicode,vars,xrange,zip,math,random,Number',
    );

    /**
     * List of outer-inner pairings that do NOT require parentheses.
     * @type {!Array.<!Array.<number>>}
     */
    this.ORDER_OVERRIDES = [
      // (foo()).bar -> foo().bar
      // (foo())[0] -> foo()[0]
      [this.ORDER_FUNCTION_CALL, this.ORDER_MEMBER],
      // (foo())() -> foo()()
      [this.ORDER_FUNCTION_CALL, this.ORDER_FUNCTION_CALL],
      // (foo.bar).baz -> foo.bar.baz
      // (foo.bar)[0] -> foo.bar[0]
      // (foo[0]).bar -> foo[0].bar
      // (foo[0])[1] -> foo[0][1]
      [this.ORDER_MEMBER, this.ORDER_MEMBER],
      // (foo.bar)() -> foo.bar()
      // (foo[0])() -> foo[0]()
      [this.ORDER_MEMBER, this.ORDER_FUNCTION_CALL],

      // not (not foo) -> not not foo
      [this.ORDER_LOGICAL_NOT, this.ORDER_LOGICAL_NOT],
      // a and (b and c) -> a and b and c
      [this.ORDER_LOGICAL_AND, this.ORDER_LOGICAL_AND],
      // a or (b or c) -> a or b or c
      [this.ORDER_LOGICAL_OR, this.ORDER_LOGICAL_OR],
    ];
  }

  /**
   * Initialise the database of variable names.
   * @param {!ScratchBlocks.Workspace} workspace Workspace to generate code from.
   */
  init(workspace) {
    super.init(workspace);

    /**
     * Empty loops or conditionals are not allowed in Python.
     */
    this.PASS = `${this.INDENT}pass\n`;
    // Create a dictionary of definitions to be printed before the code.
    this.definitions_ = Object.create(null);
    // Create a dictionary mapping desired function names in definitions_
    // to actual function names (to avoid collisions with user functions).
    this.functionNames_ = Object.create(null);
    // 循环变量计数器编号
    this.loopVarCount_ = 0;

    if (!this.variableDB_) {
      this.variableDB_ = new ScratchBlocks.Names(this.RESERVED_WORDS_);
    } else {
      this.variableDB_.reset();
    }
    this.variableDB_.setVariableMap(workspace.getVariableMap());

    const defvars = [];

    // Add user variables.
    const variables = workspace.getAllVariables();
    for (let i = 0; i < variables.length; i++) {
      // 筛除广播消息名的变量
      if (variables[i].type === ScratchBlocks.BROADCAST_MESSAGE_VARIABLE_TYPE) {
        continue;
      }
      let varName = this.getVariableName(variables[i].getId());
      if (variables[i].type === ScratchBlocks.LIST_VARIABLE_TYPE) {
        defvars.push(`${varName}_ls = []`);
      } else if (variables[i].type === ScratchBlocks.DICTIONARY_VARIABLE_TYPE) {
        defvars.push(`${varName}_dt = {}`);
      } else {
        defvars.push(`${varName} = 0`);
      }
    }

    // Declare all of the variables.
    if (defvars.length) {
      this.definitions_['variables'] = defvars.join('\n');
    }
  }

  /**
   * Prepend the generated code with the variable definitions.
   * @param {string} code Generated code.
   * @return {string} Completed code.
   */
  finish(code) {
    // Convert the definitions dictionary into a list.
    const imports = [];
    const definitions = [];
    const variables = [];
    for (let name in this.definitions_) {
      if (name === 'variables') continue;
      const def = this.definitions_[name];
      if (def.match(/^(from\s+\S+\s+)?import\s+\S+/)) {
        imports.push(def);
      } else if (def.startsWith('def ') || def.startsWith('async def ') || def.startsWith('@_tasks__.')) {
        definitions.push(def);
      } else {
        variables.push(def);
      }
    }
    variables.push(this.definitions_['variables']);
    // Clean up temporary data.
    delete this.definitions_;
    delete this.functionNames_;
    this.variableDB_.reset();

    const allDefs = imports.join('\n') + '\n\n' + variables.join('\n') + '\n\n' + definitions.join('\n');
    return allDefs.replace(/\n\n+/g, '\n\n') + '\n' + code;
  }

  /**
   * Naked values are top-level blocks with outputs that aren't plugged into
   * anything.
   * @param {string} line Line of generated code.
   * @return {string} Legal line of code.
   */
  scrubNakedValue(line) {
    return line + '\n';
  }

  /**
   * Encode a string as a properly escaped Python string, complete with quotes.
   * @param {string} string Text to encode.`
   * @return {string} Python string.
   * @private
   */
  quote_(string) {
    // Can't use goog.string.quote since % must also be escaped.
    // string = string.replace(/\\/g, '\\\\').replace(/\n/g, '\\\n').replace(/\%/g, '\\%');

    // Follow the CPython behaviour of repr() for a non-byte string.
    let quote = '"';
    if (string.indexOf('"') !== -1) {
      if (string.indexOf("'") === -1) {
        quote = "'";
      } else {
        string = string.replace(/"/g, '\\"');
      }
    }
    return quote + string + quote;
  }

  /**
   * Common tasks for generating Python from blocks.
   * Handles comments for the specified block and any connected value blocks.
   * Calls any statements following this block.
   * @param {!ScratchBlocks.Block} block The current block.
   * @param {string} code The Python code created for this block.
   * @return {string} Python code with comments and subsequent blocks added.
   * @private
   */
  scrub_(block, code) {
    let commentCode = '';
    // Only collect comments for blocks that aren't inline.
    if (!block.outputConnection?.targetConnection) {
      // Collect comment for this block.
      let comment = block.getCommentText();
      comment = ScratchBlocks.utils.wrap(comment, this.COMMENT_WRAP - 3);
      if (comment) {
        if (block.getProcedureDef) {
          // Use a comment block for function comments.
          commentCode += '"""' + comment + '\n"""\n';
        } else {
          commentCode += this.prefixLines(comment + '\n', '# ');
        }
      }
      // Collect comments for all value arguments.
      // Don't collect comments for nested statements.
      for (let i = 0; i < block.inputList.length; i++) {
        if (block.inputList[i].type == ScratchBlocks.INPUT_VALUE) {
          const childBlock = block.inputList[i].connection.targetBlock();
          if (childBlock) {
            const comment = this.allNestedComments(childBlock);
            if (comment) {
              commentCode += this.prefixLines(comment, '# ');
            }
          }
        }
      }
    }

    const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
    let nextCode = this.blockToCode(nextBlock);

    if (block.startHat_) {
      if (nextCode) {
        nextCode = this.prefixLines(nextCode, this.INDENT);
        code = code.replace(`\n${this.PASS}`, `\n${nextCode}`);
      }
      return commentCode + code;
    }

    if (block.parentBlock_) {
      return commentCode + code + nextCode;
    }

    return '';
  }

  /**
   * Gets a property and adjusts the value, taking into account indexing, and
   * casts to an integer.
   * @param {!ScratchBlocks.Block} block The block.
   * @param {string} atId The property ID of the element to get.
   * @param {number=} opt_delta Value to add.
   * @param {boolean=} opt_negate Whether to negate the value.
   * @return {string|number}
   */
  getAdjustedInt(block, atId, opt_delta, opt_negate) {
    let delta = opt_delta || 0;
    if (block.workspace.options.oneBasedIndex) {
      delta--;
    }
    const defaultAtIndex = block.workspace.options.oneBasedIndex ? '1' : '0';
    const atOrder = delta ? this.ORDER_ADDITIVE : this.ORDER_NONE;
    let at = this.valueToCode(block, atId, atOrder) || defaultAtIndex;

    if (ScratchBlocks.isNumber(at)) {
      // If the index is a naked number, adjust it right now.
      at = parseInt(at, 10) + delta;
      if (opt_negate) {
        at = -at;
      }
    } else {
      // If the index is dynamic, adjust it in code.
      if (delta > 0) {
        at = 'int(' + at + ' + ' + delta + ')';
      } else if (delta < 0) {
        at = 'int(' + at + ' - ' + -delta + ')';
      } else {
        at = 'int(' + at + ')';
      }
      if (opt_negate) {
        at = '-' + at;
      }
    }
    return at;
  }
}
