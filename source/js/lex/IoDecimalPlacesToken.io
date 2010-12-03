
IoDecimalPlacesToken = IoToken.clone().newSlots({
	protoType: "IoDecimalPlacesToken",
}).setSlots({

	readDecimalPlaces: function()
	{
		if (this.readChar('.'))
		{
			if (!this.readDigits())
			{
				return -1;
			}

			return true;
		}
		
		return false;
	}

});
