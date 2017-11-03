function Router (...middleware) {
	var fn = function route (app, path, ...middleware) {
		fn.app = app
		fn.path = path
		fn.middleware = [...fn.middleware, ...middleware]
		for (const op of fn.queue) {
			method.call(fn, op.method, op.path, op.middleware)
		}
	}
	fn.queue = []

	fn.app = null
	fn.middleware = middleware
	fn.route = function (path, ...middleware) {
		var router = middleware.pop()
		router(this, path, middleware)
	}

	return new Proxy(fn, {
		get: function (target, name) {
			if (target.hasOwnProperty(name)) {
				return target[name]
			}
			return function(path, ...middleware) {
				method.call(this, name, path, middleware)
			}
		}
	})
}

Router.extend = function (app) {
	app.route = function (path, ...middleware) {
		var router = middleware.pop()
		router(app, path, ...middleware)
	}
}

function method (method, path, middleware) {
	if (this.app === null) {
		this.queue.push({
			method,
			path,
			middleware
		})
	} else {
		var nestedMiddleware = [...this.middleware, ...middleware]
		var nestedPath = this.path + path
		var args = [nestedPath, ...nestedMiddleware]
		this.app[method].apply(this.app, args)
	}
}

module.exports = Router
