IoBlock = IoObject.clone().newSlots({
	protoType: "IoBlock",
	argNames: null,
	message: null,
	scope: null
}).setSlots({
	init: function()
	{
		this._proto._proto.init.apply(this);
		this._argNames = [];
		return this;
	},
	
	activate: function(sender, m)
	{
		var m = message;
		var locals = IoObject.clone().setProtos([sender]);
		
		for (var i = 0; i < this._argNames.length; i ++)
		{
			var argName = this._argNames[i];
			locals.set(argName, sender.perf(m._args[i], sender));
			if (result) break;
		}
		
		return scope.perf(m, locals, locals);
	},
	
	asString: function()
	{
		return "[IoBlock " + this._message.asString() + "]";
	}
});