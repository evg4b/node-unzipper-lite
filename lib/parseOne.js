var Stream = require('stream');
var Parse = require('./parse');
var duplexer2 = require('duplexer2');

// Backwards compatibility for node 0.8
if (!Stream.Writable)
  Stream = require('readable-stream');

function parseOne(match) {
  var inStream = Stream.PassThrough({objectMode:true});
  var outStream = Stream.PassThrough();
  var transform = Stream.Transform({objectMode:true});
  var re = match && new RegExp(match);
  var found;

  transform._transform = function(entry,e,cb) {
    if (found || (re && !re.exec(entry.path))) {
      entry.autodrain();
      return cb();
    } else {
      found = true;
      entry.pipe(outStream)
        .on('error',function(err) {
          cb(err);
        })
        .on('finish',function(d) {
          cb(null,d);
        });
    }
  };

  inStream.pipe(Parse())
    .pipe(transform)
    .on('finish',function() {
      outStream.end();
    });

  return duplexer2(inStream,outStream);
}


module.exports = parseOne;