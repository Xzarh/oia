IoString = IoObject.clone().newSlots({
	protoType: "IoString",
	value: 0,
	ioslots: {
		"print": { 
			activate: function (self, locals, m) 
			{ 
				writeln(self._value);
			}
		},
		"..": { 
			activate: function (self, locals, m) 
			{ 
				var other = m._args[0].perf(locals, locals);
				return IoString.clone().setValue(self._value + other._value);
			}
		},
	}
}).setSlots({
	init: function()
	{
		this._proto._proto.init.apply(this);
		this._value = 0;
		return this;
	},
	
	asString: function()
	{
		return this._value.toString();
	}
});