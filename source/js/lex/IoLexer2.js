require("../lib.js");
require("Token");

PosString = Proto.clone().newSlots({
	protoType: "PosString",
	s: "",
	position: 0,
}).setSlots({
	
	init: function()
	{
		return this;
	},
	
	at: function(n)
	{
		var ps = PosString:clone();
		ps:setS(this.s());
		ps:setPosition(n);
		return ps;
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
	
	nextChar: function()
	{
		var c = this.currentChar();

		if (c == 0)
		{
			return 0;
		}

		this.incrementCurrentPos();
		return c;
	},

	prevChar: function()
	{
		if(this.currentPos() > 0) 
		{
			this.decrementCurrentPos();
		}
		
		return this.currentChar();
	},

	isAtEnd: function()
	{
		return this._currentPos == this.s().size() - 1;
	},
	
	grabLength: function()
	{
		return this._currentPos - this._lastPos;
	}
}

// ----------------------------------------------------

IoToken = Proto.clone().newSlots({
	protoType: "IoToken",
	posString: null,
	next: null
}).setSlots({
	
	init: function()
	{
		return this;
	},
	
	print: function()
	{
		this.justPrint();

		if (this.next())
		{
			this.next().print();
		}

		console.log("\n");
	},
}

//-----------------------------------------------------------------

IoMessageChainToken = IoToken.clone().newSlots({
	protoType: "IoMessageChainToken",
}).setSlots({
	
	init: function()
	{
		return this;
	},
	
	lex: function()
	{
		do
		{
			while (	this.readTerminator() ||
					this.readSeparator() ||
					this.readComment())
			{
			}
		} while (this.readMessage());
	}
}

IoMessageToken = IoToken.clone().newSlots({
	protoType: "IoMessageToken",
}).setSlots({
	
	init: function()
	{
		return this;
	},
	
	lex: function(s, pos)
	{
		return s[pos];
	},


	// grabbing ---------------------------------------------

	grabLength: function()
	{
		return this._currentPos - this._lastPos;
	},

	// reading ------------------------------------

	readTokenChars_type_: function(chars, tokenType)
	{
		while (chars.size())
		{
			if (this.readTokenChar_type_(chars, tokenType)) 
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

		console.log("IoLexer: fatal error - invalid group char " + groupChar);
		System.exit(1);
	},

	readMessage: function()
	{
		this.pushPos();
		this.readPadding();

		var foundSymbol = this.readSymbol();

		{
			while (this.readSeparator() || this.readComment())
			{
			}

			var groupChar = this.currentChar();

			if (groupChar && ("[{".containsChar(groupChar) || (!foundSymbol && groupChar == '(')))
			{
				var groupName = this.nameForGroupChar_(groupChar);
				this.addToken_type_(groupName, "identifier");
			}

			if (this.readTokenChars_type_("([{", "openparen"))
			{
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

				if (!this.readTokenChars_type_(")]}", "closeparen"))
				{
					if (groupChar == '(')
					{
						this.readMessage_error("unmatched ()s");
					}
					else if (groupChar == '[')
					{
						this.readMessage_error("unmatched []s");
					}
					else if (groupChar == '{')
					{
						this.readMessage_error("unmatched {}s");
					}
					//console.log("Token %p error: %s - %s\n", t, t.error, IoToken_error(t));
					return false;
				}

				this.popPos();
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
		return 
			this.readNumber() ||
			this.readOperator() ||
			this.readIdentifier() ||
			this.readQuote();
	},

	readIdentifier: function()
	{
		this.pushPos();

		while ( this.readLetter() ||
				this.readDigit() ||
				this.readSpecialChar())
		{
		}

		if (this.grabLength())
		{
			this.grabTokenType_("identifier");
			this.popPos();
			return true;
		}

		this.popPosBack();

		return false;
	},

	readOperator: function()
	{
		this.pushPos();
		var c = this.nextChar();

		if (c == 0)
		{
			this.popPosBack();
			return false;
		}
		else
		{
			this.prevChar();
		}

		while (this.readOpChar())
		{
		}

		if (this.grabLength())
		{
			this.grabTokenType_("identifier");
			this.popPos();
			return true;
		}

		this.popPosBack();
		return false;
	},

	// comments ------------------------------------------

	readComment: function()
	{
		return 
			this.readSlashStarComment() ||
			this.readSlashSlashComment() ||
			this.readPoundComment();
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
		return 
			this.readTriQuote() || 
			this.readMonoQuote();
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
		if (!this.isAtEnd())
		{
			var c = this.nextChar();

			if (c >= first && c <= last)
			{
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
		return 
			this.readLetter() ||
			this.readDigit() ||
			this.readSpecialChar() ||
			this.readOpChar();
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
		return 
			this.readCharInRange('A', 'Z') ||
			this.readCharInRange('a', 'z') ||
			this.readNonASCIIChar();
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

		if (this.grabLength())
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

		if (this.grabLength())
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
		return 
			this.readHexNumber() || 
			this.readDecimal();
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

		if (this.grabLength())
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

		if (read && thisgrabLength())
		{
			this.grabTokenType_("hexnumber");
			this.popPos();
			return true;
		}

		this.popPosBack();
		return false;
	},

});

