if(typeof define !== 'function')
	var define = require('amdefine')(module);

define(["require","./fs"],function (require)
{
	var deep = require("deep/deep");
	deep.store.node = deep.store.node || {};
	deep.store.node.fs = deep.store.node.fs || {};
	deep.store.node.fs.JSON = deep.compose.Classes(deep.store.node.fs.FS,
	{
		cachePath:"node.fs.json::",
		bodyParser:function(body){
			if(typeof body !== 'string')
				body = JSON.stringify(body);
			return body+'\n';
		},
		responseParser:function(datas){
			if(datas instanceof Buffer)
				datas = datas.toString("utf8");
			//console.log("deep-node-fs/json : datas loaded : ", datas)
			return JSON.parse(datas);
		},
		post:deep.compose.around(function(old){
			return function (content, opt) {
				if(this.schema)
				{
					var report = deep.validate(content, this.schema);
					if(!report.valid)
						return deep.when(deep.errors.PreconditionFail(report));
				}
				return old.call(this, content, opt);
			}
		}),
		put:deep.compose.around(function(old){
			return function (content, opt) {
				if(this.schema)
				{
					var report = deep.validate(content, this.schema);
					if(!report.valid)
						return deep.when(deep.errors.PreconditionFail(report));
				}
				return old.call(this, content, opt);
			}
		}),
		patch:deep.compose.replace(function (content, opt) {
			var options = this.options;
			if(opt)
				options = deep.utils.bottom(this.options, opt);
			if(!options.id && !content.id)
				return deep.errors.Post("node fs json store need id on post");
			var id = options.id || content.id;
			id = options.rootPath+id;
			var def = deep.Deferred(),
				self = this;
			fs.readFile(id, function(err, data){
				if(err)
					return def.reject(deep.errors.Patch("file doesn't exists : please POST in place of PATCH. path : "+id));
				if(data instanceof Buffer)
					data = data.toString("utf8");
				data = JSON.parse(data);
				deep.utils.up(content, data);
				fs.writeFile(id, self.bodyParser(data), function (err) {
					if (err)
						return def.reject(err);
					def.resolve(content);
				});
			});
			return def.promise();
		})
		.around(function(old){
			return function (content, opt) {
				if(this.schema)
				{
					var report = deep.partialValidation(content, this.schema);
					if(!report.valid)
						return deep.when(deep.errors.PreconditionFail(report));
				}
				return old.call(this, content, opt);
			}
		}),
		
	});
	deep.store.node.fs.JSON.createDefault = function(){
		new deep.store.node.fs.JSON("json", deep.globals.rootPath, null, { watch:true });
	}
	return deep.store.node.fs.JSON;

});