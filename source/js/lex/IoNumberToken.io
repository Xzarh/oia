
IoNumberToken = IoToken.clone().newSlots({
	protoType: "IoNumberToken",
}).setSlots({

	lex: function()
	{
		return 
			this.readHexNumber() || 
			this.readDecimal();
	}
});
