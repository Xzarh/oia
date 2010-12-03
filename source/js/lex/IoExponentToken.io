
IoExponentToken = IoToken.clone().newSlots({
	protoType: "IoExponentToken",
}).setSlots({

	readExponent: function()
	{
		if (this.readCharAnyCase('e'))
		{
			if (!this.readChar('-'))
			{
				this.readChar('+');
			}

			if (!this.readDigits())
			{
				return -1;
			}

			return true;
		}
		
		return false;
	}

});
