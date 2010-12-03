IoNumber = IoObject.clone().newSlots({
	protoType: "IoNumber",
	value: 0,
	ioslots: {
		"-": { 
			activate: function (self, locals, m) 
			{ 
				var other = m._args[0].perf(locals, locals);
				return IoNumber.clone().setValue(self._value - other._value);
			}},
		"+": { 
			activate: function (self, locals, m) 
			{ 
				var other = m._args[0].perf(locals, locals);
				return IoNumber.clone().setValue(self._value + other._value);
			}},
	}
}).setSlots({
	init: function()
	{
		//writeln("IoNumber init");
		this._proto._proto.init.apply(this);
		this._value = 0;
		return this;
	},

	asString: function()
	{
		return this._value.toString();
	}
});