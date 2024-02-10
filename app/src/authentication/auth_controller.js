const Auth = require('./auth');
const { printResponse, printError, ResponseUtil } = require('../utils/response');
const AuthenticationMiddleware = require('../helper/middleware/authentication');
const User = require('../models/user');

class AuthController{
    constructor() {
        this.AuthController = new AuthController();
    }

    /**
     * Login user with password and email
     * @param {*} params Parameters
     * req
     * res
     * next
     */

    async loginUser(req, res, next) {
        try {
            const { email, password } = req.body;
            if (!email || !password) throw 'Email or Password is missing';
            const auth = Auth.prototype;
            auth.authData = { email, password };
            await auth.authenticate();
            await AuthController.prototype.tokenHandler(auth);
            return ResponseUtil.printJSON(req, res, 200, { response: auth.apiClient });
        } catch (err) {
            console.log(err);
            return ResponseUtil.serverError(res, err); 
        }
    }


    //register new user
    async addNewUser(req, res, next) {
        try {
            const { email, password } = req.body;
            if (!email || !password) throw 'Email or Password is missing';
            
            let user = new User(req.body);
            let response = await user.save();
            if(response){
                const auth = Auth.prototype;
                auth.authData = { email, password };
                await auth.register();
                await AuthController.prototype.tokenHandler(auth);
                return ResponseUtil.printJSON(req, res, 201, { response: auth.apiClient });
            }
        } catch (error) {
            throw new Error("An error occured while adding a new User");
        }
    }


    //refresh token storge handler
    async refreshTokenHandler(data) {
        try {
           
            if (!data)
                throw new Error("Failed to authenticate user");
             let _authStore = await AuthenticationMiddleware.storeRefreshToken(data);
            if (!_authStore)
                throw new Error('Failed storing the Token');
        }
        catch (error) {
            const err = new Error(error);
            throw err;
        }
    }

    //use refreshToken to get new tokens
    async refreshToken(req, res, next) {
        try {
            const refreshToken  = req.body['refresh-token'];
            if (!refreshToken) throw 'Refresh Token is missing';
            //get access token from headers
            let accessToken = req.headers['x-access-token'] || req.headers['authorization'];
            if (!accessToken) throw 'Access Token is missing';

            let secretId = req.body['secret-id'];
            if (!secretId) throw 'Secret Id is missing';

            let auth = Auth.prototype;
            auth.verifyIfRefreshTokenValid({
                secret: secretId,
                refreshToken: refreshToken
            });
            
            await AuthController.prototype.tokenHandler(auth);
            return ResponseUtil.printJSON(req, res, 200, { response: auth.apiClient });
            
        } catch (error) {
            const err = new Error(error);
            ResponseUtil.unauthorizedResponse(req, res, err); 
        }
    }        


    /***
     * Token handler 
     */
    async tokenHandler(auth) {
        await AuthController.prototype.refreshTokenHandler(auth.apiClient);
        await AuthenticationMiddleware.storeSecret(auth.payload);
    }

    /**
     * Logout the current logged in user
     * @param {Object} req Express request object
     * @param {Object} res Express response object
     * @returns {void}
     */
    logoutUser(req, res) {
        // TODO: Implement JWT based authentication for session management
        try {
            
        } catch (error) {
            return printError(res, new Error({message: `SERVER_ERROR ${error.message}`}));
        }
        const token = req.headers['x-access-token'] || req.headers['authorization'];
        if (!token) {
            return ResponseUtil.printJSON(res, 403, { message: 'No token provided!' });
        } else {
            let parts = token.split(' ')
            if (parts.length != 2) {
                return ResponseUtil.printJSON(res, 403, { error: 'Token malformed.' })
            } else if (parts[0] !== 'Bearer') {
                return ResponseUtil.printJSON(res, 403, { error: 'Token malformed.' })
            } 
        }
        // Remove the jwt property from the user's session object and send a success response
        delete req.session.jwt;
        return ResponseUtil.printJSON(res, 200, { status: 'Logged out' });
    }
           
    
}

module.exports = AuthController;