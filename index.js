function Router (path, ...middleware) {
	var fn = function route (app, path, middleware) {
		var middleware = [...this.middleware, ...middleware]
		var fullPath = this.path + path
		var args = [fullPath, ...middleware]
		o.queue.forEach(function (op) {
			app[op.method].apply(app, op.args)
		})
	}
	fn.queue = []

	fn.path = path
	fn.middleware = middleware

	return new Proxy(fn, {
		get: function (target, name) {
			return function(path, ...middleware) {
				this.queue.push({
					method: name,
					path,
					middleware
				})
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

module.exports = Router
