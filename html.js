if(typeof define !== 'function')
	var define = require('amdefine')(module);

define(["require","./fs"],function (require)
{
	var deep = require("deep/deep");
	var fs = require("fs");
	deep.store.node = deep.store.node || {};
	deep.store.node.fs = deep.store.node.fs || {};
	deep.store.node.fs.HTML = deep.compose.Classes(deep.store.node.fs.FS,
	{
		cachePath:"node.fs.HTML::"
	});
	return deep.store.node.fs.HTML;

});
