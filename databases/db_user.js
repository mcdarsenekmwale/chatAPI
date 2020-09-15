var db_connect = require('./connect'),
    CONFIG = require('../utils/constants'),
    async = require('async');

/**
   * Creating new user
   * @param String name 
   * @param String description
   * @param String email unique
   * @param String avatar
   * @param String Primary uid
   **/
  function create_users(user, callback) {
    try {
        db_connect.query(`INSERT INTO users (uid, name, username, email, avatar, description, gender, phone ) 
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, 
                        [user.uid, user.name, user.username, user.email,user.avatar, user.description, user.gender, user.phone], 
                        function (err, res) {
            if (err)
                return  callback(err, null);

            if(res.rowCount < 1)
                return callback(null, CONFIG.USER_CREATE_FAILED);
            return callback(null, CONFIG.USER_CREATED_SUCCESSFULLY);
        });
    }
    catch (e) {
        return e;
    }
}   


/**
    * Fetching All users
    * 
    */

async function fetch_all_users(callback){
    try {
        return db_connect.query('SELECT * FROM "users" LIMIT 20', function (err, res) {
            if (err)
                return callback(err, null);
            //Adding results to an array
            var result = {};
            var response = [];
            res.rows.forEach((row) => {
                response.push(fromJson(row, result));
                result = {};
            });
            //Displaying the array in json format 
            return callback(null, response);
        });      
    } catch (error) {
        return error;
    }
}


/**
 * get a single user
 * Fetching 
 * @param String  id of the user
 */
async function fetch_user(uid, callback){
    try {
        return db_connect.query('SELECT * FROM "users" WHERE uid =$1', [uid], function (err, res) {

            if (err)
                return callback(err, null);
            //Adding results to an array
            var result={};
            res.rows.forEach((row) => fromJson(row,result));
            return callback(null, result);
        });
    } catch (error) {
        
    }
}

/**
     * Updating user details
     * @param String uid of the user to alter
     */
    function update_user(uid, user, callback) {
        try {
            return db_connect.query(`UPDATE users SET username =($1), phone=($2), avatar =($3), gender=($4), description=($5), name=($6)
               WHERE uid = ($7)`, [user.username, user.phone, user.avatar, user.gender, user.description, user.name, uid], 
               function (err, res) {
                if (err)
                    return callback(err, null);
                //Adding results to an array
                
                return callback(null, res.rowCount > 0);
            });
        }
        catch (e) {
            console.error(e);
            return e;
        }
    } 
    
/**
     * Deleting a user
     * @param String uid of the user to delete
     */
function delete_user(uid, callback) {
    try {
        return db_connect.query("DELETE FROM users WHERE uid = $1", [uid], function (err, row) {
                // body...
            if (err)
                return callback(err, null);
            return callback(null, row.affectedRows > 0);
            });
        }
        catch (e) {
            return e;
    }
}

/**
     * Checking for duplicate user by email & uid
     * @param String uid to check in db
     * @return boolean
     */
async function does_user_exist(user, callback) {
        try {
            var exist = false;
            return db_connect.query('SELECT * FROM "users" WHERE email=($1) AND uid =$2', [user.email, user.uid], function (err, rows) {
                // body...
                if (err)
                    return callback(err, null);
                if (rows.rowCount > 0)
                    return callback(null, !exist);
                else
                    return callback(null, exist);
            });
        }
        catch (e) {
            console.log(e);
            return e;
        }
}

//change to json
function fromJson(row, result){
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

module.exports = {
    createUsers: create_users,
    doesUserExist: does_user_exist,
    getAllUsers: fetch_all_users,
    getUser:fetch_user,
    deleteUser: delete_user,
    updateUser: update_user
};