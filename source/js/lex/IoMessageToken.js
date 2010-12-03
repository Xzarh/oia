require("IoToken");

/*

nameForGroupChar_: function(groupChar)
{
	if (groupChar == '(') return "";
	if (groupChar == '[') return "squareBrackets";
	if (groupChar == '{') return "curlyBrackets";

	console.log("IoLexer: fatal error - invalid group char " + groupChar);
	System.exit(1);
},
*/

IoMessageToken = IoToken.clone().newSlots({
	protoType: "IoMessageToken",
}).setSlots({
	
	lex: function(ps)
	{
		var lps = PaddingToken.lex(ps);
		
		lps = SymbolToken.lex(lps);
		var foundSymbol = lps.didLex();
		
		while (true)
		{
			lps = SeperatorToken.lex(lps);
			if(lps.didLex() == false) break;
			lps = CommentToken.lex(lps).didLex();
			if(lps.didLex() == false) break;
		}

		var groupChar = ps.currentChar();

		lps = OpenToken.lex(lps);

		if (lps.didLex())
		{
			while(true) 
			{
				lps = PaddingToken.lex(lps);
				lps = IoMessageChainToken.lex(lps);
				lps = PaddingToken.lex(ps);
				lps = CloseToken.lex(ps);
				if (lps.didLex()) break;
			}
			return lps;
		}

		if (foundSymbol)
		{
			return lps;
		}

		ps.setDidLex(false);`
		return ps;
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


});

IoCharAnyCaseToken = IoToken.clone().newSlots({
	protoType: "IoCharAnyCaseToken",
}).setSlots({
	
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


});

IoNonASCIICharToken = IoToken.clone().newSlots({
	protoType: "IoNonASCIICharToken",
}).setSlots({
		
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

});

IoNonReturnToken = IoToken.clone().newSlots({
	protoType: "IoNonReturnToken",
}).setSlots({
	
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

});

IoNonQuoteToken = IoToken.clone().newSlots({
	protoType: "IoNonQuoteToken",
}).setSlots({
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
});

IoCharactersToken = IoToken.clone().newSlots({
	protoType: "IoCharactersToken",
}).setSlots({
	
	readCharacters: function()
	{
		var didRead = false;

		while (this.readCharacter())
		{
			didRead = true;
		}

		return didRead;
	},

});

IoCharacterToken = IoToken.clone().newSlots({
	protoType: "IoCharacterToken",
}).setSlots({
	
	readCharacter: function()
	{
		return 
			this.readLetter() ||
			this.readDigit() ||
			this.readSpecialChar() ||
			this.readOpChar();
	},

});

IoOpCharToken = IoToken.clone().newSlots({
	protoType: "IoOpCharToken",
}).setSlots({
	
	readOpChar: function()
	{
		return this.readCharIn(":'~!@$%^&*-+=|\\<>?/");
	},
	

});

IoSpecialCharToken = IoToken.clone().newSlots({
	protoType: "IoSpecialCharToken",
}).setSlots({


	readSpecialChar: function()
	{
		var specialChars = "._";
		return this.readCharIn(specialChars);
	},

});

IoDigitToken = IoToken.clone().newSlots({
	protoType: "IoDigitToken",
}).setSlots({
	
	readDigit: function()
	{
		return this.readCharInRange('0', '9');
	},

});

IoLetterToken = IoToken.clone().newSlots({
	protoType: "IoLetterToken",
}).setSlots({
		
	readLetter: function()
	{
		return 
			this.readCharInRange('A', 'Z') ||
			this.readCharInRange('a', 'z') ||
			this.readNonASCIIChar();
	}

});

