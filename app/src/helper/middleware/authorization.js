const { printResponse, printError, ResponseUtil } = require('../../utils/response');
const UserService = require('../../services/user.service');
const crypto = require('crypto');
const appCache = require('../../../cache');
const User = require('../../models/user');

class AuthorizationMiddleware{

    constructor() {
    
    }

    /**
     * Check if the request has valid APIKey
     * @param {*} params
     * @param {Function} next 
     */
    async userHasValidAPIKey(req, res, next) {
        const apikey = req.header('api-key') || req.header('x-api-key')
            || req.header('api_key') || req.params['api-key'] || req.params['api_key']; // allow empty api key for some endpoints
        // If no API Key is provided in header then return error response
        if (!apikey) {
            return ResponseUtil.unauthorizedResponse(req, res, new Error('Invalid API Key'));
        }
        try {
            let userData = await AuthorizationMiddleware.prototype.apikeyAlreadyExist(apikey, req.user.uid);
            
            if (!userData)
                return ResponseUtil.unauthorizedResponse(req, res, new Error('Invalid API Key'));
            else{
                req.user['data'] = JSON.parse(userData);
                delete req.user['data']['uid'];
                next();
            }
        } catch (error) {
            console.log('Error in authorization middleware : ', error);
            ResponseUtil.serverErrorResponse(res);
        }
    };

    
       /**
     * Middleware to check if user is admin
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    isAdmin(req, res, next) {
        const userRole = req.isAdmin ? 'admin' : req.user.role;
        if (req.isAdmin) req.user.role = userRole;
        if (userRole !== "admin") {
            return ResponseUtil.forbiddenResponse(req, res, new Error('You must be an admin to perform this action.'));
        }
    }

    //validate admin role
    async validateAdminRole(req, res, next) {
        try {
            const isUserAdmin = req.isAdmin; //await UserService.isUserInRoles([req.params.userId], ['admin']);
            if (!isUserAdmin) {
                return ResponseUtil.forbiddenResponse(req, res, new Error("You don't have permission to perform this action"));
            }
            next();
        } catch (err) {
            return ResponseUtil.badRequestResponse(req, res, err);
        }
    }

    /**
     * Middleware to check if the request is has api-key and it's valid or not
     * It will be used for all routes which needs authentication
     */
    async requestHasValidAPIKey(req, res, next) {
        // Get api key from header
        const apiKey = req.header("x-api-key") || req.header('api-key')
            || req.body.api_key || req.query['api_key'] || req.query['X-Api-Key'] || req.params['api_key'];

        // Checking if api key exists
        if (!apiKey) {
            return ResponseUtil.badRequestResponse(res, new Error('Api Key is required, but not provided'));
        }

        try {
            // let result = await db.query(`SELECT id FROM users WHERE api_key=?`, [apiKey]);
            let result = apiKey == process.env.ADMIN_KEY ;
            if(!result){
                req.isAdmin = false;
                req.header['role'] = 'common';
            }else{
                req.isAdmin = true;
                req.header['role'] = 'admin';
            }
            next();
        } catch (error) {
            console.log('Error in AuthMiddleware -> hasValidAPIKey: ', error);
            ResponseUtil.serverError(res, 'Internal Server Error! Please Try Again Later.');
        }
    }

    //check cache if the details already exists
    async apikeyAlreadyExist(apiKey, userId) {
        try {
            let response = await appCache.getDataFromCache(`user_${userId}`);
            if (response) {
                return JSON.parse(response);
            } else {
                let res = await UserService.prototype.getUserByApiKey(apiKey, userId);
                if(res) {
                    await appCache.setDataInCache(`user_${userId}`, JSON.stringify(res));
                } else {
                    throw new Error("No Data Found");
                }
                return res;
            }
        } catch (error) {
            throw new Error(error);
        }
    }
    

    //check if user is account owner or admin
    async validAdminOrOwner(req, res, next) {
        try {
            const userId = req.params.userId || req.params.id;
            const authUserId = req.user.uid; 
            if (!ObjectID.isValid(userId)) return ResponseUtil.badRequestResponse(res, new Error("Invalid User ID."));
            if (!ObjectID.isValid(authUserId)) return ResponseUtil.unauthorizedResponse(req, res, new Error('"You are not logged in!"'));
        
            let userDetails = await AuthorizationMiddleware.prototype.validAccountOwner(userId, authUserId);
            if (userDetails || req.isAdmin) next();
            else return ResponseUtil.forbiddenResponse(req, res, new Error("You are not allowed to perform this operation on this user."))
        }
        catch (error) {
            return ResponseUtil.serverError(res, error);
        }
    }

    //Check if current logged-in user is the account owner of the given usesr id
    async validAccountOwner(userId, authUserId) {
        try {
            let userProfile = await new User({uid:userId}).fetch();
            
            if(!userProfile || !userProfile.uid) return false;
            if (String(userProfile.uid) !== String(authUserId)) return false;
            else return true;
            
        } catch (err) {
            console.log("Error in checking Account Owner", err);
            return false;
        }
    }

}


////////////////////////////////
const ObjectID = {
    isValid: function (id) {
        let check = Boolean();
        if (typeof id === 'string' && id.length >= 24)
            check = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);
        
        return check;
    },
    toHexString: function (id) {
        return id.toString(16);
    },
    fromHexString: function (hexString) {
        return new ObjectID(hexString);
    },
    generate: function () {
        return new ObjectID(ObjectID.toHexString(Math.floor(Math.random() * 0x100000000)));
    },
    
}


module.exports = new AuthorizationMiddleware;