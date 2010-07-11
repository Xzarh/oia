
Object = {}

function Object:clone()
	local o = {}
	setmetatable(o, self)
	self.__index = self
	return o
end

function Object:print()
	print("Object")
	for i, v in pairs(self) do
		print("  " .. i .. ":" .. v);
	end
	return self;
end

function Object:println()
	self:print()
	print("\n")
	return self;
end

function Object:updateSlot(name, value)
	if (self["_" .. name]) then
		self["_" .. name] = value;
	else
		print("updateSlot Error");
	end
	return value;
end

function Object:newSlot(name, value)
	self["_" .. name] = value;
	return self;
end

function Object:getSlot(name, value)
	return self["_" .. name];
end
