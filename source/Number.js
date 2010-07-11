dofile("Object.lua")

Number = Object:clone()

function Number:with(v)
	local o = self:clone()
	o.value = v
	return o
end
	
function Number:add(v)
	return Number:with(self.value + v.value)
end

function Number:increment()
	return Number:with(self.value + 1)
end

function Number:print()
	print(self.value)
end

--n1 = Number:with(1)
--n2 = Number:with(2)
--n1:add(n2):print()

