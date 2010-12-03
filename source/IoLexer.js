var sys = require('sys');

IoLexer = Proto.clone().newSlots({
	protoType: "IoLexer",
	s: "",
	pos: 0,
	tokens: [],
	message: null,
}).setSlots({
	isOpenGroupChar:  function (c) { return "([{".containsChar(c); },
	isCloseGroupChar: function (c) { return "}])".containsChar(c); },
	isQuoteChar:      function (c) { return "\"" .containsChar(c); },
	isCommaChar:      function (c) { return ","  .containsChar(c); },
	isPadChar:        function (c) { return " \t".containsChar(c); },
	isTerminatorChar: function (c) { return ";\n".containsChar(c); },
	isSymbolChar: function (c)
	{
		if (IoLexer.isOpenGroupChar(c) ) return false;
		if (IoLexer.isCloseGroupChar(c)) return false;
		if (IoLexer.isQuoteChar(c)     ) return false;
		if (IoLexer.isCommaChar(c)     ) return false;
		if (IoLexer.isPadChar(c)       ) return false;
		if (IoLexer.isTerminatorChar(c)) return false;
		return true;
	},
		
	init: function()
	{
		this._s = "";
		this._tokens = [];
		return this;
	},
	
	currentChar: function()
	{
		if(this._pos > this._s.size() - 1) return null;
		return this._s[this._pos];
	},
	
	isAtEnd: function()
	{
		return (this._pos == (this._s.size()));
	},
	
	lex: function()
	{
		while (!this.isAtEnd())
		{
			this.readCharMatching(IoLexer.isOpenGroupChar, "open");
			this.readCharMatching(IoLexer.isCloseGroupChar, "close");
			this.readCharMatching(IoLexer.isCommaChar, "comma");
			this.readCharMatching(IoLexer.isQuoteChar, "quote");
			this.readCharSeqMatching(IoLexer.isPadChar, "pad");
			this.readCharMatching(IoLexer.isTerminatorChar, "terminator");
			this.readCharSeqMatching(IoLexer.isSymbolChar, "symbol");
		}
		
		return this;
	},
	
	grabFrom: function(i, tokenType)
	{
		if(i < this._pos)
		{
			var s = this.s().slice(i, this._pos);
			this.tokens().push({tokenType: tokenType, name: s});
		}
	},
	
	readCharMatching: function(f, name)
	{
		var i = this._pos;
		
		if(this.currentChar() != null && f(this.currentChar())) 
		{ 
			this._pos ++; 
		}
		
		this.grabFrom(i, name);		
	},
	
	readCharSeqMatching: function(f, name)
	{
		var i = this._pos;
		
		while(this.currentChar() != null && f(this.currentChar())) 
		{ 
			this._pos ++; 
		}
		
		this.grabFrom(i, name);		
	},
		
	parse: function()
	{
		this.setMessage(IoMessage.clone().parse(this.tokens()));
		return this;
	},
	
	eval: function()
	{
		return this.message().perf(IoLobby, IoLobby);	
	},
	
	show: function()
	{
		writeln("code:\n  '", this.s(), "'\n");
		writeln("lexed:");
		this.tokens().forEach(function (t) { writeln("  '", t.name, "' ", t.tokenType); });		
		writeln("\nparsed:");
		writeln("  " + this.message().asString());
	}
});