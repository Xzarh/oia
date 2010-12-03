require("IoToken");

IoPaddingToken = IoToken.clone().newSlots({
	protoType: "IoPaddingToken",
}).setSlots({
	/*
	init: function()
	{
		return this;
	},
	*/
	
	lex: function(ps)
	{
		var lsp = ps.clone();
		var didRead = false;

		while (IoWhiteSpaceToken.lex(ps) || IoCommentToken.lex(ps))
		{
			lps1 = IoWhiteSpaceToken.lex(lps);
			lps2 = IoCommentToken.lex(lps);
			didRead = true;
		}

		return didRead;
	}

});

