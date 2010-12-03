
IoContinuation = IoObject.clone().newSlots({
	protoType: "IoContinuation",
	target: null,
	message: null,
	locals: null,
	value: null,
	retValue: null,
	previous: null,
	next: null,
	messagesPerRun: 100,
}).setSlots({
	
	run: function()
	{
		this._message.continue(this);
	},
	
	activate: function()
	{
		IoScheduler.push(this);
	}
	
});
