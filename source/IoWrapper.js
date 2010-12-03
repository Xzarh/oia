IoWrapper= IoObject.clone().newSlots({
	protoType: "IoWrapper",
	value: 0,
	value: null,
	extraMethods: {
		"+": function(v)
		{
			//writeln("+ method");
			return this + v._value;
		}
	},
}).setSlots({
	init: function()
	{
		this._proto._proto.init.apply(this);
		this._value = null;
		return this;
	},
	
	wrap: function(v)
	{
		if(v._value == null) return IoWrapper.clone().setValue(v);		
		return v;
	},
	
	unwrap: function()
	{
		return this._value;
	},
	
	get: function(k)
	{
		return IoWrapper.wrap(this._value[k]);
	},
	
	set: function(k, v)
	{
		this._value[k] = v; // v._value?
	},
	
	lookup: function(k)
	{
		return this.get(k);
	},

	activate: function(locals, m)
	{
		return this;
	},
	
	perf: function(m, locals)
	{	
		//var args = m.args().map(function(a) { return IoWrapper.unwrap(a.perf(locals, locals)); });
		var args = m.args().map(function(a) { return a.perf(locals, locals); });
		var f = this._value[m._name];
		
		if(f == undefined)
		{
			f = this._extraMethods[m._name];
		}
		
		if(f == undefined)
		{
			throw new Error(typeof(this._value) + " '" + m._name + "' method not found");
		}
		//writeln(" this._value = ", this._value)
		//writeln(" args = ", args)
		var v = f.apply(this._value, args);
		return IoWrapper.wrap(v);
	}
});