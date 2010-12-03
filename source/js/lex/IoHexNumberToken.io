
IoHexNumberToken = IoToken.clone().newSlots({
	protoType: "IoHexNumberToken",
}).setSlots({

	lex: function()
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