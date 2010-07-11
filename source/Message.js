
dofile("Number.lua")

Message = Object:clone()

function Message:with(name)
	local o = self:clone()
	o.name = name
	o.cachedResult = nil
	o.arguments = {}
	o.next = nil
	return o
end

function Message:setNext(m)
	self.next = m
	return self
end

function Message:run(target, locals)
	local m = self
	local r = locals
	while m do
		if m.name == ";" then r = locals; m = m.next end
		r = r[m.name](r)
		m = m.next
	end
	return r
end

function Message:asString()
	return self.name .. "(" .. table.concat(self.arguments, ", ") .. ")"
end

function Message:print()
	print(self:asString())
end


ofile("Message.lua")


--m = Message:with("increment")
--m.arguments = {"a", "b"}
--m:run(Number:with(1), Number:with(0)):println()
--m:print()
