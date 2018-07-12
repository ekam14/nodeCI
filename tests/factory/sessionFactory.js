const {Buffer} = require('safe-buffer');
const Keygrip = require('keygrip');
const keys = require('../../config/keys');

module.exports = (user) => {  // argument is a mongoose model
  const sessionObject = {passport:{user:user._id.toString()}};  //_id is a js object .toString() will extract the string out
  const session = Buffer.from(JSON.stringify(sessionObject)).toString('base64');  //session

  const keygrip = new Keygrip([keys.cookieKey]);
  const sig = keygrip.sign("session=" + session);  // session_signature //

  return {session , sig};
};
