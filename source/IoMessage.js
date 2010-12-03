IoMessage = IoObject.clone().newSlots({
	protoType: "IoMessage",
	name: "",
	args: null,
	next: null,
	cachedResult: null
}).setSlots({
	init: function()
	{
		this._proto._proto.init.apply(this);
		this._name = null;
		this._args = [];
		return this;
	},
	
	numberFor: function(v)
	{
		return IoWrapper.wrap(v);
		//return IoNumber.clone().setValue(v);
	},
	
	stringFor: function(v)
	{
		return IoWrapper.wrap(v);
		//return IoString.clone().setValue(v);
	},
	
	parse: function(tokens)
	{
		//writeln("IoMessage parse ", tokens.first().name);
		while(tokens.first().tokenType == "pad") { tokens.removeFirst(); }

		if(tokens.first().tokenType == "quote")
		{
			tokens.removeFirst();
			this._name = '';
			while (tokens.size() > 0 && tokens.first().tokenType != "quote")
			{
				this._name += tokens.first().name
				tokens.removeFirst();
			}
			tokens.removeFirst();
			this._cachedResult = this.stringFor(this._name);
			this._name = '"' + this._name + '"'
			//writeln("quote: ", this._name);
		}
		else if(tokens.first().tokenType == "symbol" || tokens.first().tokenType == "terminator")
		{
			var t = tokens.removeFirst();
			this.setName(t.name);
			if(t.tokenType == "terminator") this.setName(";");
			
			// handle numbers
			var f = parseFloat(t.name);				
			if(f.toString() != NaN.toString()) 
			{
				this._cachedResult = this.numberFor(f);			
			}
		}
		else
		{
			return null;
		}

		this.parseGroup(tokens);
		
		/*
		if(this._name == null)
		{
			throw new Error("invalid token '" + tokens.first().name + "'")
		}
		*/

		if (tokens.size() > 0) { this.setNext(IoMessage.clone().parse(tokens)); }
		
		return this;
	},
	
	parseGroup: function(tokens)
	{				
		while(!tokens.isEmpty() && tokens.first().tokenType == "pad") 
		{ tokens.removeFirst(); }
		
		if(!tokens.isEmpty() && tokens.first().tokenType == "open")
		{
			tokens.removeFirst();
			
			while(true)
			{
				var m = IoMessage.clone().parse(tokens);
				if(m) { this.args().push(m); }
				
				if(tokens.first().tokenType == "comma")
				{
					tokens.removeFirst();
					continue;
				}
				
				if(tokens.first().tokenType == "close")
				{
					tokens.removeFirst();
					return this;
				}
				
				writeln("throwing");
				throw "missing close";
			}
		}
		
		return this;
	},
	
	print: function()
	{
		sys.print(this.asString());
	},
	
	asString: function()
	{
		var s = this.name();
		if(this.args().size() > 0)
		{
			s = s + "(" + this.args().map(function(a) { return a.asString(); }).join(", ") + ")";
		}
		if(this.next()) s = s + " " + this.next().asString();
		return s;
	},
	
	perf: function(locals, target)
	{
		var t = target;
		var m = this;
		//writeln("message perf");
		
		do
		{
			if(m._name == ";")
			{
				t = target;
			}
			else
			{				
				if(m._cachedResult)
				{
					t = m._cachedResult;
				}
				else
				{
					t = t.perf(m, locals);
					//if(IoState._stopStatus) return IoState._returnValue;
				}
			}
		} while(m = m._next);
		
		return t;
	},
	
	continue: function(c)
	{			
		if(this._name == ";")
		{
			c._value = c.locals;
		}
		else
		{				
			if(this._cachedResult)
			{
				c.value = m._cachedResult;
			}
			else
			{
				var slot = c.value.lookup(this._name);
				if (slot._isValue) 
				{
					c.value = slot.activationValue();
				}
				else
				{
					slot.continuationWith(c.value, locals);
				}
			}
		}
		
		if(this._next)
		{
			c.message = this._next
		}
		else
		{
			c.retValue = c.value;
		}
	}
});