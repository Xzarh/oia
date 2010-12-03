
IoSeperatorToken = IoToken.clone().newSlots({
	protoType: "IoSeperatorToken",
}).setSlots({

	readSeparator: function()
	{
		this.pushPos();

		while (this.readSeparatorChar())
		{
		}

		if (this.grabLength())
		{
			this.popPos();
			return true;
		}

		this.popPosBack();
		return false;
	},
	
	readSeparatorChar: function()
	{
		if (this.readCharIn(" \f\r\t\v"))
		{
			return true;
		}
		else
		{
			this.pushPos();
			if (this.readCharIn("\\"))
			{
				while (this.readCharIn(" \f\r\t\v"))
				{
				}

				if (this.readCharIn("\n"))
				{
					this.popPos();
					return true;
				}
			}
			
			this.popPosBack();
			return false;
		}
	}

});
