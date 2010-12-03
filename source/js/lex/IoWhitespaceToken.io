
IoWhitespaceToken = IoToken.clone().newSlots({
	protoType: "IoWhitespaceToken",
}).setSlots({

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
	}

});
