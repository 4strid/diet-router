# diet-router
Simple, full featured, nestable router for diet.js

Supports all of diet's HTTP methods (namely get, post, put, patch, delete, and trace)

```javascript
const server = require('diet')
const Router = require('diet-router')

const app = server()
Router.extend(app)

const router = Router()

app.route('/router', router)

router.get('/subroute', function ($) {
	$.end('response')
})

// accessible at /router/subroute
```

Add routes before or after calling `route`. This lets you write your routers in separate files
```javascript
// router1.js
const router = Router()

router.get('/subroute', function ($) {
	$.end('response')
})

module.exports = router
```
```javscript
// main.js
const router1 = require('./router1')

app.route('/route', router1)
```

If you don't want to extend diet's app object, you can skip calling `Router.extend` and call the router directly, passing the `app` object as the first argument
```javascript
const router = Router()
router.get('/subroute', function ($) {
	$.end('response')
})
router(app, '/route')
```

## Middleware ##

The router supports adding middleware to be run before each subroute. You can add it when calling Router or when calling app.route

```javascript
const router = Router()
app.route('/path', function ($) {
	// this is middleware
	$.return()
}, barware, etcware, router)
```

Alternatively: 

```javascript
const router = Router(fooware, barware, etcware)
app.route('/path', router)
```

Note that the router is the *last* argument passed using either method

## Nested Routing ##

The router supports nesting a router within another router

```javascript
const router1 = Router()
const router2 = Router()

app.route('/route', router1)

router1.route('/nested', router2)

router2.get('/subroute', function ($) {
	$.end('response')
})
// accessible at /route/nested/subroute
```

Middleware can be added anywhere along the chain

```javascript
const router1 = Router()
const router2 = Router()

app.route('/route', fooware, router1)

router1.route('/nested', barware, router2)

router2.get('/subroute', bazware, function ($) {
	$.end('response')
})

// runs fooware, then barware, then bazware, and finally the function that returns the response
```

Contact
-------
Bug reports, feature requests, and questions are all welcome. Just open a GitHub issue and I'll
get back to you
