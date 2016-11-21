# Evented Debouncer

Reduce the rate of events per time unit. Similar to [lodash's debounce](https://lodash.com/docs/4.17.2#debounce), except it uses events instead of functions.

```
npm install --save evented-debouncer 
```

Very simple class, no dependencies.

### Example

##### Before:

Imagine a socket-io situation, where we are sending clients stat updates. Unfortunately, we are getting many updates, so our clients are flooded with events.

*(server)*
```javascript
function notifyStatsUpdated(newStats) {
	socket.send('stats', newStats);
}
```

*(client)*
```javascript
var startedAt = new Date();
socket.on('stats', function (stats) {
	console.log(new Date() - startedAt);
});

// 1000
// 11000
// 21000
// 27000
// 32000
// 35000
```

##### After:

By adding a debouncer, we can reduce the number of events sent to clients.

*(server)*
```javascript
var Debouncer = require('evented-debouncer');

// 15 seconds between events
var debouncer = new Debouncer(15 * 1000);

function notifyStatsUpdated(newStats) {
	debouncer.submit('stats', newStats);
}

debouncer.on('stats', function (newStats) {
	socket.send('stats', newStats);
});
```

Debouncer will always give you the most recent data on the other side. Also it will emit eagerly, so you get an event immediately, then wait 15 seconds.

*(client)*
```javascript
var startedAt = new Date();
socket.on('stats', function (stats) {
	console.log(new Date() - startedAt);
});

// 1000
// 21000
// 32000
```

Clients get at most 1 event every 15 seconds. Much better.

### API

```
new Debouncer(options)
```

#### Options

##### `default_wait`

If you don't specify `wait` when calling submit(). this is how long will it be between events (ms).

#### Methods

##### `submit(name, wait, data)`

Submit event with `name` and `data`. To be emitted after `wait` milliseconds. If you leave out `wait`, we use the default.

##### `trigger(name)`

Trigger any pending event with `name` to be emitted immediately.

##### `clear()`

Remove all pending state from the Debouncer. No emits.

##### `flush()`

Same as `clear()`, except pending events are emitted.

#### Events

##### `data(name, data)`

This is emitted for every `name`-ed event.

##### `[name](data)`

We also emit with the exact name you give `submit()`

### Licence

MIT