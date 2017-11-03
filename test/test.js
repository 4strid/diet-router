var test = require('tape')
var server = require('diet')
var request = require('request-promise-native')
var Router = require('../')

/*********
 * Setup *
 *********/

var app = server()
app.listen('http://localhost:7777')
Router.extend(app)

function fooware ($) {
	$.foo = 'foo'
	$.return
}

function barware ($) {
	$.bar = 'bar'
	$.return
}

function bazware ($) {
	$.baz = 'baz'
	$.return
}

/*********
 * Tests *
 *********/

test('Expect router to add an accessible route when the router is called directly and when methods are called before the router', function (t) {
	var router = Router()
	router.get('/', function ($) {
		$.end('test success')
	})
	router(app, '/test1')

	request('http://localhost:7777/test1/')
	.then(function (res) {
		t.equal(res, 'test success', 'got the expected response')
		t.end()
	})
	.catch(function (err) {
		t.fail('this test should not throw an error: ' + err.message)
		t.end()
	})
})


test('Expect router to add an accessible route when the router is called directly and when the router is called before methods', function (t) {
	var router = Router()
	router(app, '/test2')
	router.get('/', function ($) {
		$.end('test success')
	})

	request('http://localhost:7777/test2/')
	.then(function (body) {
		t.equal(body, 'test success', 'got the expected response')
		t.end()
	})
	.catch(function (err) {
		t.fail('this test should not throw an error: ' + err.message)
		t.end()
	})
})

test('Expect router to add an accessible route when the router is invoked by "route" and when methods are called before "route"', function (t) {
	var router = Router()
	router.get('/', function ($) {
		$.end('test success')
	})
	app.route('/test3', router)

	request('http://localhost:7777/test3/')
	.then(function (body) {
		t.equal(body, 'test success', 'got the expected response')
		t.end()
	})
	.catch(function (err) {
		t.fail('this test should not throw an error: ' + err.message)
		t.end()
	})
})

test('Expect router to add an accessible route when the router is invoked by "route" and when the router is called before methods', function (t) {
	var router = Router()
	app.route('/test4', router)
	router.get('/', function ($) {
		$.end('test success')
	})

	request('http://localhost:7777/test4/')
	.then(function (body) {
		t.equal(body, 'test success', 'got the expected response')
		t.end()
	})
	.catch(function (err) {
		t.fail('this test should not throw an error: ' + err.message)
		t.end()
	})
})

test('Expect router to add routes when methods are added before and after calling the router', function (t) {
	var router = Router()
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
	.catch(function (err) {
		t.fail('this test should not throw an error: ' + err.message)
		t.end()
	})
})

test('Expect router to add routes when methods are added before and after calling "route"', function (t) {
	var router = Router()
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
	.catch(function (err) {
		t.fail('this test should not throw an error: ' + err.message)
		t.end()
	})
})

test('Expect router to add routes when methods are added before and after calling "route"', function (t) {
	var router = Router()
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
	.catch(function (err) {
		t.fail('this test should not throw an error: ' + err.message)
		t.end()
	})
})

test.onFinish(function () {
	process.exit(0)
})
