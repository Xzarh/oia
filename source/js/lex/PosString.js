require("../lib.js");

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
	},
	
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
	}
}

