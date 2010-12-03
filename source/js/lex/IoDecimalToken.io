
IoDecimalToken = IoToken.clone().newSlots({
	protoType: "IoDecimalToken",
}).setSlots({

	lex: function()
	{
		this.pushPos();

		if (this.readDigits())
		{
			if (this.readDecimalPlaces() == -1)
			{
				this.popPosBack();
				return false;
			}
		}
		else
		{
			if (this.readDecimalPlaces() != true)
			{
				this.popPosBack();
				return false;
			}
		}

		if (this.readExponent() == -1)
		{
			this.popPosBack();
			return false;
		}

		if (this.grabLength())
		{
			this.grabTokenType_("number");
			this.popPos();
			return true;
		}

		this.popPosBack();
		return false;
	}
});
