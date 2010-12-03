
Token = Proto.clone().newSlots({
	protoType: "Token",
	name: "",
	tokenType: "",
	charNumber: 0,
	lineNumber: 0,
	nextToken: null,
	error: null,
	tokenType: null,
	
	validTokenTypes: [
		"comma", 
		"closegroup", 
		"hexnumber", 
		"identifier", 
		"monoquote", 
		"error", 
		"number", 
		"closegroup", 
		"seperator", 
		"triquote", 
		"terminator", 
		"whitespace"
		]
	
}).setSlots({
	
	setQuoteName: function(name)
	{
		this.setName('"' + name + '"');
		return this;
	},
	
	hasValidType: function()
	{
		return this.validTokenTypes().contains(this.tokenType())
	},
	
	print: function()
	{
		//writeln(" " + this.tokenType() + ":\t'" + this.name() + "'");
		writeln("  '" + this.name() + "' " + this.tokenType());
		//writeln("token type:'" + this.tokenType() + "' name:'" + this.name() + "'");
		/*if(this.nextToken())
		{
			this.nextToken().print();
		}
		*/
	}

});

