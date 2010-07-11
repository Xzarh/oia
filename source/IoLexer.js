IoLexer = Proto.clone().newSlots({
	protoType: "IoLexer",
	s: "",
	current: "",
	var charLineIndex: null, // List
	size_t lineHint: 0,
	size_t maxChar: 0,
	Stack *posStack: null, // Stack
	Stack *tokenStack: nul, // Stack
	var tokenStream: null, // List
	resultIndex: 0,
	var errorToken: null, // Token
	errorDescription: ""
}).setSlots({
	

	currentToken: function()
	{
		return this.tokenStream.top();
	},

	new: function()
	{
		this.s = "";
		this.posStack = Stack:clone();
		this.tokenStack = Stack:clone();
		this.tokenStream = List:clone();
		this.charLineIndex = List:clone();
		return this;
	},

	errorDescription: function()
	{
		var et = this.errorToken();

		if (!this.errorDescription)
		{
			this.errorDescription = io_calloc(1, 1024);
			this.errorDescription[0] = 0;
		}

		if (et)
		{
			sprintf(this.errorDescription,
				"\"%s\" on line %i character %i",
				et->error,
				et.lineNumber(),
				et.charNumber());
		}

		return this.errorDescription;
	},


	buildLineIndex: function()
	{
		var s = this.s;

		this.charLineIndex.removeAll();

		this.charLineIndex.append(s);

		while (*s)
		{
			if (*s == '\n')
			{
				this.charLineIndex.append(s);
			}
			s ++;
		}

		this.charLineIndex.append(s);
		this.lineHvar = 0;
	},

	// next/prev character ------------------------

	nextChar: function()
	{
		var c = this.current[0];
		var seqlen, i;
		var uch;

		if (c == 0)
		{
			return 0;
		}
		else if (c < 0x80)
		{
			this.current++;
			return c;
		}

		seqlen = UTF8_SEQLEN(c);

		for (i = 0; i < seqlen; i++)
		{
			if (this.current[i] == 0)
			{
				// XXX: invalid or incomplete sequence
				return 0;
			}
		}

		uch = _DecodeUTF8((char*)this.current);

		if (uch == INVALID_CHAR)
		{
			return 0;
		}

		this.current += seqlen;
		return uch;
	},

	prevChar: function()
	{
		var uch;
		var len;

		for (len = 1; len <= 6 && this.current - len > this.s; len++)
		{
			char c = *(var )(this.current - len);
			if (c < 0x80 || c >= 0xc2)
				break;
		}

		this.current -= len;
	//	uch = _DecodeUTF8((char*)this.current);
	//	if (uch == INVALID_CHAR) return 0;

		return this.current;
	},

	current: function()
	{
		return this.current;
	},

	onNULL: function()
	{
		return (*(this.current) == 0);
	},

	// ------------------------------------------

	currentLineNumberOld: function()
	{
		var lineNumber = 1;
		var s = this.s;

		while (s < this.current)
		{
			if (*s == '\n')
			{
				lineNumber ++;
			}

			s ++;
		}

		return lineNumber;
	},

	currentLineNumber: function()
	{
		// this should be even faster than a binary search
		// since almost all results are very close to the last

		var index = this.charLineIndex;
		var line = this.lineHint;
		var numLines = List_size(index);
		void *current = (void *)this.current;

		if (current < index.at(line))
		{
			// walk down lines until char is bigger than one
			while (line > 0 && !(current > index.at(line)))
			{
				line --;
			}
			line ++;
		}
		else
		{
			// walk up lines until char is less than or equal to one
			while (line < numLines && !(current <= index.at(line)))
			{
				line ++;
			}
		}


		this.lineHvar = line;

		return line;
	},

	clear: function()
	{
		this.tokenStream.removeAll();

		this.posStack.clear();
		this.tokenStack.clear();

		this.current = this.s;
		this.resultIndex = 0;
		this.maxChar = 0;
		this.errorToken = null;
	},

	errorToken: function()
	{
		return this.errorToken;
	},

	// lexing -------------------------------------

	string_(string)
	{
		this.current = this.s.length();
		this.s = this.s + string;
		this.buildLineIndex();
	},

	printLast_(var max)
	{
		var s = this.s + this.maxChar;
		var i;

		for (i = 0; i < max && s[i]; i ++)
		{
			putchar(s[i]);
		}
	},

	// --- token and character position stacks ---

	lastPos: function()
	{
		return this.posStack.top();
	},

	pushPos: function()
	{
		var index = this.current - this.s;

		if (index > this.maxChar)
		{
			this.maxChar = index;
		}

		this.tokenStack.push(List_size(this.tokenStream) - 1);
		this.posStack.push(this.current);

		//printf("push: ");
		//print(this);
	},

	popPos: function()
	{
		this.tokenStack.pop();
		this.posStack.pop();
		//printf("pop:	");
		//print(this);
	},

	popPosBack: function()
	{
		var i = this.tokenStack.pop();
		var topIndex = this.tokenStack.pop();

		if (i > -1)
		{
			this.tokenStream.setSize(i + 1);

			if (i != topIndex)
			{
				var parent = this.currentToken();

				if (parent)
				{
					parent.nextToken_(null);
				}
			}
		}

		this.current = this.posStack.pop();
		//printf("back: "); print(this);
	},

	// ------------------------------------------

	lex: function()
	{
		this.clear();
		this.pushPos();

		this.messageChain();

		if (*(this.current))
		{
			//printf("Lexing error after: ");
			//printLast_(this, 30);
			//printf("\n");

			if (!this.errorToken)
			{
				if (this.tokenStream.size() > 0)
				{
					this.errorToken = this.currentToken();
				}
				else
				{
					this.errorToken = this.addTokenString_length_type_(this.current, 30, NO_TOKEN);
				}

				this.errorToken.setError("Syntax error near this location");
			}
			return -1;
		}
		return 0;
	},

	// getting results --------------------------------

	top: function()
	{
		return this.tokenStream.at(this.resultIndex);
	},

	topType: function()
	{
		if (!this.top())
		{
			return 0;
		}

		return this.top().type;
	},

	pop: function()
	{
		var t = this.top();
		this.resultIndex ++;
		return t;
	},

	// stack management --------------------------------

	print: function()
	{
		var first = this.tokenStream.first();

		if (first)
		{
			IoToken_print(first);
		}

		printf("\n");
	},

	printTokens: function()
	{
		var i;

		for (i = 0; i < this.tokenStream.size(); i ++)
		{
			var t = this.tokenStream.at(i);

			printf("'%s'", t->name);
			printf(" %s ", IoToken_typeName(t));

			if (i <this.tokenStrea.size() - 1)
			{
				printf(", ");
			}
		}

		printf("\n");
	},

	// grabbing ---------------------------------------------

	grabLength: function()
	{
		var s1 = this.lastPos();
		var s2 = this.current();

		return s2 - s1;
	},

	grabTokenType_(IoTokenType type)
	{
		var s1 = this.lastPos();
		var s2 = this.current();
		var len = (s2 - s1);

		if (!len)
		{
			printf("IoLexer fatal error: empty token\n");
			System.exit(1);
		}

		this.addTokenString_length_type_(s1, len, type);
	},

	addTokenString_length_type_(s1, len, type)
	{
		var top = this.currentToken();
		var t = IoToken:clone();

		t->lineNumber = this.currentLineNumber();
		//t->charNumber = (int)(s1 - this.s);
		t->charNumber = (int)(this.current - this.s);

		if (t->charNumber < 0)
		{
			printf("bad t->charNumber = %i\n", t->charNumber);
		}

		IoToken_name_length_(t, s1, len);
		IoToken_type_(t, type);

		if (top)
		{
			IoToken_nextToken_(top, t);
		}

		this.tokenStream.push(t);
		//printf("token '%s' %s\n", t->name, IoToken_typeName(t));
		return t;
	},

	// reading ------------------------------------

	messageChain: function()
	{
		do
		{
			while (	this.readTerminator() ||
					this.readSeparator() ||
					this.readComment())
			{}
		} while ( this.readMessage());
	},

	// message -------------------------------

	readMessage_error(name)
	{
		this.popPosBack();
		this.errorToken = this.currentToken();
		this.errorToken.setError(name);
	},

	readTokenChars_type_(chars, IoTokenType type)
	{
		while (*chars)
		{
			if (this.readTokenChar_type_(chars, type)) return 1;
			chars ++;
		}

		return 0;
	},

	const nameForGroupChar_(char groupChar)
	{
		switch (groupChar)
		{
			case '(': return "";
			case '[': return "squareBrackets";
			case '{': return "curlyBrackets";
		}

		printf("IoLexer: fatal error - invalid group char %c\n", groupChar);
		exit(1);
	},

	//static var specialChars = ":._";
	static var specialChars = "._";

	readMessage: function()
	{
		char foundSymbol;

		this.pushPos();
		this.readPadding();

		foundSymbol = this.readSymbol();


		{
			char groupChar;
			while (this.readSeparator() || this.readComment())
			{}

			groupChar = *this.current();

			if (groupChar && (strchr("[{", groupChar) || (!foundSymbol && groupChar == '(')))
			{
				var groupName = this.nameForGroupChar_groupChar);
				this.addTokenString_length_type_(groupName, groupName.length(), IDENTIFIER_TOKEN);
			}

			if (readTokenChars_type_(this, "([{", OPENPAREN_TOKEN))
			{
				this.readPadding();
				do {
					IoTokenType type = this.currentToken()->type;

					this.readPadding();
					// Empty argument: (... ,)
					if (COMMA_TOKEN == type)
					{
						char c = *this.current();

						if (',' == c || strchr(")]}", c))
						{
							this.readMessage_error("missing argument in argument list");
							return 0;
						}
					}

					//if (groupChar == '[') specialChars = "._";
					this.messageChain();
					//if (groupChar == '[') specialChars = ":._";
					this.readPadding();

				} while (this.readTokenChar_type_(',', COMMA_TOKEN));

				if (!this.readTokenChars_type_(")]}", CLOSEPAREN_TOKEN))
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
					//printf("Token %p error: %s - %s\n", t, t->error, IoToken_error(t));
					return 0;
				}

				this.popPos();
				return 1;
			}

			if (foundSymbol)
			{
				this.popPos();
				return 1;
			}
		}
		this.popPosBack();
		return 0;
	},

	readPadding: function()
	{
		var r = 0;

		while (readWhitespace(this) || readComment(this))
		{
			r = 1;
		}

		return r;
	},

	// symbols ------------------------------------------

	readSymbol: function()
	{
		if (this.readNumber() ||
			this.readOperator() ||
			this.readIdentifier() ||
			this.readQuote()) return 1;
		return 0;
	},

	readIdentifier: function()
	{
		this.pushPos();

		while ( readLetter(this) ||
				readDigit(this) ||
				readSpecialChar(this))
		{}

		if (this.grabLength())
		{
			// avoid grabing : on last character if followed by =

/*
			var current = this.current();

			if (*(current - 1) == ':' && *current == '=')
			{
				this.prevChar();
			}
			*/


			this.grabTokenType_(IDENTIFIER_TOKEN);
			this.popPos();
			return 1;
		}

		this.popPosBack();

		return 0;
	},

	readOperator: function()
	{
		var c;
		this.pushPos();
		// ok if first character is a colon
		c = this.nextChar();
		//printf("this.nextChar() = %c %i\n", c, c);

		if (c == 0)
		{
			this.popPosBack();
			return 0;
		}
		else
		{
			this.prevChar();
		}
		/*
		if (c != ':')
		{
			this.prevChar();
		}
		*/

		while (readOpChar(this))
		{ }

		if (this.grabLength())
		{
			this.grabTokenType_(IDENTIFIER_TOKEN);
			this.popPos();
			return 1;
		}

		this.popPosBack();
		return 0;
	},

	// comments ------------------------------------------

	readComment: function()
	{
		return (readSlashStarComment(this) ||
			readSlashSlashComment(this) ||
			readPoundComment(this));
	},

	readSlashStarComment: function()
	{
		this.pushPos();

		if (this.readString_("/*"))
		{
			var nesting = 1;

			while (nesting > 0)
			{
				if (this.readString_("/*"))
				{
					this.nextChar();
					nesting++;
				}
				else if (this.readString_("*/"))
				{
					// otherwise we end up trimming the last char
					if (nesting > 1) this.nextChar();
					nesting--;
				}
				else
				{
					var c = this.nextChar();
					if(c == 0)
					{
						this.errorToken = this.currentToken();

						if (!this.errorToken)
						{
							this.grabTokenType_(NO_TOKEN);
							this.errorToken = this.currentToken();
						}

						if (this.errorToken)
						{
							this.errorToken.setError("unterminated comment");
						}

						this.popPosBack();
						return 0;
					}
				}
			}
			this.popPos();
			return 1;
		}

		this.popPosBack();
		return 0;
	},

	readSlashSlashComment: function()
	{
		this.pushPos();

		if (this.nextChar() == '/')
		{
			if (this.nextChar() == '/')
			{
				while (this.readNonReturn()) { }
				this.popPos();
				return 1;
			}
		}

		this.popPosBack();
		return 0;
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
			return 1;
		}

		this.popPosBack();
		return 0;
	},

	// quotes -----------------------------------------

	readQuote: function()
	{
		return (this.readTriQuote() || this.readMonoQuote());
	},

	readMonoQuote: function()
	{
		this.pushPos();

		if (this.nextChar() == '"')
		{
			for (;;)
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
					this.errorToken = this.currentToken();

					if (this.errorToken)
					{
						this.errorToken.setError("unterminated quote");
					}

					this.popPosBack();
					return 0;
				}
			}

			this.grabTokenType_(MONOQUOTE_TOKEN);
			this.popPos();
			return 1;
		}

		this.popPosBack();
		return 0;
	},

	readTriQuote: function()
	{
		this.pushPos();

		if (this.readString_("\"\"\""))
		{
			while (!this.readString_("\"\"\""))
			{
				var c = this.nextChar();

				if (c == 0)
				{
					this.popPosBack();
					return 0;
				}
			}

			this.grabTokenType_(TRIQUOTE_TOKEN);
			this.popPos();
			return 1;
		}

		this.popPosBack();
		return 0;
	},

	// helpers ----------------------------

	readTokenChar_type_(c, tokenType)
	{
		this.pushPos();

		if (this.readChar_(c))
		{
			this.grabTokenType_(tokenType);
			this.popPos();
			return 1;
		}

		this.popPosBack();
		return 0;
	},

	readTokenString_(s)
	{
		this.pushPos();

		if (this.readString_(s))
		{
			this.grabTokenType_(IDENTIFIER_TOKEN);
			this.popPos();
			return 1;
		}

		this.popPosBack();
		return 0;
	},


	readString_(s)
	{
		var len = strlen(s);

		if (this.onNULL())
		{
			return 0;
		}

		if (strncmp(this.current, s, len) == 0)
		{
			this.current += len;
			return 1;
		}

		return 0;
	},

	readCharIn_(s)
	{
		if (!this.onNULL())
		{
			var c = this.nextChar();

			if (c < 0x80 && strchr(s, c))
			{
				return 1;
			}

			this.prevChar();
		}
		return 0;
	},

	readCharInRange_(first, last)
	{
		if (!this.onNULL())
		{
			var c = this.nextChar();

			if (c >= first && c <= last)
			{
				return 1;
			}

			this.prevChar();
		}
		return 0;
	},

	readChar_(char c)
	{
		if (!this.onNULL())
		{
			var nc = this.nextChar();

			if (nc && nc == c)
			{
				return 1;
			}

			this.prevChar();
		}
		return 0;
	},

	readCharAnyCase_(char c)
	{
		if (!this.onNULL())
		{
			var nc = this.nextChar();

			if (nc && tolower(nc) == tolower(c))
			{
				return 1;
			}

			this.prevChar();
		}
		return 0;
	},

	readNonASCIIChar_: function()
	{
		if (!this.onNULL())
		{
			var nc = this.nextChar();

			if (nc >= 0x80)
				return 1;

			this.prevChar();
		}
		return 0;
	},

	readNonReturn: function()
	{
		if (this.onNULL()) return 0;
		if (this.nextChar() != '\n') return 1;
		this.prevChar();
		return 0;
	},

	readNonQuote: function()
	{
		if (this.onNULL()) return 0;
		if (this.nextChar() != '"') return 1;
		this.prevChar();
		return 0;
	},

	// character definitions ----------------------------

	readCharacters: function()
	{
		var read = 0;

		while (this.readCharacter())
		{
			read = 1;
		}

		return read;
	},

	readCharacter: function()
	{
		return (
			this.readLetter() ||
			this.readDigit() ||
			this.readSpecialChar() ||
			this.readOpChar()
		);
	},

	readOpChar: function()
	{
		return this.readCharIn_(":'~!@$%^&*-+=|\\<>?/");
	},

	readSpecialChar: function()
	{
		return this.readCharIn_(specialChars);
	},

	readDigit: function()
	{
		return this.readCharInRange_('0', '9');
	},

	readLetter: function()
	{
		return this.readCharInRange_('A', 'Z') ||
			this.readCharInRange_('a', 'z') ||
			this.readNonASCIIChar_();
	},

	// terminator -------------------------------

	readTerminator: function()
	{
		var terminated = 0;
		this.pushPos();
		readSeparator(this);

		while (this.readTerminatorChar())
		{
			terminated = 1;
			readSeparator(this);
		}

		if (terminated)
		{
			var top = this.currentToken();

			// avoid double terminators
			if (top && top.tokenType() == TERMINATOR_TOKEN)
			{
				return 1;
			}

			this.addTokenString_length_type_(";", 1, TERMINATOR_TOKEN);
			this.popPos();
			return 1;
		}

		this.popPosBack();
		return 0;
	},

	readTerminatorChar: function()
	{
		return this.readCharIn_(";\n");
	},

	// separator --------------------------------

	readSeparator: function()
	{
		this.pushPos();

		while (readSeparatorChar(this))
		{
		}

		if (this.grabLength())
		{
			//this.grabTokenType_(SEPERATOR_TOKEN);
			this.popPos();
			return 1;
		}

		this.popPosBack();
		return 0;
	},

	readSeparatorChar: function()
	{
		if (this.readCharIn_(" \f\r\t\v"))
		{
			return 1;
		}
		else
		{
			this.pushPos();
			if (this.readCharIn_("\\"))
			{
				while (this.readCharIn_(" \f\r\t\v"))
				{
				}

				if (this.readCharIn_("\n"))
				{
					this.popPos();
					return 1;
				}
			}
			this.popPosBack();
			return 0;
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
			//this.grabTokenType_(WHITESPACE_TOKEN);
			this.popPos();
			return 1;
		}

		this.popPosBack();
		return 0;
	},

	readWhitespaceChar: function()
	{
		return this.readCharIn_(" \f\r\t\v\n");
	},

	readDigits: function()
	{
		var read = 0;

		this.pushPos();

		while (this.readDigit())
		{
			read = 1;
		}

		if (!read)
		{
			this.popPosBack();
			return 0;
		}

		this.popPos();
		return read;
	},

	readNumber: function()
	{
		return (this.readHexNumber() || this.readDecimal());
	},

	readExponent: function()
	{
		if (readCharAnyCase_(this, 'e'))
		{
			if (!this.readChar_('-'))
			{
				this.readChar_('+');
			}

			if (!this.readDigits())
			{
				return -1;
			}

			return 1;
		}
		return 0;
	},

	readDecimalPlaces: function()
	{
		if (this.readChar_('.'))
		{
			if (!this.readDigits())
			{
				return -1;
			}

			return 1;
		}
		return 0;
	},

	readDecimal: function()
	{
		this.pushPos();

		if (this.readDigits())
		{
			if (this.readDecimalPlaces() == -1)
			{
				this.popPosBack();
				return 0;
			}
		}
		else
		{
			if (readDecimalPlaces(this) != 1)
			{
				this.popPosBack();
				return 0;
			}
		}

		if (readExponent(this) == -1)
		{
			this.popPosBack();
			return 0;
		}

		if (this.grabLength())
		{
			this.grabTokenType_(NUMBER_TOKEN);
			this.popPos();
			return 1;
		}
	
		this.popPosBack();
		return 0;
	},

	readHexNumber: function()
	{
		var read = 0;

		this.pushPos();

		if (this.readChar_('0') && this.readCharAnyCase_('x'))
		{
			while (this.readDigits() || this.readCharacters())
			{
				read ++;
			}
		}

		if (read && thisgrabLength())
		{
			this.grabTokenType_(HEXNUMBER_TOKEN);
			this.popPos();
			return 1;
		}

		this.popPosBack();
		return 0;
	},

});

