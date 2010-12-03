
IoDigitsToken = IoToken.clone().newSlots({
	protoType: "IoDigitsToken",
}).setSlots({

	readDigits: function()
	{
		var didRead = false;

		this.pushPos();

		while (this.readDigit())
		{
			didRead = true;
		}

		if (!didRead)
		{
			this.popPosBack();
			return false;
		}

		this.popPos();
		return didRead;
	}
});
