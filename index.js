function Router (path) {
	var fn = function route (app) {
		o.queue.forEach(function (op) {
			app[op.method].apply(app, op.args)
		})
	}
	fn.queue = []

	return new Proxy(fn, {
		get: function (target, name) {
			var middleware = target.middleware.concat(Array.apply(null, arguments).slice(1))
			var fullPath = target.path + path
			var args = [fullPath].concat(middleware)
			target.queue.push({
				method: method,
				args: args
			})
		}
	})
	if (app === undefined && path === undefined) {
		return DeferredRouter()
	}
	o.path = path
	o.middleware = Array.apply(null, arguments).slice(1)
	return o
}

function DeferredRouter () {
	var o = Object.create(DeferredRouter.prototype)
	o.queue = []
	return o
}

var methodNames = ['get', 'post', 'put', 'patch', 'head', 'delete', 'trace']
var methods = methodNames.map(function (name) {
	return function (path) {
		var middleware = this.middleware.concat(Array.apply(null, arguments).slice(1))
		var fullPath = this.path + path
		var args = [fullPath].concat(middleware)
		this.app[method].apply(null, args)
	}
})

methods.forEach(function (method) {
	Router.prototype[method] = function (path) {
		var middleware = this.middleware.concat(Array.apply(null, arguments).slice(1))
		var fullPath = this.path + path
		var args = [fullPath].concat(middleware)
		this.app[method].apply(null, args)
	}

	DeferredRouter.prototype[method] = function (path) {
	}
})

Router.extend = function (app) {
	app.route
}

module.exports = Router

// add 'route' method to app
// which just wraps Router
