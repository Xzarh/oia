require("Object")

Number = Proto.clone().newSlots({
	protoType: "Number",
	value: 0
}).setSlots({

	with: functon(v)
	{
		local o = this:clone()
		o.value = v
		return o
	},
	
	add: functon(v)
	{
		return Number:with(this.value + v.value)
	},

	increment: functon()
	{
		return Number:with(this.value + 1)
	},

	print: functon()
	{
		print(this.value)
	}
});

//n1 = Number:with(1)
//n2 = Number:with(2)
//n1:add(n2):print()

