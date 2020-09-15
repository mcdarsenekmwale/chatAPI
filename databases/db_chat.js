var db_connect = require('./connect'),
    CONFIG = require('../utils/constants'),
    async = require('async');
    


/**
   * Creating new chat
   * @param String chat_id 
   * @param String user1 uid
   * @param String user2 uid
   **/
  function create_chat_room(chat, callback) {
    try {
        db_connect.query(`INSERT INTO chats (chat_id, user1_uid, user2_uid) VALUES ($1, $2, $3)`, 
                        [chat.chat_id, chat.user1_uid, chat.user2_uid], 
                        function (err, res) {
            if (err)
                return  callback(err, null);
            if(res.rowCount < 1)
                return callback(null, CONFIG.CHATROOM_CREATE_FAILED);
            return callback(null, CONFIG.CHATROOM_CREATED_SUCCESSFULLY);
        });
    }
    catch (e) {
        return e;
    }
}  

/**
     * Checking for duplicate chat by chat_id
     * @param String chat_id to check in db
     * @return boolean
     */
 async function does_chat_room_exist(chat, callback) {
        try {
            var exist = false;
            return db_connect.query('SELECT * FROM "chats" WHERE chat_id=($1) ', [chat.chat_id], function (err, rows) {
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


/**
 * get a single chat
 * Fetching 
 * @param String  chat_id
 */
async function fetch_chat_room(id, callback){
    try {
        return db_connect.query('SELECT * FROM "chats" WHERE chat_id =$1', [id], function (err, res) {

            if (err)
                return callback(err, null);
            //Adding results to an array
            var result={};
            res.rows.forEach((row) => fromChatJson(row,result));
            return callback(null, result);
        });
    } catch (error) {
        
    }
}

/**
    * Fetching All chatRooms
    * 
    */

async function fetch_all_chat_rooms(callback){
    try {
        return db_connect.query('SELECT * FROM "chats" LIMIT 20', function (err, res) {
            if (err)
                return callback(err, null);
            //Adding results to an array
            var result = {};
            var response = [];
            res.rows.forEach((row) => {
                response.push(fromChatJson(row, result));
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
* Fetching all chat by
* user uid
*/
async function fetch_all_chat_rooms_by_user_uid(uid, callback){
    try {
        db_connect.query('SELECT * FROM chats WHERE user1_uid = ($1) OR user2_uid = ($1)', [uid], function(err, res){
            if(err)
            return callback(err, null);
            //Adding results to an array
            var result = {};
            var response = [];
            res.rows.forEach((row) => {
                response.push(fromChatJson(row, result));
                result = {};
            });
            //Displaying the array in json format 
            return callback(null, response);
        })
    } catch (error) {
        throw error;
    }
}


/**
     * Deleting chat room
     * @param String chat_id to delete
     */
function delete_chat_room(id, callback) {
    try {
        return db_connect.query("DELETE FROM chats WHERE chat_id = $1", [id], function (err, row) {
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

//create chat messages
//for a particular user
//using a chat id for a particular chat room
function create_chat_messages(chatMessage, callback) {
    try {
        db_connect.query(`INSERT INTO chat_messages (id, chat_id, image, message, sender_uid, time)
            VALUES ($1, $2, $3, $4, $5, $6)`, 
            [chatMessage.id, chatMessage.chat_id, chatMessage.image, chatMessage.message,chatMessage.sender_uid, chatMessage.time], 
            function(err, res){
                if (err) return callback(err, null);

                if(res.rowCount < 1)
                return callback(null, CONFIG.CHATMESSAGE_CREATE_FAILED);
                return callback(null, CONFIG.CHATMESSAGE_CREATED_SUCCESSFULLY);

            });
    } catch (error) {
        return error;
    }
}

/**
* Fetching All chat Messages
* By chat id
*/  
function fetch_chat_messages_chat_id(id, callback){
    try {
        db_connect.query('SELECT * FROM chat_messages WHERE chat_id = ($1)',[id], function (err, res){
            if (err) return callback(err, null);
            //Displaying the array in json format 
            return callback(null, res.rows);

        });
    } catch (error) {
        throw error;
    }
}

/**
* Fetching All chat messages
* by user uid
*/ 

function fetch_all_chat_messages_by_user_uid(uid, callback) {
    try {
        db_connect.query('SELECT * FROM chats INNER JOIN chat_messages USING (chat_id) WHERE chats.user1_uid = ($1) OR chats.user2_uid = ($1)',
        [uid], function (err, res){
            if (err) return callback(err, null);
           
            return callback(null, res.rows);
        });
    } catch (error) {
        throw error;
    }
}

//chat message to json
function fromChatUsertoJson(user, row, result) {
    result["chat_id"]   = row.chat_id;
    result["chatUser"]      = user;
    result["image"]     = row.image;
    result["message"]   = row.message;
    result["time"]      = row.time;

    return result;
}

//chat user to json
function fromChatMessagetoJson(user, row, result) {
    result["chat_id"]   = row.chat_id;
    result["other_user"] = user;
    result["message"]   = (row.message.isEmpty)? 'image': row.message;
    result["time"]      = row.time;

    return result;
}

//change to json
function fromChatJson(row, result){
    result["chat_id"]   = row.chat_id;
    result["user1_uid"] = row.user1_uid;
    result["user2_uid"] = row.user2_uid;
    return result;
}

module.exports = {
    createChatRoom : create_chat_room,
    isChatRoomExists : does_chat_room_exist,
    getChatRoom : fetch_chat_room,
    getAllChatRooms : fetch_all_chat_rooms,
    getAllChatRoomsByUId : fetch_all_chat_rooms_by_user_uid,
    deleteRoomRoom : delete_chat_room,
    createChatMessage : create_chat_messages,
    getChatMessageByChatId : fetch_chat_messages_chat_id,
    getChatMessageByUserUid: fetch_all_chat_messages_by_user_uid,
    fromChatMessagetoJson : fromChatMessagetoJson,
    fromChatUsertoJson : fromChatUsertoJson
};