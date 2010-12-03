
IoObject = Proto.clone().newSlots({
	
}).setSlots({
	
	clone: function()
	{
		return this;
	}

	print: function()
	{
		print("Object")
		for i, v in pairs(this) do
			print("  " .. i .. ":" .. v);
		}
		return this;
	}

	println: function()
	{
		this:print()
		print("\n")
		return this;
	}

	updateSlot: function(name, value)
	{
		if (this["_" .. name]) then
			this["_" .. name] = value;
		else
			print("updateSlot Error");
		}
		return value;
	}

	newSlot: function(name, value)
	{
		this["_" .. name] = value;
		return this;
	}

	getSlot: function(name, value)
	{
		return this["_" .. name];
	}
});
