var db_connect = require('./connect'),
    CONFIG = require('../utils/constants'),
    async = require('async');

class UserService{
    constructor() {
        
    }

    /**
   * Creating new user
   * @param String name 
   * @param String description
   * @param String email unique
   * @param String avatar
   * @param String Primary uid
   **/
    async createUsers(user) {
        try {
            let response = await db_connect.query(`INSERT INTO users (uid, name, username, email, avatar, description, gender, phone, password ) 
                            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, 
                [user.uid, user.name, user.username, user.email, user.avatar, user.about, user.gender, user.phone, user.password],);
            
            if (response.rowCount > 0) 
                return response.rows.map(v => this.fromJson(v, {}));
            return;
        }
        catch (e) {
            
            throw new Error(e);
        }
    }   


    /**
        * Fetching All users
        * 
        */

    async  getAllUsers(limit = 10, off, sortBy, order) {
        try {
            const offset = (off - 1) * limit;
            
            const query = `SELECT * FROM "users" ORDER BY ${sortBy} ${order} OFFSET ${offset} LIMIT ${limit} `;
            const response = await db_connect.query(query);
            
  
            
            var users = [];
            for (let i=0 ; i < Math.min(limit, response.rowCount) ;i++) {
                let item = response.rows[i];
               users.push(this.fromJson(item, {}));
            }
           // console.log("users: ", users);
            return {users : users , total : response.rowCount};

        } catch (error) {
            return new Error(error);
        }
    }


    /**
     * get a single user
     * Fetching 
     * @param String  id of the user
     */
    async  getUser(uid){
        try {
            let res = await db_connect.query('SELECT * FROM "users" WHERE uid =$1', [uid]);
            var result = {};

            if (res.rowCount > 0) {
                res.rows.forEach((row) => this.fromJson(row, result))
            }
            return result;
            
        } catch (error) {
            throw new Error(error);
        }
    }

    //get user by email
    async getUserByEmail(email) {
        try {
            const query = `SELECT * FROM "users" WHERE lower(email)=lower($1)`;
            let res = await db_connect.query(query, [email])
            if (res.rowCount == 0) {
                throw 'user not found';
            } else {
                let data = res.rows[0];
                return {... data, password: data.password} ;
            }
        } catch (error) {
            throw new Error(error);
        }
    }

    /**
         * Updating user details
         * @param String uid of the user to alter
         */
    async  updateUser(uid, user) {
            try {
                const response = await db_connect.query(`UPDATE users SET username =($1), phone=($2), avatar =($3), gender=($4), description=($5), name=($6)
                WHERE uid = ($7)`, [user.username, user.phone, user.avatar, user.gender, user.about, user.name, uid],);
                
                return response.rowCount > 0;
            }
            catch (e) {
                throw new Error(e);
            }
    } 
        
    /**
         * Deleting a user
         * @param String uid of the user to delete
         */
    async  deleteUser(uid) {
        try {
            const response = await db_connect.query("DELETE FROM users WHERE uid = $1", [uid]);
            return response.rowCount > 0;
            }
            catch (e) {
                throw new Error(e);
        }
    }


    //clear database
    async deleteAllUsers() {
        try{
            const response = await db_connect.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
            console.log(`${response.rowCount} rows deleted from table`);
        }catch(err){
            console.log(err);
        }
    }

    /**
         * Checking for duplicate user by email & uid
         * @param String uid to check in db
         * @return boolean
         */
    async  doesUserExist(user) {
            try {
                let isFound = await db_connect.query('SELECT * FROM "users" WHERE email=($1) OR uid =$2', [user.email, user.uid]);
                return isFound.rowCount > 0;
            }
            catch (e) {
                return new Error(e);
        }
    }

    //update password
    async changePassword(uid, password) {
        try {
            let res = await db_connect.query('UPDATE users SET password =($1) WHERE uid = ($2)', [password, uid]);
            return res.rowCount > 0;

        } catch (error) {
            throw new Error(error);
        }  
    }

    //get the user API key from database
    async getUserByApiKey(apikey, uid) {
        try {
            let query = `SELECT * FROM "users" WHERE api_key =$1 AND uid = $2`;
            let res = await db_connect.query(query, [apikey, uid]) ;
         
            if (res.rowCount > 0) 
                return {
                    'key': res.rows[0].api_key,
                    'username': res.rows[0].username,
                    'uid': res.rows[0].uid
                };
                                   
            return;
        } catch (err) {
          console.log("Error: ", err);
          throw new Error(err);
        }
    }


    //change to json
    fromJson(row, result){
        result["uid"]           = row.uid;
        result["name"]          = row.name;
        result["avatar"]        = row.avatar;
        result['username']      = row.username;
        result["description"]   = row.description;
        result['email']         = row.email;
        result['phone']         = row.phone;
        result["gender"]        = row.gender;
        return result;
    }
}


module.exports = UserService;