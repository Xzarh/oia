IoObject = Proto.clone().newSlots({
	protoType: "IoObject",
	ioslots: {
		"print": { 
			activate: function (self, locals, m) 
			{ 
				writeln("[IoObject]");
			}
		},
		"block": { 
			activate: function (self, locals, m) 
			{ 
				return IoBlock.clone().setMessage(m);
			}
		},
		"setSlot": { 
			activate: function (self, locals, m) 
			{ 
				var name = m._args[0].perf(locals, locals);
				var value = m._args[1].perf(locals, locals);
				return this.set(name.value(), value);
			}
		},
		"getSlot": { 
			activate: function (self, locals, m) 
			{ 
				var name = m._args[0].perf(locals, locals);
				return this.get(name.value());
			}
		},
		"slotNames": { 
			activate: function (self, locals, m) 
			{ 
				var name = m._args[0].perf(locals, locals);
				return this.get(name.value());
			}
		},
	},
	
	didLookup: false,
	protos: []
}).setSlots({
	init: function()
	{
		//writeln("IoObject init");
		this._didLookup = false;
		this._protos = [];
		return this;
	},
	
	get: function(k)
	{
		return this._ioslots[k];
	},
	
	set: function(k, v)
	{
		this._ioslots[k] = v;
	},
	
	lookup: function(k)
	{
		if(this._didLookup) 
		{
			return null;
		}
		
		var v = this.get(k);
		
		if(v) 
		{
			return {_value: v, _context: this};
		}
		
		this._didLookup = true;
		var r;
		var plen = this._protos.length;
		
		for (var i = 0; i < plen; i ++)
		{
			r = this._protos[i].lookup(k);
			if (r) break;
		}
		
		this._didLookup = false;
		return r;
	},

	
	activate: function(locals, m)
	{
		return this;
	},
	
	perf: function(m, locals)
	{
		var loc = this.lookup(m._name);
		
		if(loc == null) 
		{
			loc = this.lookup("forward");
		}
		
		if(loc == null)
		{
			throw new Error(this._protoType + " missing slot '" + m._name + "' and no forward slot found");
		}
		
		//writeln(this.asString(), " perf ", m._name);
		return loc._value.activate(this, locals, m);		
	}
});