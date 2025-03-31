import { ScratchBlocks } from '../../lib/scratch-blocks';

export class ClangGenerator extends ScratchBlocks.Generator {
  /**
   * Order of operation ENUMs.
   * http://en.cppreference.com/w/cpp/language/operator_precedence
   */
  ORDER_ATOMIC = 0; // 0 "" ...
  ORDER_MEMBER = 2; // . []
  ORDER_FUNCTION_CALL = 2; // ()
  ORDER_INCREMENT = 3; // ++
  ORDER_DECREMENT = 3; // --
  ORDER_LOGICAL_NOT = 3; // !
  ORDER_BITWISE_NOT = 3; // ~
  ORDER_UNARY_PLUS = 3; // +
  ORDER_UNARY_NEGATION = 3; // -
  ORDER_MULTIPLICATION = 5; // *
  ORDER_DIVISION = 5; // /
  ORDER_MODULUS = 5; // %
  ORDER_ADDITION = 6; // +
  ORDER_SUBTRACTION = 6; // -
  ORDER_BITWISE_SHIFT = 7; // << >>
  ORDER_RELATIONAL = 8; // < <= > >=
  ORDER_EQUALITY = 9; // == !=
  ORDER_BITWISE_AND = 10; // &
  ORDER_BITWISE_XOR = 11; // ^
  ORDER_BITWISE_OR = 12; // |
  ORDER_LOGICAL_AND = 13; // &&
  ORDER_LOGICAL_OR = 14; // ||
  ORDER_CONDITIONAL = 15; // ?:
  ORDER_ASSIGNMENT = 15; // = += -= *= /= %= <<= >>= ...
  ORDER_COMMA = 17; // ,
  ORDER_NONE = 99; // (...)

  constructor(name = 'CLang') {
    super(name);

    /**
     * List of illegal variable names.
     * This is not intended to be a security feature.  ScratchBlocks is 100% client-side,
     * so bypassing this list is trivial.  This is intended to prevent users from
     * accidentally clobbering a built-in object or function.
     * @private
     */
    this.addReservedWords(
      'alignas,alignof,and,and_eq,asm,auto,bitand,bitor,bool,break,case,catch,char,char16_t,char32_t,class,compl,' +
        'const,constexpr,const_cast,continue,decltype,default,delete,do,double,dynamic_cast,else,enum,explicit,export,' +
        'extern,false,float,for,friend,goto,if,inline,int,long,long double,long long,mutable,namespace,new,noexcept,not,' +
        'not_eq,nullptr,operator,or,or_eq,private,protected,public,register,reinterpret_cast,return,short,signed,sizeof,' +
        'static,static_assert,static_cast,struct,switch,template,this,thread_local,throw,true,try,typedef,typeid,typename,' +
        'union,unsigned,using,virtual,void,volatile,wchar_t,while,xor,xor_eq,posix,' +
        // http://en.cppreference.com/w/cpp/keyword
        'game,api,PI,PI2,PI3,PI4,DEG2RAD,RAD2DEG,ZRMS,ZR2D,ZR3D,ALLIANCE', //TODO: add ZR #defines to list
    );
  }

  /**
   * Initialise the database of variable names.
   * @param {!ScratchBlocks.Workspace} workspace Workspace to generate code from.
   */
  init(workspace) {
    super.init(workspace);

    // Create a dictionary of definitions to be printed before the code.
    this.definitions_ = Object.create(null);
    // Create a dictionary mapping desired function names in definitions_
    // to actual function names (to avoid collisions with user functions).
    this.functionNames_ = Object.create(null);

    if (!this.variableDB_) {
      this.variableDB_ = new ScratchBlocks.Names(this.RESERVED_WORDS_);
    } else {
      this.variableDB_.reset();
    }
    this.variableDB_.setVariableMap(workspace.getVariableMap());
  }

  /**
   * Prepend the generated code with the variable definitions.
   * @param {string} code Generated code.
   * @return {string} Completed code.
   */
  finish(code) {
    // Convert the definitions dictionary into a list.
    const includes = [];
    const declarations = [];
    const defines = [];
    const func_definitions = [];
    const defvars = [];
    for (let name in this.definitions_) {
      const def = this.definitions_[name];
      if (name.match('include')) {
        includes.push(def);
      } else if (name.match('Func_declare')) {
        declarations.push(def); // declaration
      } else if (name.match('define')) {
        defines.push(def); // #define
      } else if (name.match('variable')) {
        defvars.push(def); // variable
      } else {
        func_definitions.push(def); // definition
      }
    }
    //imports--> #include
    //definitions--> function def, #def
    const allDefs =
      includes.join('\n') +
      '\n\n' +
      declarations.join('\n') +
      '\n\n' +
      defines.join('\n') +
      '\n\n' +
      defvars.join('\n');
    const allFuncs = func_definitions.join('\n');

    delete this.definitions_;
    delete this.functionNames_;
    this.variableDB_.reset();

    return allDefs.replace(/\n\n+/g, '\n\n') + code + '\n' + allFuncs.replace(/\n\n+/g, '\n\n');
  }

