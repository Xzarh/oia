
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

