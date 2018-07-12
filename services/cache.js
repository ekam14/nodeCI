const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');
const keys = require('../config/keys');

const client = redis.createClient(keys.redisUrl);
client.hget = util.promisify(client.hget);  // now client.get function will return promise instead of callbacks //
const exec = mongoose.Query.prototype.exec;    // can manipulate the exec function of the query //


mongoose.Query.prototype.cache = function(options = {}) {   // custom function for the query //
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key || '');   // hash key for nested redis //

  return this;   // will allow chaining //
};

mongoose.Query.prototype.exec = async function(){
  //console.log('QUERY IS ABOUT TO RUN');
  if(!this.useCache){
    return exec.apply(this,arguments);   // run the original function i.e execute the query//
  }
  const key = JSON.stringify(    /* making a new redis key  */
    Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name    // used to get the collection name //
    })
  );

  // See if we have a value for 'key' in redis
  const cacheValue = await client.hget(this.hashKey, key);    // value for the corresponding key //

  // If we do then return that
  if(cacheValue){   // if present in redis //
    const doc = JSON.parse(cacheValue);

    return Array.isArray(doc)      // reason for this is that we want to return a model instance //
    ?  doc.map(d => new this.model(d))   // will create a new model document from the argument provided//
    : new this.model(doc);
  }

  //Otherwise,issue the query and store the result

  const result = await exec.apply(this,arguments);  // execute the orginal function i.e the query//

  client.hset(this.hashKey, key, JSON.stringify(result));   // result is in instance model form //

  return result;
};


module.exports = {
  clearHash(hashKey){  // for clearing all redis as it is a costly affair //
    client.del(JSON.stringify(hashKey));
  }
};
