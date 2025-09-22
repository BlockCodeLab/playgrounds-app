import { ScratchBlocks } from '../../lib/scratch-blocks';

export class JavaScriptGenerator extends ScratchBlocks.Generator {
  /**
   * Order of operation ENUMs.
   * https://developer.mozilla.org/en/JavaScript/Reference/Operators/Operator_Precedence
   */
  ORDER_ATOMIC = 0; // 0 "" ...
  ORDER_NEW = 1.1; // new
  ORDER_MEMBER = 1.2; // . []
  ORDER_FUNCTION_CALL = 2; // ()
  ORDER_INCREMENT = 3; // ++
  ORDER_DECREMENT = 3; // --
  ORDER_BITWISE_NOT = 4.1; // ~
  ORDER_UNARY_PLUS = 4.2; // +
  ORDER_UNARY_NEGATION = 4.3; // -
  ORDER_LOGICAL_NOT = 4.4; // !
  ORDER_TYPEOF = 4.5; // typeof
  ORDER_VOID = 4.6; // void
  ORDER_DELETE = 4.7; // delete
  ORDER_DIVISION = 5.1; // /
  ORDER_MULTIPLICATION = 5.2; // *
  ORDER_MODULUS = 5.3; // %
  ORDER_SUBTRACTION = 6.1; // -
  ORDER_ADDITION = 6.2; // +
  ORDER_BITWISE_SHIFT = 7; // << >> >>>
  ORDER_RELATIONAL = 8; // < <= > >=
  ORDER_IN = 8; // in
  ORDER_INSTANCEOF = 8; // instanceof
  ORDER_EQUALITY = 9; // == != === !==
  ORDER_BITWISE_AND = 10; // &
  ORDER_BITWISE_XOR = 11; // ^
  ORDER_BITWISE_OR = 12; // |
  ORDER_LOGICAL_AND = 13; // &&
  ORDER_LOGICAL_OR = 14; // ||
  ORDER_CONDITIONAL = 15; // ?:
  ORDER_ASSIGNMENT = 16; // = += -= *= /= %= <<= >>= ...
  ORDER_COMMA = 17; // ,
  ORDER_NONE = 99; // (...)

  constructor(name = 'JavaScript') {
    super(name);

    /**
     * List of illegal variable names.
     * This is not intended to be a security feature.  Blockly is 100% client-side,
     * so bypassing this list is trivial.  This is intended to prevent users from
     * accidentally clobbering a built-in object or function.
     * @private
     */
    this.addReservedWords(
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#Keywords
      'break,case,catch,class,const,continue,debugger,default,delete,do,else,export,extends,finally,for,function,if,import,in,instanceof,new,return,super,switch,this,throw,try,typeof,var,void,while,with,yield,' +
        'enum,' +
        'implements,interface,let,package,private,protected,public,static,' +
        'await,' +
        'null,true,false,' +
        // Magic variable.
        'arguments,' +
        // Everything in the current environment (835 items in Chrome, 104 in Node).
        Object.getOwnPropertyNames(window).join(','),
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

      // !(!foo) -> !!foo
      [this.ORDER_LOGICAL_NOT, this.ORDER_LOGICAL_NOT],
      // a * (b * c) -> a * b * c
      [this.ORDER_MULTIPLICATION, this.ORDER_MULTIPLICATION],
      // a + (b + c) -> a + b + c
      [this.ORDER_ADDITION, this.ORDER_ADDITION],
      // a && (b && c) -> a && b && c
      [this.ORDER_LOGICAL_AND, this.ORDER_LOGICAL_AND],
      // a || (b || c) -> a || b || c
      [this.ORDER_LOGICAL_OR, this.ORDER_LOGICAL_OR],
    ];
  }

  /**
   * Initialise the database of variable names.
   * @param {!ScratchBlocks.Workspace} workspace Workspace to generate code from.
   */
  init(workspace) {
    super.init(workspace);

    let defvars = [];
    // Add user variables.
    let variables = workspace.getAllVariables();
    for (let i = 0; i < variables.length; i++) {
      if (variables[i].type === ScratchBlocks.BROADCAST_MESSAGE_VARIABLE_TYPE) {
        continue;
      }
      const varName = this.getVariableName(variables[i].getId());
      if (variables[i].type === ScratchBlocks.LIST_VARIABLE_TYPE) {
        defvars.push(`let ${varName}_ls = [];`);
      } else if (variables[i].type === ScratchBlocks.DICTIONARY_VARIABLE_TYPE) {
        defvars.push(`let ${varName}_dt = {};`);
      } else {
        defvars.push(`let ${varName} = 0;`);
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
    const definitions = [];
    const varDefinitions = [];
    for (let name in this.definitions_) {
      if (name == 'variables') {
        varDefinitions.push(this.definitions_[name]);
      } else {
        definitions.push(this.definitions_[name]);
      }
    }
    // Clean up temporary data.
    delete this.definitions_;
    delete this.functionNames_;
    this.variableDB_.reset();
    return definitions.join('\n') + '\n\n' + varDefinitions.join('\n') + '\n\n' + code;
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
   * Encode a string as a properly escaped JavaScript string, complete with
   * quotes.
   * @param {string} string Text to encode.
   * @return {string} JavaScript string.
   * @private
   */
  quote_(string) {
    // Can't use goog.string.quote since Google's style guide recommends
    // JS string literals use single quotes.
    // string = string.replace(/\\/g, '\\\\').replace(/\n/g, '\\\n').replace(/'/g, "\\'");
    let quote = "'";
    if (string.indexOf("'") !== -1) {
      if (string.indexOf('"') === -1) {
        quote = '"';
      } else {
        string = string.replace(/'/g, "\\'");
      }
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

    const nextBlock = block.nextConnection?.targetBlock();
    const nextCode = this.blockToCode(nextBlock);
    return commentCode + code + nextCode;
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
