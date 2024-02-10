const jwt = require('jsonwebtoken');
const User = require('../models/user');
const crypto = require('crypto');

const __ = process.env;


class Auth {
    constructor() {
        this.auth = new Auth();
        this.payload = {};
        this.authData = {};
        this.apiClient = {};
        this.browserClient = {};
        this.apiKey = __.API_KEY;
        this.secretKey = __.SECRET_KEY;
    }
    /**
     * login the user and generate a token for them to use in their requests  
    *
     * **/
    async login(user = new User({})) {
        try {
            if (!this.authData) throw 'No authentication data provided';

            let response = await user.getByEmail();
            if (!response) throw new Error('No user found with the provided email');

            // check password
            let isValidPassword = await user.validatePassword(user.password, response.password);
            if (!isValidPassword) throw new Error('Incorrect password');

            // create token 
            this.payload = {
                uid: response.uid,
                role: 'user',
                exp: Date.now(), //Number(__.TOKEN_EXPIRATION)*24,
                iat: Date.now()
            };

            return isValidPassword;
           
        } catch (err) {
            console.log("Error in auth.js::login", err);
            throw err;
        }
    }

    //checking the user data and authenticing the user
    async authenticate() {
        try {
            
            if (!this.authData) throw 'No authentication data provided';
            let user = new User({});
            user.email = this.authData.email;
            user.password = this.authData.password;

            if (!user.email || !user.password) throw 'No authentication data provided';
            let isLoggedIn = await this.login(user);
            if (isLoggedIn) {
                this.setAuthData(this.generateAccessToken());
                // Sending back the token to the client 
                delete this.payload.password; 
            }
            return;

        } catch (error) {
            throw new Error(error);
        }
    }


    //register new user
    async register(user = new User({})) {
        try {
            if (!this.authData) throw 'No authentication data provided';
            user.email = this.authData.email;
            user.password = this.authData.password;
            // reauthenticating the user
            await this.authenticate();
        } catch (error) {
            console.log('User not registered:', error);
            throw error;
        }
    }
    

    payloadValidator() {
        try {
            this.payload = jwt.decode(this.apiKey);
            
        } catch (error) {
            throw new Error(error);
        }
        
        if (!this.payload || !this.isValidPayload()) {
            return false;
        } else {
            this.setAuthData();
            return true;
        }
    }

    //generate the token from the payload and store it in memory for later use
    generateAccessToken() {
        try {
            this.secretKey = __.SECRET_KEY;
            let encodedKey = crypto.scryptSync(this.secretKey.toString(), 'salt', 64);
            if (!this.isValidPayload()) throw new Error('Invalid Payload');
            let signature = jwt.sign(this.payload, encodedKey.toString('hex'));
            return signature;
        } catch (error) {
            throw new Error(error);
        }
    }


    //validate the payload by checking all required fields are present
    isValidPayload() {
        try {
            if (
                !(this.payload.iat <= Date.now())
                || !this.payload.uid
                || !this.payload.role
            ) 
                return false;
            
            return true;
        } catch (error) {
            throw new Error(error);
        }
    }

    //generate refresh token with access token and api key
    generateRefreshToken(accessToken) {
        try {

            let secret = crypto.scryptSync(accessToken, 'salt', 32).toString('hex');
            let key = this.createRefreshTokenSecret(secret);
            let refreshToken = jwt.sign({
                uid: this.payload.uid,
                role: this.payload.role,
                secret: secret,
            }, key, { expiresIn: 8860});
            this.apiClient['refresh-token'] = refreshToken;
            this.apiClient['secret-id'] = secret;
            this.payload.secret = secret;

        } catch (error) {
            throw new Error(error);
        }
       
    }

    //creating refresh token secret 
    createRefreshTokenSecret(v) {
        try {
            if(!v) throw new Error('secret version not provided');
            return this.generateSecretKey(v);
            
        } catch (error) {
            throw new Error(error);
        }
    }

    //genereate secret key with access token and api key
    generateSecretKey(accessToken) {
        try {
            const token = `${accessToken}.${crypto.createHash("sha256").update(`${8860}${__.API_KEY}`).digest("hex")}`;
            let secretKey = crypto.createHmac("sha512", __.API_KEY)
            .update(token)
            .digest("hex");
            return secretKey;
        }
        catch (error) {
            throw new Error(error);
        }
    }

    //set the authentication data in memory
    setAuthData(token) {
        try {
            const browserClient = `Bearer ${this.apiKey}`;
            this.browserClient = { browserClient, httpOnly: true };
            this.apiClient = {
                'token-type': 'Bearer',
                'access-token': token,
                'exp': this.payload.exp,
            };

            this.generateRefreshToken(token)
           
        } catch (error) {
            throw new Error(error);
        }
    }

    //validating refresh token and updating authorization details
    verifyIfRefreshTokenValid(data) {
        try {
            if(!data) throw new Error('No refresh token provided');
            let key = this.createRefreshTokenSecret(data.secret);
            jwt.verify(data.refreshToken, key, (err, data) => {
                if (err)
                    throw new Error(err);

                if (data) {
                    this.payload = data;
                    this.setAuthData(
                        this.generateAccessToken()
                    );
                }
            });
        }
        catch (error) {
            throw new Error(error);
        }
    }

    
    
}

module.exports = Auth;