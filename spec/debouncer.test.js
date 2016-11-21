var expect = require('chai').expect;

var Debouncer = require('../lib/debouncer');

describe('debouncer', function () {
	it('will push events through respecting wait', function (done) {
		var d = new Debouncer(100);
		
		var events = [];
		
		d.on('test', function (data) {
			events.push(data);
		});
		
		d.submit('test', 1);
		d.submit('test', 2);
		d.submit('test', 3);
		
		expect(events.length).to.equal(1);
		
		setTimeout(function () {
			expect(events.length).to.equal(2);
			expect(events[0]).to.equal(1);
			expect(events[1]).to.equal(3);
			d.submit('test', 4);
			d.submit('test', 5);
			expect(events.length).to.equal(3);
			expect(events[2]).to.equal(4);
		}, 300);
		
		setTimeout(function () {
			expect(events.length).to.equal(4);
			expect(events[3]).to.equal(5);
			done();
		}, 600);
	});
	
	it('will respect custom wait', function (done) {
		var d = new Debouncer(1);
		
		var events = [];
		
		d.on('test', function (data) {
			events.push(data);
		});
		
		d.submit('test', 1, 1);
		d.submit('test', 10, 2);
		d.submit('test', 1000, 3);
		
		setTimeout(function () {
			expect(events.length).to.equal(2);
			expect(events[0]).to.equal(1);
			expect(events[1]).to.equal(3);
			done();
		}, 50);
	});
});