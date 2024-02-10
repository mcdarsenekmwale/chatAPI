const jwt = require('jsonwebtoken');
const Auth = require('../../authentication/auth');
const { printResponse, printError, ResponseUtil } = require('../../utils/response');
const AppCache = require('../../../cache/index');
const crypto = require('crypto');

class AuthenticationMiddleware {

    constructor() {
        
    }

    /**
     * Middleware to check if user is authenticated
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
     isAuthenticated(req, res, next) {
        try {
            let token = req.body.token || req.query.token || req.headers['access-token'] || req.headers['authorization'];
            
            if (!token)
                return ResponseUtil.unauthorizedResponse(req, res, new Error('No token provided.'));
          
            token = token && token.split(' ')[1];
            // verifies secret and checks expiration
            let encodedKey = crypto.scryptSync(process.env.SECRET_KEY, 'salt', 64);
            AuthenticationMiddleware.prototype.validToken(
                req, res,
                token,
                encodedKey.toString('hex'),
                next
            );
           
        } catch (e) {
        
            return printError(res, new Error(err));
        }
    }

 
    //verification of acces token
    validToken(req, res, token, encodedKey, next) {
        try {
            
             jwt.verify(token, encodedKey, async (err, decoded) =>{
                if (err) {
                    return ResponseUtil.unauthorizedResponse(req,res, new Error(`Failed to authenticate token. ${err}` ));
                } else {
                    req.user = decoded;
                    const secretKey = decoded['uid'];
                    if (!secretKey)
                        return ResponseUtil.unauthorizedResponse(req, res, new Error( "Invalid token used please reauthenticate." ));

                    let key = `sk_${secretKey}`;
                    const result = await AuthenticationMiddleware.prototype.getToken(key);
                    
                    if ((!result || result.length == 0) || (result != crypto.scryptSync(token, 'salt', 32).toString('hex')) )
                        return ResponseUtil.unauthorizedResponse(req, res, new Error("Session Expired. Please login again."));
                    else
                        next();
                    
                   
                };
            })
        } catch (error) {
            throw new Error(error);
        }
    }

    //store the refresh token in the redis key value store
    async storeRefreshToken(data) {
        try {
            if (!data) throw new Error("Nothing to store");
            let token = data['refresh-token'];
            let key =  `rtk_${data['secret-id']}`;
           await AppCache.setDataInCache(
                key, JSON.stringify({
                refreshToken: token,
                timeStamp: Date.now() + (5*60*60), //expires after 2 hours
             }));
             
            return true;
        } catch (error) {
            return new Error(error);
        }
    }

    //check if the refresh token is retrieved
    async refreshTokenExists(req, res, next) {
        try {
            const refreshToken = req.body['refresh-token'];
            let secretId = req.body['secret-id'];
            
            if (!refreshToken || !secretId)
                return  ResponseUtil.unauthorizedResponse(req, res, new Error("Missing parameter 'refresh-token' or 'secret-id'"));
            
            let key = `rtk_${secretId}`;

            const result = await AuthenticationMiddleware.prototype.getToken(key);
            if(!result) return ResponseUtil.unauthorizedResponse(req, res, new Error("Invalid Refresh token details provided"));
            if (refreshToken != JSON.parse(result)['refreshToken'])
                throw new Error('Secret ID does not match');

            let isDeleted = await AuthenticationMiddleware.prototype.deleteRefreshToken(key);
            if (!isDeleted) throw new Error("Failed to delete the key");
            next();
            
        }catch(error){
            const err = new Error(error);
            ResponseUtil.unauthorizedResponse(req, res, err);
        }
        
    }

    //retrieve the token from the redis key value store
    async getToken(key) {
        try {
           
            let response = await AppCache.getDataFromCache(key);
            if (!response)
                return ;
           return JSON.parse(response);
        }
        catch (error) {
            throw new Error(error);
        }
    }

    //delete refresh token from the redis key value store
    async deleteRefreshToken(key) {
        return new Promise((resolve, reject) => {
            AppCache.deleteDataFromCache(key).then(
                (v) => resolve(true)).catch((error) => {

                    reject(error);
                });
        });
    }


    //save the currect secret to the redis key value store
    async storeSecret(data) {
        try {
            
            if (!data) throw new Error("Nothing to store");
            let secret = data['secret'];
            let key = `sk_${data['uid']}`;
            let res =  await AppCache.updateDataInCache(
                key, secret.toString()
            );

            return res;
        } catch (error) {
            throw new Error(`Failed to store secret ${error}`);
        }
    }
}


module.exports = new AuthenticationMiddleware;