
dofile("Oia.lua")

Person = Object:clone();
Person:newSlot("name", "Betrand")
Person:updateSlot("name", "Herbert")

--Person:name();
Person:print();

--foo = { a: 123};