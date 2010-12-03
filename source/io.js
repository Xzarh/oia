//sys = require('sys')
require("../lib/lib");
require("./IoObject");
require("./IoBlock");
require("./IoString");
require("./IoNumber");
require("./IoMessage");
require("./IoLexer");
require("./IoLobby");
require("./IoWrapper");

var sys = require('sys');
var args = process.argv;
args.shift();
args.shift();

var sourcePath = args.shift();

/*
var v = 1;
v["+"] = function (a) { return this + a; }
writeln(Object_slotNames(v));
writeln(v["+"](1));
//writeln(Object_slotNames(Number));
//var v = "hello"
//writeln(Object_slotNames(v));

//var m = IoLexer.setS('"hello" +("world") toNumber').lex().parse();
//var m = IoLexer.setS("a b(c, d); 1.3 +(4.5)").lex().parse();
//var m = IoLexer.setS('"hello world " ..(1 +(2) +(3))').lex().parse();
//var m = IoLexer.setS('block(1)').lex().parse();
*/
	
try 
{
	var code = File.clone().setPath(sourcePath).contents();
	var lexer = IoLexer.setS(code).lex().parse();

	lexer.show();
	
	writeln("\neval:");
	var r = lexer.eval();
	//writeln("  >", r.asString());
	writeln("  >" + r._value);
	writeln("");
}
catch(err)
{
	writeln("Exception ", err)
	return
}

/*
//var m = IoLexer.setS("IoLobby").lex().parse();
var t1 = new Date().getTime();
var max = 1000000;
for(var i = 0; i < max; i ++)
{
	m.perf(IoLobby, IoLobby);
}
var t2 = new Date().getTime();
var dt = (t2 - t1)/1000;
writeln("  " + Math.floor(max/dt) + " sends/second\n");
*/

