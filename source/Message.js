
require("Number")

Message = Proto.clone().newSlots({
	protoType: "Message",
	name: "",
	cachedResult: null,
	arguments: [],
	next: null,
}).setSlots({
	
	with: function(name)
	{
		var o = this:clone()
		o.name = name
		o.cachedResult = nil
		o.arguments = {}
		o.next = nil
		return o
	},

	run: function(target, locals)
	{
		var m = this
		var r = locals
		while m do
			if (m.name == ";") then { r = locals; m = m.next },
			r = r[m.name](r)
			m = m.next
		},
		return r
	},

	asString: function()
	{
		return this.name .. "(" .. table.concat(this.arguments, ", ") .. ")"
	},

	print: function()
	{
		print(this:asString())
	}
});


//ofile("Message.lua")
//m = Message:with("increment")
//m.arguments = {"a", "b"}
//m:run(Number:with(1), Number:with(0)):println()
//m:print()
