String.prototype.setSlotsIfAbsent(
{
	cssString: function() 
	{ 
		return this;
	},

	replaceSeq: function(a, b)
	{
		var s = this;
		var newString;

		if(b.contains(a)) throw new Error("substring contains replace string");

		while(true)
		{
			var newString = s.replace(a, b)
			if(newString == s) return newString;;
			s = newString;
		}

		return this;
	},

	repeated: function(times)
	{
		var result = "";
		var aString = this;
		times.repeat(function(){ result += aString });
		return result
	},

	isEmpty: function()
	{
		return this.length == 0;
	},

	beginsWith: function(prefix)
	{
		if(!prefix) return false;
		return this.indexOf(prefix) == 0;
	},

	removePrefix: function(prefix)
	{
		return this.substring(this.beginsWith(prefix) ? prefix.length : 0);
	},

	endsWith: function(suffix)
	{
		var index = this.lastIndexOf(suffix);
		return (index > -1) && (this.lastIndexOf(suffix) == this.length - suffix.length);
	},

	removeSuffix: function(suffix)
	{
		if(this.endsWith(suffix))
		{
			return this.substr(0, this.length - suffix.length);
		}
		else
		{
			return this;
		}
	},
	
	withFirstCharRemoved: function()
	{
		return this.slice(1);
	},

	trim: function()
	{
		return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
	},

	hostName: function()
	{
		var result = this.removePrefix("http://");
		return result.slice(0, result.indexOf("/"));
	},

	contains: function(aString)
	{
		return this.indexOf(aString) > -1;
	},
	
	containsChar: function(c)
	{
		var i;
		
		for (i = 0; i < this.size(); i++)
		{
			if (this[i] == c)
			{
				return true;
			}
		}
		
		return false;
	},

	before: function(aString)
	{
		var index = this.indexOf(aString);
		if(index == -1) return this;
		return this.slice(0, index); 
	},
	
	beforeLast: function(aString)
	{
		return this.reverse().after(aString).reverse();
	},

	after: function(aString)
	{
		var index = this.indexOf(aString);
		if(index == -1) return null;
		return this.slice(index + aString.length);
	},
	
	/*
	afterIndexWithLength: function(index, len)
	{
		if (len == null) len = this.length
		if (index == -1) return null;
		return this.slice(index, aString.length);
	},
	*/

	asUncapitalized: function()
	{
		return this.slice(0, 1).toLowerCase() + this.slice(1);
	},

	asCapitalized: function()
	{
		return this.slice(0, 1).toUpperCase() + this.slice(1);
	},

	containsCapitals: function()
	{
		return this.search(/[A-Z]/g) > -1;
	},

	charAt: function(i)
	{
		return this.slice(i, i + 1);
	},

	first: function()
	{
		return this.slice(0, 1);
	},

	asNumber: function()
	{
		return Number(this);
	},

	stringCount: function(str)
	{
		return this.split(str).length - 1;
	},
	
	append: function(aString)
	{
		return this + aString;
	},
	
	prepend: function(aString)
	{
		return aString + this;
	},

	strip: function() {
    	return this.trim();
  	},

	size: function()
	{
		return this.length;
	},
	
	reverse: function()
	{
		return this.split("").reverse().join("");
	},
	
	alignRight: function(length, padding)
	{
		return this.prepend(padding.repeated(length - this.size()).slice(0, length));
	}
});