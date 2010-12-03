Proto = {
	cloneConstructor: new Function,
	
	clone: function()
	{
		Proto.cloneConstructor.prototype = this;
		var clone = new Proto.cloneConstructor;
		clone.setProto(this);
		if(clone.init)
		{
			clone.init();
		}
		return clone;
	},
	
	_proto: Object,
	
	_protoType: "Proto",
	
	protoType: function()
	{
		return this._protoType;
	},
	
	setProtoType: function(protoType)
	{
		this._protoType = protoType;
		return this;
	},
	
	setProto: function(proto)
	{
		this._proto = proto;
		return this;
	},
	
	proto: function()
	{
		return this._proto;
	},
	
	hasSlot: function(name)
	{
		return this[name] !== undefined;
	},
	
	respondsTo: function(message)
	{
		return typeof(this[message]) == "function";
	},
	
	setSlot: function(name, value)
	{
		this[name] = value;
		return this;
	},
	
	setSlots: function(slots)
	{
		for(var name in slots)
		{
			if(slots.hasOwnProperty(name))
			{
				this.setSlot(name, slots[name]);
			}
		}
		if(slots.hasOwnProperty("toString"))
		{
			this.toString = slots.toString;
		}
		return this;
	},
	
	setSlotsIfAbsent: function(slots)
	{
		for(name in slots)
		{
			if(!this[name] && slots.hasOwnProperty(name))
			{
				this.setSlot(name, slots[name]);
			}
		}
		if(slots.hasOwnProperty("toString"))
		{
			this.toString = slots.toString;
		}
		return this;
	},
	
	copySlotsTo: function(aProto)
	{
		for(var slotName in this)
		{
			if(this.hasOwnProperty(slotName))
			{
				aProto[slotName] = this[slotName];
			}
		}
		return this;
	},
	
	newSlot: function(name, initialValue)
	{
		if(typeof(name) != "string") throw new Error("name must be a string");
		if(initialValue === undefined) { initialValue = null };

		this["_" + name] = initialValue;
		this[name] = function()
		{
			return this["_" + name];
		}

		this["set" + name.asCapitalized()] = function(newValue)
		{
			this["_" + name] = newValue;
			return this;
		}
		return this;
	},
	
	argsAsArray: function(args)
	{
		return Arguments_asArray(args);
	},
	
	newSlots: function()
	{
		var args = this.argsAsArray(arguments);

		var slotsMap = {};

		if(args.length > 1 || typeof(args[0]) == "string")
		{
			args.eachCall(function(slotName)
			{
				slotsMap[slotName] = null;
			})
		}
		else
		{
			slotsMap = args[0];
		}

		for(slotName in slotsMap)
		{
			this.newSlot(slotName, slotsMap[slotName]);
		}
		return this;
	},
	
	performUnlessNull: function()
	{
		var argsArray = this.argsAsArray(arguments);
		
		var obj = argsArray.removeFirst();
		if(obj)
		{
			obj.performWithArgs(argsArray.removeFirst(), argsArray);
		}
		else
		{
			return null;
		}
	},
	
	performWithArgs: function(message, argsArray)
	{
		return this[message].apply(this, argsArray);
	},
	
	perform: function()
	{
		var args = this.argsAsArray(arguments);
		return this.performWithArgs(args.removeFirst(), args);
	},
	
	protoPerform: function()
	{
		var args = this.argsAsArray(arguments);
		var message = args.removeFirst();
		var clone = this;
		var proto = this.proto();
		
		while(proto["proto"] && (clone[message] === proto[message]))
		{
			proto = proto.proto();
		}
		
		if(clone[message] !== proto[message])
		{
			return proto[message].apply(this, args);
		}
		else
		{
			throw new Error("No ancestors respond to " + message);
		}
	},
	
	extendNativeProtos: function()
	{
		var nativeProtos = [Array, String, Number];
		for(var i = 0; i < nativeProtos.length; i ++)
		{
			Proto.copySlotsTo(nativeProtos[i].prototype);
		}
	},
	
	slotNames: function()
	{
		return Object_mapSlots_(this, function(k, v){ return k });
	},
	
	asString: function()
	{
		return "[" + this._protoType + "]"
	}
}

Proto.extendNativeProtos();