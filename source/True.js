
True = Object:clone();

function True:ifTrue(f1, f2)
	return f1();
end

function True:ifFalse(f1, f2)
	if(f2) then 
		return f2() 
	end
	return Nil;
end

function True:isTrue()
	return True;
end

function True:isFalse()
	return False;
end