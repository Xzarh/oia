
IoTerminatorToken = IoToken.clone().newSlots({
	protoType: "IoTerminatorToken",
}).setSlots({

	readTerminator: function()
	{
		var terminated = false;
		
		this.pushPos();
		this.readSeparator();

		while (this.readTerminatorChar())
		{
			terminated = true;
			this.readSeparator();
		}

		if (terminated)
		{
			var top = this.currentToken();

			// avoid double terminators
			if (top && top.tokenType() == "terminator")
			{
				return true;
			}

			this.addToken_type_(";", "terminator");
			this.popPos();
			return true;
		}

		this.popPosBack();
		return false;
	},

	readTerminatorChar: function()
	{
		return this.readCharIn(";\n");
	}
});
