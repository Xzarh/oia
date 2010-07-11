
False = Object:clone();

function False:ifTrue(f1, f2)
	if(f2) then 
		return f2() 
	end
	return Nil;
end

function False:ifFalse(f1, f2)
	if(f1) then 
		return f1() 
	end
	return Nil;
end

function False:isTrue()
	return False;
end

function False:isFalse()
	return True;
end