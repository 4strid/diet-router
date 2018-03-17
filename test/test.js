const test = require('tape')
const server = require('diet')
const request = require('request-promise-native')
const Router = require('../')

/*********
 * Setup *
 *********/

const app = server()
app.listen('http://localhost:7777')
Router.extend(app)

function fooware ($) {
	$.foo = 'foo'
	$.return()
}

function barware ($) {
	$.bar = 'bar'
	$.return()
}

function ErrHandler (t) {
	return function (err) {
		t.fail('this test should not throw an error: ' + err.message)
		t.end()
	}
}

/*********
 * Tests *
 *********/

test('Expect to be able to console.log a router without breaking everything', function (t) {
	try {
		const router = Router()
		console.log(router)
		router.get('/', function ($) {
			$.end('test success')
		})
		app.route('/test0', router)
		t.pass('yes')
		t.end()
	} catch (err) {
		ErrHandler(t)(err)
	}
})

test('Expect router to add an accessible route when the router is called directly and when methods are called before the router', function (t) {
	const router = Router()
	router.get('/', function ($) {
		$.end('test success')
	})
	router(app, '/test1')

	request('http://localhost:7777/test1/')
	.then(function (res) {
		t.equal(res, 'test success', 'got the expected response')
		t.end()
	})
	.catch(ErrHandler(t))
})


test('Expect router to add an accessible route when the router is called directly and when the router is called before methods', function (t) {
	const router = Router()
	router(app, '/test2')
	router.get('/', function ($) {
		$.end('test success')
	})

	request('http://localhost:7777/test2/')
	.then(function (body) {
		t.equal(body, 'test success', 'got the expected response')
		t.end()
	})
	.catch(ErrHandler(t))
})

test('Expect router to add an accessible route when the router is invoked by "route" and when methods are called before "route"', function (t) {
	const router = Router()
	router.get('/', function ($) {
		$.end('test success')
	})
	app.route('/test3', router)

	request('http://localhost:7777/test3/')
	.then(function (body) {
		t.equal(body, 'test success', 'got the expected response')
		t.end()
	})
	.catch(ErrHandler(t))
})

test('Expect router to add an accessible route when the router is invoked by "route" and when the router is called before methods', function (t) {
	const router = Router()
	app.route('/test4', router)
	router.get('/', function ($) {
		$.end('test success')
	})

	request('http://localhost:7777/test4/')
	.then(function (body) {
		t.equal(body, 'test success', 'got the expected response')
		t.end()
	})
	.catch(ErrHandler(t))
})

test('Expect router to add routes when methods are added before and after calling the router', function (t) {
	const router = Router()
	router.get('/1', function ($) {
		$.end('test success 1')
	})
	router(app, '/test5')
	router.get('/2', function ($) {
		$.end('test success 2')
	})

	request('http://localhost:7777/test5/1')
	.then(function (body) {
		t.equal(body, 'test success 1', 'got the expected response')
		return request('http://localhost:7777/test5/2')
	})
	.then(function (body) {
		t.equal(body, 'test success 2', 'got the expected response')
		t.end()
	})
	.catch(ErrHandler(t))
})

test('Expect router to add routes when methods are added before and after calling "route"', function (t) {
	const router = Router()
	router.get('/1', function ($) {
		$.end('test success 1')
	})
	app.route('/test6', router)
	router.get('/2', function ($) {
		$.end('test success 2')
	})

	request('http://localhost:7777/test6/1')
	.then(function (body) {
		t.equal(body, 'test success 1', 'got the expected response')
		return request('http://localhost:7777/test6/2')
	})
	.then(function (body) {
		t.equal(body, 'test success 2', 'got the expected response')
		t.end()
	})
	.catch(ErrHandler(t))
})

test('Expect router to add routes when methods are added before and after calling "route"', function (t) {
	const router = Router()
	router.get('/1', function ($) {
		$.end('test success 1')
	})
	app.route('/test6', router)
	router.get('/2', function ($) {
		$.end('test success 2')
	})

	request('http://localhost:7777/test6/1')
	.then(function (body) {
		t.equal(body, 'test success 1', 'got the expected response')
		return request('http://localhost:7777/test6/2')
	})
	.then(function (body) {
		t.equal(body, 'test success 2', 'got the expected response')
		t.end()
	})
	.catch(ErrHandler(t))
})

test('Expect router to add middleware to the chain from the Router constructor', function (t) {
	const router = Router(fooware)
	router.get('/', function ($) {
		$.end($.foo)
	})
	app.route('/test7', router)

	request('http://localhost:7777/test7/')
	.then(function (body) {
		t.equal(body, 'foo', 'the middleware was run. got the expected response')
		t.end()
	})
	.catch(ErrHandler(t))
})

test('Expect router to add middleware to the chain from the call to "route"', function (t) {
	const router = Router()
	router.get('/', function ($) {
		$.end($.foo)
	})
	app.route('/test7', fooware, router)

	request('http://localhost:7777/test7/')
	.then(function (body) {
		t.equal(body, 'foo', 'the middleware was run. got the expected response')
		t.end()
	})
	.catch(ErrHandler(t))
})

test('Expect router to add middleware to the chain from both potential sources', function (t) {
	const router = Router(fooware)
	router.get('/', function ($) {
		$.end($.foo + $.bar)
	})
	app.route('/test8', barware, router)

	request('http://localhost:7777/test8/')
	.then(function (body) {
		t.equal(body, 'foobar', 'the middleware was run. got the expected response')
		t.end()
	})
	.catch(ErrHandler(t))
})

test('Expect router to add accessible route when using a nested router with the "route" method', function (t) {
	const router1 = Router()
	const router2 = Router()
	router2.get('/2', function ($) {
		$.end('test success')
	})
	router1.route('/1', router2)
	app.route('/test9', router1)

	request('http://localhost:7777/test9/1/2')
	.then(function (body) {
		t.equal(body, 'test success', 'got the expected response')
		t.end()
	})
	.catch(ErrHandler(t))
})

test('Expect router to add accessible route when using a nested router by calling the nested router', function (t) {
	const router1 = Router()
	const router2 = Router()
	router2.get('/2', function ($) {
		$.end('test success')
	})

	router2(router1, '/1')
	
	app.route('/test10', router1)

	request('http://localhost:7777/test10/1/2')
	.then(function (body) {
		t.equal(body, 'test success', 'got the expected response')
		t.end()
	})
	.catch(ErrHandler(t))
})

test('Expect router to add middleware to the chain when using a nested router', function (t) {
	const router1 = Router()
	const router2 = Router()
	router2.get('/', function ($) {
		$.end($.foo + $.bar)
	})

	router1.route('/1', fooware, router2)
	
	app.route('/test11', barware, router1)

	request('http://localhost:7777/test11/1/')
	.then(function (body) {
		t.equal(body, 'foobar', 'the middleware was run. got the expected response')
		t.end()
	})
	.catch(ErrHandler(t))
})

test.onFinish(function () {
	process.exit(0)
})
