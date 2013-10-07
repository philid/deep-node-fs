if(typeof define !== 'function')
	var define = require('amdefine')(module);

define(["require","./fs"],function (require)
{
	var deep = require("deep");
	deep.store.node = deep.store.node || {};
	deep.store.node.fs = deep.store.node.fs || {};
	deep.store.node.fs.Text = deep.compose.Classes(deep.store.node.fs.FS,
	{
		cachePath:"node.fs.Text::"
	});
	deep.store.node.fs.TEXT.createDefault = function(){
		new deep.store.node.fs.TEXT("text", deep.globals.rootPath, null, { watch:true });
	}
	return deep.store.node.fs.Text;
});
