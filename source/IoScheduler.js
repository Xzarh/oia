
IoScheduler = IoObject.clone().newSlots({
	protoType: "IoScheduler",
	continuations: [],
}).setSlots({
	init: function()
	{
		this._proto._proto.init.apply(this);
		this._calls = [];
		return this;
	},

	push: function(call)
	{
		this._continuations.push(call);
	},
	
	step: function()
	{
		var c = this.removeFirst();
		
		if (c)
		{
			c.continue();
			//if(c.retValue != undefined) this.pop();
		}
	}
});