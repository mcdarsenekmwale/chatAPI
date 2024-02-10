const { createClient } = require('redis');
const __ = process.env;
const retry = require('retry');

class AppCache {
        constructor() {
                this.client = createClient();
                // const client = createClient({
                //     password: __.REDISCLOUD_PASSWORD,
                //     socket: {
                //         host: __.REDISCLOUD_SERVER,
                //         port: __.REDISCLOUD_PORT
                //     }
                // });
        }

        // Connect to the Redis server with a retry mechanism if the connection fails
        async connectCache() {
                const operation = retry.operation({ retries: 50, factor: 10, minTimeout: 1000, maxTimeout: 3000 });
                return new Promise((resolve, reject) => {
                        operation.attempt(currentAttempt => {
                                this.client.on('error', err => {
                                        console.error(`Attempt ${currentAttempt} - Error in cache client: ${err}`);
                                        if (operation.retry(err)) {
                                                console.log(`Retrying... (attempt ${currentAttempt + 1})`);
                                        } else {
                                                reject(err);
                                        }
                                });
                                this.redisStatusLog().then((v) => {
                                        resolve(v);
                                }).catch((err) => {
                                        reject(err);
                                });
                        });
                });
        }
                

        connectionStates() {
          return {
                isReady: () => this.client.connected,
                isClosed: () => !this.client.connected,
                close: callback => {
                        this.client.quit(() => {
                                console.log("Connection closed");
                                callback();
                        })
                  },
                };
        }
        
        redisStatusLog() {
                return new Promise((resolve, reject) => {
                        this.client.on('ready', () => {
                                if (__.DEBUG)
                                        console.log('Connected to Redis successfully');
                                resolve();
                        }).on('reconnecting', () => {
                                if (__.DEBUG) console.info('\n<RECONNECTING>');
                        }).on('reconnecting', () => {
                                if (__.DEBUG) console.info('\n<RECONNECTING>');
                        }).on('uncaughtException',  error  => {
                                console.error('\n<UNCAUGHT-EXCEPTION>');
                                console.error(error);
                        }).on('error', err => {
                                console.error(`Error in cache client: ${err}`);
                                reject(err);
                        }).on('end', () => {
                                console.log('Connection closed');
                                resolve();
                        }).connect();
                });
        }
        
        // get the value of a key from the cache
        async getDataFromCache(key) {
                try {
                        return await this.client.get(key);
                } catch (error) {
                        throw new Error(error);
                }
        }
  
        // set the value of a key in the cache with an expiration time
        async setDataInCache(key, data, ttl = __.CACHE_TTL) {
                try {
                        const exp = await this.validateTimestamp(ttl);
                        return await this.client.setEx(key, exp, JSON.stringify(data));
                } catch (e) {
                        console.info(e);
                        throw new Error("Failed to store data in Cache : " + e);
                }
        }
   
        // delete the value associated to the specified key
        async deleteDataFromCache(key) {
                try {
                        return await this.client.del(key);
                } catch (error) {
                        throw new Error(error);
                }
        }

        //validate timestamp parsed
        async validateTimestamp(ttl) {
                let exp = Number();
                        if (!ttl || !isNaN(ttl)) exp  = __.CACHE_TTL;
                else if (typeof ttl === 'string' && !isNaN(parseInt(ttl))) exp = Number(ttl.split('*').reduce((a, b) => a * b));
                
                return exp;
        }

        ////////////////////////////////////////////////////////////////
        //update a key with new value
        async updateDataInCache(key, data) {
                try {
                        const oldValue = await this.getDataFromCache(key);
                
                        if(!oldValue){
                                this.setDataInCache(key, data);
                        }else{
                                await this.deleteDataFromCache(key).then(
                                () => {
                                        this.setDataInCache(key, data)
                                });
                                return `The Key: "${key}" has been updated successfully.`;
                        } 
                } catch (error) {
                        console.error(error);
                        throw new Error(error);
                }
        };

        
        /*
        *   Check if a key exists in the cache
        */
        async isKeyExists(key) {
            return await this.keys().then((resKeys)=> resKeys.includes(key)).catch((e)=> console.error(e));
        }

        ////////////////////////////////////////////////////////////////
        //get all the data associated without no keys
        async getAllDataFromCache() {
                const keys = await this.keys();  
                if (!keys || !keys.length) { 
                        return [];
                } else {
                        const promises = keys.map((key) => this.getDataFromCache(key))
                        return Promise.all(promises).then((values) => { return values });
                }
        }
        
      
        // get only the keys from redis
        async keys(){
           return await this.client.keys('*');
        }
}

// Usage example:
const appCache = new AppCache();
appCache.connectCache()
  .then(() => {
    // Now you can use appCache to perform cache operations
    console.log('Connected to Redis successfully');
  })
  .catch(error => {
    console.error('Failed to connect to Redis:', error);
  });

// Now you can use the 'client' object to interact with Redis.

module.exports = appCache;