  /**
   * Naked values are top-level blocks with outputs that aren't plugged into
   * anything.  A trailing semicolon is needed to make this legal.
   * @param {string} line Line of generated code.
   * @return {string} Legal line of code.
   */
  scrubNakedValue(line) {
    return line + ';\n';
  }

  /**
   * Encode a string as a properly escaped C string, complete with
   * quotes.
   * @param {string} string Text to encode.
   * @return {string} C string.
   * @private
   */
  quote_(string) {
    // Can't use goog.string.quote since Google's style guide recommends
    // string = string.replace(/\\/g, '\\\\').replace(/\n/g, '\\\n').replace(/'/g, "\\'");
    let quote = '"';
    if (string.indexOf('"') !== -1) {
      string = string.replace(/"/g, '\\"');
    }
    return quote + string + quote;
  }

  /**
   * Common tasks for generating JavaScript from blocks.
   * Handles comments for the specified block and any connected value blocks.
   * Calls any statements following this block.
   * @param {!ScratchBlocks.Block} block The current block.
   * @param {string} code The JavaScript code created for this block.
   * @return {string} JavaScript code with comments and subsequent blocks added.
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
          commentCode += '/**\n' + this.prefixLines(comment + '\n', ' * ') + ' */\n';
        } else {
          commentCode += this.prefixLines(comment + '\n', '// ');
        }
      }
      // Collect comments for all value arguments.
      // Don't collect comments for nested statements.
      for (let i = 0; i < block.inputList.length; i++) {
        if (block.inputList[i].type == ScratchBlocks.INPUT_VALUE) {
          let childBlock = block.inputList[i].connection.targetBlock();
          if (childBlock) {
            let comment = this.allNestedComments(childBlock);
            if (comment) {
              commentCode += this.prefixLines(comment, '// ');
            }
          }
        }
      }
    }

    // 帽子积木自处理后续积木代码
    if (block.startHat_) {
      return commentCode + code;
    }

    const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
    const nextCode = this.blockToCode(nextBlock);
    return commentCode + code + nextCode;
  }

  // 检查孤立积木
  check_(block) {
    return block?.startHat_ || block?.parentBlock_;
  }

  /**
   * Gets a property and adjusts the value while taking into account indexing.
   * @param {!ScratchBlocks.Block} block The block.
   * @param {string} atId The property ID of the element to get.
   * @param {number=} opt_delta Value to add.
   * @param {boolean=} opt_negate Whether to negate the value.
   * @param {number=} opt_order The highest order acting on this value.
   * @return {string|number}
   */
  getAdjusted(block, atId, opt_delta, opt_negate, opt_order) {
    let delta = opt_delta || 0;
    let order = opt_order || this.ORDER_NONE;
    if (block.workspace.options.oneBasedIndex) {
      delta--;
    }
    let defaultAtIndex = block.workspace.options.oneBasedIndex ? '1' : '0';
    let at;
    if (delta > 0) {
      at = this.valueToCode(block, atId, this.ORDER_ADDITION) || defaultAtIndex;
    } else if (delta < 0) {
      at = this.valueToCode(block, atId, this.ORDER_SUBTRACTION) || defaultAtIndex;
    } else if (opt_negate) {
      at = this.valueToCode(block, atId, this.ORDER_UNARY_NEGATION) || defaultAtIndex;
    } else {
      at = this.valueToCode(block, atId, order) || defaultAtIndex;
    }

    if (ScratchBlocks.isNumber(at)) {
      // If the index is a naked number, adjust it right now.
      at = parseFloat(at) + delta;
      if (opt_negate) {
        at = -at;
      }
    } else {
      // If the index is dynamic, adjust it in code.
      let innerOrder;
      if (delta > 0) {
        at = at + ' + ' + delta;
        innerOrder = this.ORDER_ADDITION;
      } else if (delta < 0) {
        at = at + ' - ' + -delta;
        innerOrder = this.ORDER_SUBTRACTION;
      }
      if (opt_negate) {
        if (delta) {
          at = '-(' + at + ')';
        } else {
          at = '-' + at;
        }
        innerOrder = this.ORDER_UNARY_NEGATION;
      }
      innerOrder = Math.floor(innerOrder);
      order = Math.floor(order);
      if (innerOrder && order >= innerOrder) {
        at = '(' + at + ')';
      }
    }
    return at;
  }
}
