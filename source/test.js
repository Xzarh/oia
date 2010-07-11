
require("Oia")

Person = Object:clone();
Person:newSlot("name", "Betrand")
Person:updateSlot("name", "Herbert")

Person:print();

