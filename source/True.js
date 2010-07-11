
True = Proto.clone().newSlots({
}).setSlots({

	ifTrue: function(f1, f2)
	{
		return f1();
	},

	ifFalse(f1, f2)
	{
		if(f2) then 
		{
			return f2() 
		}
		return Nil;
	},

	isTrue: function()
	{
		return True;
	},

	isFalse()
	{
		return False;
	}
});