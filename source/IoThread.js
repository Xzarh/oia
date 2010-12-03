// this probably won't be used - will be replaced with Continuation

IoThread = IoObject.clone().newSlots({
	protoType: "IoThread",
	calls: [],
}).setSlots({
	init: function()
	{
		this._proto._proto.init.apply(this);
		this._calls = [];
		return this;
	},

	push: function(call)
	{
		//{target:target, locals:locals, message:message, value:null, retValue}
		this._calls.push(call);
	},
	
	pop: function()
	{
		var call = this._calls.pop();
		this.top().retValue = call.retValue;
	},
	
	top: function()
	{
		return this._calls.last();
	},
	
	step: function()
	{
		this.top().continue();
		if(call.retValue != undefined) this.pop();
	}
});