if(typeof define !== 'function')
	var define = require('amdefine')(module);

define(["require","./fs"],function (require)
{
	var deep = require("deep");
	deep.store.node = deep.store.node || {};
	deep.store.node.fs = deep.store.node.fs || {};
	deep.store.node.fs.HTML = deep.compose.Classes(deep.store.node.fs.FS,
	{
		cachePath:"node.fs.HTML::"
	});
	deep.store.node.fs.HTML.createDefault = function(){
		new deep.store.node.fs.HTML("html", deep.globals.rootPath, null, { watch:true });
	}
	return deep.store.node.fs.HTML;

});
