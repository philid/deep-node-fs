if(typeof define !== 'function')
	var define = require('amdefine')(module);

define(["require"],function (require)
{
	var deep = require("deep/deep");
	var fs = require("fs");

	deep.store.node = deep.store.node || {};
	deep.store.node.fs = deep.store.node.fs || {};

	deep.store.node.fs.FS = deep.compose.Classes(deep.Store, 
	function(protocole, rootPath, schema, options){
		this.options = {
			rootPath:rootPath || "",
			watch:false,
			cache:true,
		};
		if(options)
			deep.utils.up(options, this.options);
		this.schema = schema;
		this.watched = {};
	},
	{
		cachePath:"node.fs.FS::",
		watched:null,
		bodyParser:function(body){
			if(typeof body !== 'string')
				body = JSON.stringify(content);
			return body;
		},
		responseParser:function(datas){
			if(datas instanceof Buffer)
				datas = datas.toString("utf8");
			return datas;
		},
		get : function (path, opt) {
			var options = this.options;
			//console.log("node-fs/fs : get : opt ", opt);
			//console.log("node-fs/fs : get : options : ", options);
			if(opt)
				options = deep.utils.bottom(this.options, opt);
			//console.log("node-fs/fs : get : options : ", options);

			path = options.rootPath+path;
			var cacheName = this.cachePath+path;
			//console.log("node-fs/fs : get : ", path, cacheName, deep.mediaCache.cache[cacheName])
			if(options.cache !== false && deep.mediaCache.cache[cacheName])
				return deep.mediaCache.cache[cacheName];
			var def = deep.Deferred(),
				self = this;
			fs.readFile(path, function(err, datas){
				if(err)
					return def.reject(err);
				deep.when(self.responseParser(datas))
				.done(function (datas) {
					def.resolve(datas);
				});
			});
			if(options.watch && !this.watched[path])
				this.watched[path] = fs.watch(path, function (event, filename) {
					switch(event)
					{
						case 'change' :
							fs.readFile(path, function(err, datas){
								var d = null;
								if(err)
									d = deep.when(deep.errors.Watch("Error while reloading file : "+path));
								else
									d = deep.when(self.responseParser(datas));
								deep.mediaCache.manage(d, cacheName);
							});
							break;
						case 'rename' :
							deep.mediaCache.remove(cacheName);
							break;
					}
				});
			var d = def.promise();
			if(options.cache !== false)
				deep.mediaCache.manage(d, cacheName);
			return d;
		},
		post:function (content, opt) {
			var options = this.options;
			if(opt)
				options = deep.utils.bottom(this.options, opt);
			if(!options.id && !content.id)
				return deep.errors.Post("node.fs store need id on post");
			var id = options.id || content.id;
			id = options.rootPath+id;
			var def = deep.Deferred(),
				self = this;
			fs.stat(id, function(err, stat){
				if(!err)
					return def.reject(deep.errors.Post("file already exists : please put in place of post. path : "+id));
				deep.when(self.bodyParser(content))
				.done(function(content){
					fs.writeFile(id, content, function (err) {
						if (err)
							return def.reject(err);
						def.resolve(content);
					});
				});
			});
			return def.promise();
		},
		put:function (content, opt) {
			var options = this.options;
			if(opt)
				options = deep.utils.bottom(this.options, opt);
			if(!options.id && !content.id)
				return deep.errors.Post("node fs json store need id on post");
			var id = options.id || content.id;
			id = options.rootPath+id;
			var def = deep.Deferred(),
				self = this;
			fs.stat(id, function(err, stat){
				if(err)
					return def.reject(deep.errors.Put("file doesn't exists : please post in place of put. path : "+id));
				deep.when(self.bodyParser(content))
				.done(function(content){
					fs.writeFile(id, content, function (err) {
						if (err)
							return def.reject(err);
						def.resolve(content);
					});
				});
			});
			return def.promise();
		},
		patch:function (content, opt) {
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
				deep.when(self.bodyParser(data))
				.done(function(data){
					fs.writeFile(id, self.bodyParser(data), function (err) {
						if (err)
							return def.reject(err);
						def.resolve(data);
					});
				});
			});
			return def.promise();
		},
		del:function(id, opt){
			var options = this.options;
			if(opt)
				options = deep.utils.bottom(this.options, opt);
			var def = deep.Deferred(),
				self = this;
			id = options.rootPath+id;
			fs.stat(id, function(err, stat){
				if(err)
					return def.reject(deep.errors.Delete("file doesn't exists : couldn't delete. path : "+id));
				fs.unlink(id, function (err) {
					if (err)
						return def.reject(err);
					def.resolve(true);
				});
			});
			return def.promise();
		}
	});
	return deep.store.node.fs.FS;

});