
False = Proto.clone().newSlots({
}).setSlots({

	ifTrue: function(f1, f2)
	{
		if(f2) return f2();
			return Nil;
	},

	ifFalse(f1, f2)
	{
		return f1() 
	},

	isTrue: function()
	{
		return False;
	},

	isFalse()
	{
		return True;
	}
});