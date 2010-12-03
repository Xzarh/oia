require("../lib/lib");
require("./Token");


IoLexer = Proto.clone().newSlots({
	protoType: "IoLexer",
	s: "",
	currentPos: 0,
	charLineIndex: null, // Array
	lineHint: 0,
	maxChar: 0,
	posStack: null, // Array
	tokenStack: null, // Array
	tokenStream: null, // Array
	resultIndex: 0,
	errorToken: null, // Token
	errorDescription: ""
}).setSlots({
	
	init: function()
	{
		this._s = "";
		this._posStack      = new Array;
		this._tokenStack    = new Array;
		this._tokenStream   = new Array;
		this._charLineIndex = new Array;
		return this;
	},
	
	charAt: function(pos)
	{
		//writeln("charAt(", pos, ") = ", this.s()[pos]);
		return this.s()[pos];
	},
	
	incrementCurrentPos: function()
	{
		this._currentPos ++;
		return this;
	},
	
	decrementCurrentPos: function()
	{
		this._currentPos --;
		return this;
	},
	
	currentChar: function()
	{
		return this.charAt(this.currentPos());
	},
	
	currentToken: function()
	{
		return this.tokenStream().top();
	},
	
	currentString: function(len)
	{
		return this.s().slice(this.currentPos(), len);
	},

	errorDescription: function()
	{
		var et = this.errorToken();

		if (et)
		{
			this._errorDescription = et.error() + " on line " + et.lineNumber() + " character " + et.charNumber();
		}

		return this._errorDescription;
	},


	buildLineIndex: function()
	{
		var s = this.s();

		this.charLineIndex().removeAll();

		var i = 0;
		this.charLineIndex().append(i);
		
		for (i = 0; i < s.size(); i++)
		{
			if (s[i] == '\n')
			{
				this.charLineIndex().append(i);
			}
		}

		this.charLineIndex().append(i);
		this.setLineHint(0);
	},

	// next/prev character ------------------------

	nextChar: function()
	{
		if (this.isAtEnd())
		{
			/*
			if(this.currentPos() == this.s().size() -1)
			{
				this.incrementCurrentPos();
			}
			*/
			return null;
		}

		var c = this.currentChar();
		this.incrementCurrentPos();
		return c;
	},

	prevChar: function()
	{
		//writeln("[prevChar]")
		if(this.currentPos() > 0) 
		{
			this.decrementCurrentPos();
		}
		
		return this.currentChar();
	},

	isAtEnd: function()
	{
		return this.currentPos() == this.s().size() - 1;
	},

	// ------------------------------------------

	currentLineNumber: function()
	{
		// this should be even faster than a binary search
		// since almost all results are very close to the last

		var index = this.charLineIndex();
		var line = this.lineHint();
		var numLines = index.size();

		if (this.currentPos() < index.at(line))
		{
			// walk down lines until char is bigger than one
			while (line > 0 && !(this.currentPos() > index.at(line)))
			{
				line --;
			}
			line ++;
		}
		else
		{
			// walk up lines until char is less than or equal to one
			while (line < numLines && !(this.currentPos() <= index.at(line)))
			{
				line ++;
			}
		}

		this.setLineHint(line);

		return line;
	},

	// lexing -------------------------------------

	// --- token and character position stacks ---

	lastPos: function()
	{
		return this.posStack().top();
	},

	pushPos: function()
	{
		var index = this.currentPos();

		if (index > this.maxChar())
		{
			this.setMaxChar(index);
		}

		this.tokenStack().push(this.tokenStream().size() - 1);
		this.posStack().push(this.currentPos());

		//writeln("push: ");
		//this.print();
	},

	popPos: function()
	{
		this.tokenStack().pop();
		this.posStack().pop();
		//writeln("pop:	");
		//this.print();
	},

	popPosBack: function()
	{
		var i = this.tokenStack().pop();
		var topIndex = this.tokenStack().pop();

		if (i > -1)
		{
			this.tokenStream().setSize(i + 1);

			if (i != topIndex)
			{
				var parent = this.currentToken();

				if (parent)
				{
					parent.setNextToken(null);
				}
			}
		}

		this.setCurrentPos(this.posStack().pop());
		//writeln("back: "); this.print();
	},

	// getting results --------------------------------

	top: function()
	{
		return this.tokenStream().at(this.resultIndex());
	},

	topType: function()
	{
		if (!this.top())
		{
			return null;
		}

		return this.top().tokenType();
	},

	pop: function()
	{
		var t = this.top();
		this._resultIndex ++;
		return t;
	},

	// stack management --------------------------------

	print: function()
	{
		this.tokenStream().forEach(function (t) { t.print(); });
		/*
		var first = this.tokenStream().first();

		if (first)
		{
			first.print();
		}
		*/
		writeln("\n");
	},

	printTokens: function()
	{
		this.tokenStream().forEachPerform("printName");
		writeln("\n");
	},

	// grabbing ---------------------------------------------

	grabLength: function()
	{
		//writeln("this.currentPos() = ", this.currentPos());
		//writeln("this.lastPos()    = ", this.lastPos());
		return this.currentPos() - this.lastPos();
	},

	grabTokenType_: function(tokenType)
	{
		var len = this.grabLength();

		if (len == 0)
		{
			writeln("IoLexer fatal error: empty token\n");
			System.exit(1);
		}

		var s1 = this.s().slice(this.currentPos() - len, this.currentPos());
		//writeln("token grab: '", s1, "'");
		this.addToken_type_(s1, tokenType);
	},

	addToken_type_: function(name, tokenType)
	{
		var top = this.currentToken();
		var newToken = Token.clone();

		newToken.setName(name);
		newToken.setTokenType(tokenType);
		newToken.setLineNumber(this.currentLineNumber());
		newToken.setCharNumber(this.currentPos());

		writeln("  '", name, "' ", tokenType);
		if (top)
		{
			top.nextToken(newToken);
		}

		this.tokenStream().push(newToken);
		//writeln("token '%s' %s\n", t.name, Token_typeName(t));
		return newToken;
	},

	// ------------------------------------------

	lex: function()
	{
		this.pushPos();

		this.messageChain();

		if (this.isAtEnd() == false)
		{
			writeln("NOT AT END ");
			writeln("  this.currentChar() '", this.currentChar(), "'");
			writeln("  this.currentPos() = ", this.currentPos());
			writeln("  this.s().size() - 1 = ", this.s().size() - 1);
				
			if (this.errorToken() == null)
			{
				if (this.tokenStream().size() > 0)
				{
					this.setErrorToken(this.currentToken());
				}
				else
				{
					this.setErrorToken(this.addToken_type_(this.s().slice(this.currentPos(), 30), "error"));
				}

				this.errorToken().setError("Syntax error near this location");
			}
			
			return -1;
		}
		
		return true;
	},

	// reading ------------------------------------

	messageChain: function()
	{
		do
		{
			while (	this.readTerminator() || this.readSeparator() || this.readComment())
			{
			}
		} while (this.readMessage());
	},

	// message -------------------------------

	readMessage_error: function(name)
	{
		writeln("ERROR: '", name, "'")
		this.popPosBack();
		this.setErrorToken(this.currentToken());
		this.errorToken().setError(name);
	},

	readTokenChars_type_: function(chars, tokenType)
	{
		while (chars.size())
		{
			if (this.readTokenChar_type_(chars[0], tokenType)) 
			{
				return true;
			}
			
			chars = chars.withFirstCharRemoved();
		}

		return false;
	},

	nameForGroupChar_: function(groupChar)
	{
		if (groupChar == '(') return "";
		if (groupChar == '[') return "squareBrackets";
		if (groupChar == '{') return "curlyBrackets";

		writeln("IoLexer: fatal error - invalid group char " + groupChar);
		System.exit(1);
	},

	printPos: function()
	{
		writeln("  currentPos: " + this.currentPos());
		writeln("  currentString: '" + this.s().slice(this.currentPos()), "'");
	},
	
	readMessage: function()
	{
		//writeln("[readMessage]");
		this.pushPos();
		this.readPadding();

		//this.printPos();
		var foundSymbol = this.readSymbol();

		if(!foundSymbol) { return false; }
		
		//writeln("foundSymbol");
		//this.printPos();
		
		{
			while (this.readSeparator() || this.readComment())
			{
			}

			var groupChar = this.currentChar();

			//writeln("groupChar? ", groupChar);
			if (groupChar && ("[{".containsChar(groupChar) || (!foundSymbol && groupChar == '(')))
			{
				writeln("found groupChar ", groupChar);
				var groupName = this.nameForGroupChar_(groupChar);
				this.addToken_type_(groupName, "identifier");
			}

			if (this.readTokenChars_type_("([{", "opengroup"))
			{
				//writeln("found openparen ");
				this.readPadding();
				do 
				{
					var tokenType = this.currentToken().tokenType();

					this.readPadding();
					// Empty argument: (... ,)
					if ("comma" == tokenType)
					{
						var c = this.currentChar();

						if (',' == c || ")]}".containsChar(c))
						{
							this.readMessage_error("missing argument in argument list");
							return false;
						}
					}

					this.messageChain();
					this.readPadding();

				} while (this.readTokenChar_type_(',', "comma"));

				writeln("end message char ", this.currentChar(), "\n");

				if (!this.readTokenChars_type_(")]}", "closegroup"))
				{
					this.readMessage_error("unmatched " + groupChar);
					return false;
				}

				this.popPos();
				//writeln("---\n");
				return true;
			}

			if (foundSymbol)
			{
				this.popPos();
				return true;
			}
		}
		this.popPosBack();
		return false;
	},

	readPadding: function()
	{
		var didRead = false;

		while (this.readWhitespace() || this.readComment())
		{
			didRead = true;
		}

		return didRead;
	},

	// symbols ------------------------------------------

	readSymbol: function()
	{
		var r =  this.readNumber();
		//writeln("[readNumber]1 ", r);
		if (!r) r = this.readOperator();
		//writeln("[readOperator]1 ", r);
		if (!r) r = this.readIdentifier();
		//writeln("[readIdentifier]1 ", r);
		if (!r) r = this.readQuote();
		//writeln("[readQuote]1 ", r);
		//writeln("[readSymbol] ", r);
		return r;
	},

	readIdentifier: function()
	{
		this.pushPos();
		
		while ( this.readLetter() || this.readDigit() || this.readSpecialChar())
		{
		}

		//this.printPos()

		//writeln("this.grabLength() = ", this.grabLength());
		
		if (this.grabLength() > 0)
		{
			this.grabTokenType_("identifier");
			this.popPos();
			//writeln("[readIdentifier] true");
			return true;
		}

		this.popPosBack();

	    //writeln("[readIdentifier] false");
		return false;
	},

	readOperator: function()
	{
		if (this.isAtEnd()) return false;
		
		this.pushPos();
		while (this.readOpChar())
		{
		}

		if (this.grabLength() > 0)
		{
			this.grabTokenType_("identifier");
			this.popPos();
			//writeln("[readOperator] true");
			return true;
		}

		this.popPosBack();
		return false;
	},

	// comments ------------------------------------------

	readComment: function()
	{
		return this.readSlashStarComment() || this.readSlashSlashComment() || this.readPoundComment();
	},

	readSlashStarComment: function()
	{
		this.pushPos();

		if (this.readString("/*"))
		{
			var nesting = 1;

			while (nesting > 0)
			{
				if (this.readString("/*"))
				{
					this.nextChar();
					nesting ++;
				}
				else if (this.readString("*/"))
				{
					// otherwise we end up trimming the last char
					if (nesting > 1) 
					{
						this.nextChar();
					}
					nesting --;
				}
				else
				{
					var c = this.nextChar();
					
					if(c == 0)
					{
						this.errorToken = this.currentToken();

						if (!this.errorToken)
						{
							this.grabTokenType_("no");
							this.setErrorToken(this.currentToken());
						}

						if (this.errorToken())
						{
							this.errorToken().setError("unterminated comment");
						}

						this.popPosBack();
						return false;
					}
				}
			}
			this.popPos();
			return true;
		}

		this.popPosBack();
		return false;
	},

	readSlashSlashComment: function()
	{
		this.pushPos();

		if (this.nextChar() == '/')
		{
			if (this.nextChar() == '/')
			{
				while (this.readNonReturn()) 
				{ 
				}
				
				this.popPos();
				return true;
			}
		}

		this.popPosBack();
		return false;
	},

	readPoundComment: function()
	{
		this.pushPos();

		if (this.nextChar() == '#')
		{
			while (this.readNonReturn())
			{
			}
			
			this.popPos();
			return true;
		}

		this.popPosBack();
		return false;
	},

	// quotes -----------------------------------------

	readQuote: function()
	{
		var r = this.readTriQuote() || this.readMonoQuote();
		//if (r) writeln("[readQuote] true");
		return r;
	},

	readMonoQuote: function()
	{
		this.pushPos();

		if (this.nextChar() == '"')
		{
			while(true)
			{
				var c = this.nextChar();

				if (c == '"')
				{
					break;
				}

				if (c == '\\')
				{
					this.nextChar();
					continue;
				}

				if (c == 0)
				{
					this.setErrorToken(this.currentToken());

					if (this.errorToken())
					{
						this.errorToken().setError("unterminated quote");
					}

					this.popPosBack();
					return false;
				}
			}

			this.grabTokenType_("monoquote");
			this.popPos();
			return true;
		}

		this.popPosBack();
		return false;
	},

	readTriQuote: function()
	{
		this.pushPos();

		if (this.readString("\"\"\""))
		{
			while (!this.readString("\"\"\""))
			{
				var c = this.nextChar();

				if (c == 0)
				{
					this.popPosBack();
					return false;
				}
			}

			this.grabTokenType_("triquote");
			this.popPos();
			return true;
		}

		this.popPosBack();
		return false;
	},

	// helpers ----------------------------

	readTokenChar_type_: function(c, tokenType)
	{
		this.pushPos();
		if (this.readChar(c))
		{
			this.grabTokenType_(tokenType);
			this.popPos();
			return true;
		}

		this.popPosBack();
		return false;
	},


	readString: function(aString)
	{
		if (this.isAtEnd())
		{
			return false;
		}

		if (this.currentString().beginsWith(aString))
		{
			this._currentPos += aString.size();
			return true;
		}

		return false;
	},

	readCharIn: function(s)
	{
		if (!this.isAtEnd())
		{
			var c = this.nextChar();

			if (s.containsChar(c))
			{
				return true;
			}

			this.prevChar();
		}
		
		return false;
	},

	readCharInRange: function(first, last)
	{
		//writeln("[readCharInRange(", first, ", ", last, ")]");
		//writeln("this.isAtEnd(): " + this.isAtEnd());
		
		if (this.isAtEnd() == false)
		{
			var c = this.nextChar();
				/*
				writeln("c == " + c);
				writeln("c >= first : ", c >= first);
				writeln("c <= last  : ", c <= last);
				*/
				
			if (c >= first && c <= last)
			{
				//writeln("[readCharInRange(", first, ", ", last, ")] = ", c);
				return true;
			}

			this.prevChar();
		}
		
		return false;
	},

	readChar: function(c)
	{
		if (!this.isAtEnd())
		{
			var nc = this.nextChar();
			//writeln("nc: ", nc, " c: ", c);
			if (nc && nc == c)
			{
				return true;
			}

			this.prevChar();
		}
		
		return false;
	},

	readCharAnyCase: function(c)
	{
		if (!this.isAtEnd())
		{
			var nc = this.nextChar();

			if (nc && nc.toLowerCase() == c.toLowerCase())
			{
				return true;
			}

			this.prevChar();
		}
		
		return false;
	},

	readNonASCIIChar: function()
	{
		if (!this.isAtEnd())
		{
			var nc = this.nextChar();

			if (nc >= 0x80)
			{
				return true;
			}

			this.prevChar();
		}
		
		return false;
	},

	readNonReturn: function()
	{
		if (this.isAtEnd()) 
		{
			return false;
		}
		
		if (this.nextChar() != '\n') 
		{
			return true;
		}
		
		this.prevChar();
		return false;
	},

	readNonQuote: function()
	{
		if (this.isAtEnd()) 
		{
			return false;
		}
		
		if (this.nextChar() != '"') 
		{
			return true;
		}
		
		this.prevChar();
		return false;
	},

	// character definitions ----------------------------

	readCharacters: function()
	{
		var didRead = false;

		while (this.readCharacter())
		{
			didRead = true;
		}

		return didRead;
	},

	readCharacter: function()
	{
		var r = this.readLetter();
		if(r == false) r = this.readDigit()
		if (r == false) r = this.readSpecialChar()
		if (r == false) r = this.readOpChar();
		//if(r) writeln("[readCharacter] ", r);
		return r;
	},

	readOpChar: function()
	{
		return this.readCharIn(":'~!@$%^&*-+=|\\<>?/");
	},

	readSpecialChar: function()
	{
		var specialChars = "._";
		return this.readCharIn(specialChars);
	},

	readDigit: function()
	{
		return this.readCharInRange('0', '9');
	},

	readLetter: function()
	{
		//this.printPos();
		var r =  this.readCharInRange('A', 'Z');
		if (r != true) r = this.readCharInRange('a', 'z'); 
		if (r != true) r = this.readNonASCIIChar('a', 'z');
		//if(r) writeln("[readLetter] ", r);
		//this.printPos();
		return r;
	},

	// terminator -------------------------------

	readTerminator: function()
	{
		var terminated = false;
		
		this.pushPos();
		this.readSeparator();

		while (this.readTerminatorChar())
		{
			terminated = true;
			this.readSeparator();
		}

		if (terminated)
		{
			var top = this.currentToken();

			// avoid double terminators
			if (top && top.tokenType() == "terminator")
			{
				return true;
			}

			this.addToken_type_(";", "terminator");
			this.popPos();
			return true;
		}

		this.popPosBack();
		return false;
	},

	readTerminatorChar: function()
	{
		return this.readCharIn(";\n");
	},

	// separator --------------------------------

	readSeparator: function()
	{
		this.pushPos();

		while (this.readSeparatorChar())
		{
		}

		if (this.grabLength() > 0)
		{
			this.popPos();
			return true;
		}

		this.popPosBack();
		return false;
	},

	readSeparatorChar: function()
	{
		if (this.readCharIn(" \f\r\t\v"))
		{
			return true;
		}
		else
		{
			this.pushPos();
			if (this.readCharIn("\\"))
			{
				while (this.readCharIn(" \f\r\t\v"))
				{
				}

				if (this.readCharIn("\n"))
				{
					this.popPos();
					return true;
				}
			}
			
			this.popPosBack();
			return false;
		}
	},

	// whitespace -----------------------------------

	readWhitespace: function()
	{
		this.pushPos();

		while (this.readWhitespaceChar())
		{
		}

		if (this.grabLength() > 0)
		{
			//this.grabTokenType_("whitespace");
			this.popPos();
			return true;
		}

		this.popPosBack();
		return false;
	},

	readWhitespaceChar: function()
	{
		return this.readCharIn(" \f\r\t\v\n");
	},

	readDigits: function()
	{
		var didRead = false;

		this.pushPos();

		while (this.readDigit())
		{
			didRead = true;
		}

		if (!didRead)
		{
			this.popPosBack();
			return false;
		}

		this.popPos();
		return didRead;
	},

	readNumber: function()
	{
		var r = this.readHexNumber();
		if (!r) r = this.readDecimal();
		//if(r) 
		//writeln("[readNumber] ", r);
		return r;
	},

	readExponent: function()
	{
		if (this.readCharAnyCase('e'))
		{
			if (!this.readChar('-'))
			{
				this.readChar('+');
			}

			if (!this.readDigits())
			{
				return -1;
			}

			return true;
		}
		
		return false;
	},

	readDecimalPlaces: function()
	{
		if (this.readChar('.'))
		{
			if (!this.readDigits())
			{
				return -1;
			}

			return true;
		}
		
		return false;
	},

	readDecimal: function()
	{
		this.pushPos();

		if (this.readDigits())
		{
			if (this.readDecimalPlaces() == -1)
			{
				this.popPosBack();
				return false;
			}
		}
		else
		{
			if (this.readDecimalPlaces() != true)
			{
				this.popPosBack();
				return false;
			}
		}

		if (this.readExponent() == -1)
		{
			this.popPosBack();
			return false;
		}

		if (this.grabLength() > 0)
		{
			this.grabTokenType_("number");
			this.popPos();
			return true;
		}
	
		this.popPosBack();
		return false;
	},

	readHexNumber: function()
	{
		var read = false;

		this.pushPos();

		if (this.readChar('0') && this.readCharAnyCase('x'))
		{
			while (this.readDigits() || this.readCharacters())
			{
				read = true;
			}
		}

		if (read && thisgrabLength() > 0)
		{
			this.grabTokenType_("hexnumber");
			this.popPos();
			return true;
		}

		this.popPosBack();
		return false;
	},

});

var lexer = IoLexer.init().setS("a b(c, d); e f(g h)");
var r = lexer.lex();
writeln("-----------------------------")
if(r == -1)
{
	lexer.print()
	writeln("error: ", lexer.errorDescription());
}
else
{
	lexer.print()
}
