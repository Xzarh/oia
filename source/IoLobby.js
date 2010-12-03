IoLobby = IoObject.clone().newSlots({
	protoType: "IoLobby",
	ioslots: {
		Object: IoObject, 
		Number: IoNumber
	},
	protos: [IoObject]
}).setSlots({
	init: function()
	{
		this._proto.init.apply(this);
		this._ioslots = {IoObject: IoObject};
		return this;
	},
});

IoObject.setProtos([IoLobby]);
