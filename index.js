var express = require('express')
  , app = express()
  , fs = require('fs')
  , os = require('os')
  , path = require('path')
  , http = require('http').createServer(app)
  , socketIO = require('socket.io')(http)
  , five = require('johnny-five')
  , eth0 = os.networkInterfaces().apcli0
  , brLan = os.networkInterfaces()['br-lan']
  , address = eth0 && eth0.length && eth0[0].address && eth0[0].address.indexOf('::') === -1
      ? eth0[0].address
      : brLan && brLan.length && brLan[0].address
        ? brLan[0].address
        : null
  , PORT = 3030
  , board = new five.Board({
      port: '/dev/ttyS0'
    })
  ;

function emitUserCount(socketIO) {
  socketIO.sockets.emit('user:count', socketIO.engine.clientsCount);
  console.log('Total users: ', socketIO.engine.clientsCount);
}

app.use(express.static(path.join(__dirname + '/public')));

// index route
app.get('/', function (req, res, next) {
  res.sendFile(path.join(__dirname + '/public/index.html'))
});

// board ready event
board.on('ready', function (err) {
  if (err) {
    console.log(err);
    board.reset();
    return;
  }

  function checkForZeroUsers(socketIO) {
    if (socketIO.engine.clientsCount === 0) {
      stop();
    }
  }

  console.log('board connected! Johnny-Five ready to go.')

  // setup motors 
  var motor1 = new five.Motor({
    pins: {
      pwm: 3,
      dir: 5,
      cdir: 6
    }
  })
  , motor2 = new five.Motor({
    pins: {
      pwm: 9,
      dir: 10,
      cdir: 11
    }
  });

  function forward(_speed) {
    var speed = _speed ? _speed : 255;

    motor1.forward(speed);
    motor2.forward(speed);
  }

  function reverse(_speed) {
    var speed = _speed ? _speed : 255;

    motor1.reverse(speed);
    motor2.reverse(speed);
  }

  function spinLeft(_speed) {
    var speed = _speed ? _speed : 255 * .8;

    motor1.forward(speed);
    motor2.reverse(speed);
  }

  function spinRight(_speed) {
    var speed = _speed ? _speed : 255 * .8;

    motor1.reverse(speed);
    motor2.forward(speed);
  }

  function stop() {
    motor1.stop();
    motor2.stop();
  }

  // SocketIO events
  socketIO.on('connection', function (socket) {
    console.log('New connection!');

    emitUserCount(socketIO);

    socket.on('forward', forward);

    socket.on('reverse', reverse);

    socket.on('spinLeft', spinLeft);

    socket.on('spinRight', spinRight);

    // nipplejs variable input events
    socket.on('leftMotor', input => {
      input[direction](input[speed]);
    });

    socket.on('rightMotor', input => {
      input[direction](input[speed]);
    });

    socket.on('stop', stop);

    socket.on('disconnect', function() {
      checkForZeroUsers(socketIO);
      emitUserCount(socketIO);
    });
  });

  // set the app to listen on PORT
  http.listen(PORT);

  // log the address and port
  console.log('Up and running on ' + address + ':' + PORT);
});



