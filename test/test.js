var test = require('tape')
var server = require('diet')
var Router = require('../')

var app = server()
app.listen('http://localhost:7777')
