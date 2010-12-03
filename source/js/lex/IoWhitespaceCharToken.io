
IoWhitespaceCharToken = IoToken.clone().newSlots({
	protoType: "IoWhitespaceCharToken",
}).setSlots({

	readWhitespaceChar: function()
	{
		return this.readCharIn(" \f\r\t\v\n");
	}
});
