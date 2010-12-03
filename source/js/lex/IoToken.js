require("PosString");

IoToken = Proto.clone().newSlots({
	protoType: "IoToken",
	posString: null,
	next: null
}).setSlots({
	
	init: function()
	{
		return this;
	},
	
	print: function()
	{
		this.justPrint();

		if (this.next())
		{
			this.next().print();
		}

		console.log("\n");
	}
}
