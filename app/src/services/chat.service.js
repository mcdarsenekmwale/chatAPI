var db_connect = require('./connect'),
    CONFIG = require('../utils/constants'),
    StaticFunctions = require('../helper/static_functions'),
    async = require('async');
    

class ChatService{
    constructor() { 
        this.db_connect = db_connect;
    }

        /**
     * Creating new chat
     * @param String chat_id 
     * @param String user1 uid
     * @param String user2 uid
     **/
    async createChatRoom(chatRoom, creator ="Admin") {
        try {
            let response = await db_connect.query(`INSERT INTO chat_rooms (uid, name, description, imageurl, creator, createdat, updatedat ) 
           VALUES ($1, $2, $3, $4, $5, $6, $7)`, 
               [chatRoom.roomId, chatRoom.name, chatRoom.description, chatRoom.imageUrl, creator, chatRoom.createdAt, chatRoom.updatedAt],);
            if (response.rowCount > 0) 
                return response.rows.map(v => this.fromChatJson(v));
            return;
        }
        catch (e) {
            throw new Error(e);
        }
    }  

    /**
         * Checking for duplicate chat by chat_id
         * @param String chat_id to check in db
         * @return boolean
         */
    async isChatRoomExists(chatRoom) {
        try {
            let response = await db_connect.query('SELECT * FROM chat_rooms WHERE uid=($1) ', [chatRoom.roomId],);
            return response.rowCount > 0;
            }
            catch (e) {
               throw new Error(e);
            }
    }

    //checking if a chat room exists
    //with the name and creator as current
    async isChatRoomExistsWithNameAndCreator(chatRoom) {
        try {
            let response = await db_connect.query('SELECT * FROM chat_rooms WHERE (name=($1) AND creator=($2) OR uid=($3)) ',
                [chatRoom.name, chatRoom.creator, chatRoom.roomId],);
            return response.rowCount > 0;
            }
            catch (e) {
               throw new Error(e);
            }
    }

    /**
     * get a single chat
     * Fetching 
     * @param String  chat_id
     */
    async getChatRoom(id){
        try {
            let query = `SELECT c.uid, c.creator, c.name, c.description, c.createdat, r.roomid, r.memberid as userid
            FROM (chat_rooms as c INNER  JOIN room_members as r ON c.uid=r.roomid) WHERE c.uid = ($1)`;
            let response = await db_connect.query(query, [id]);
           
            if (response.rowCount > 0) {
                return this.createRoomList(response.rows, true)[0];
            };
            return;
        } catch (error) {
            throw new Error(error);
        }
    }

    //update the room
    async updateChatRoom(chatRoom) {
        try {
            let query = `UPDATE chat_rooms SET name=$1, description=$2, imageurl=$3, updatedat=$4 WHERE uid=$5`;
            let response = await db_connect.query(query, 
                [chatRoom.name, chatRoom.description, chatRoom.imageUrl, chatRoom.updatedAt, chatRoom.roomId],);
                
            return response.rowCount > 0;
        } catch (error) {
            throw new Error(error);
        }
    }

    /**
        * Fetching All chatRooms
        * 
        */

    async getAllChatRooms(limit, sortBy, order, off){
        try {
            const offset = (off - 1) * limit;
            let query = `SELECT c.uid , c.imageurl, c.name, c.description, c.createdat, r.roomid, r.memberid as userid
            FROM (chat_rooms as c JOIN room_members as r ON c.uid=r.roomid) OFFSET ${offset} LIMIT ${limit}`
            let response = await db_connect.query(query);

            if (response.rowCount > 0) {
                let rooms = this.createRoomList(response.rows);
                let total = rooms.length;
                let _st = StaticFunctions.prototype;
                _st.limit(
                    _st.sortBy(
                        rooms,
                        order,
                        sortBy
                    ),
                    limit
                );

                return {
                    rooms: rooms,
                    total
                };
                
            }
            return;
                  
        } catch (error) {
            throw new Error(error);
        }
    }


    /**
    * Fetching all chat by
    * user uid
    */
    async getAllChatRoomsByUId(uid){
        try {
            let query = `SELECT u.uid as user_Id, u.avatar as user_img , c.name as room_Name, c.description as room_desc,
             u.name  as user_name, r.roomid, c.imageurl as room_imageurl,
             u.description as user_about, c.createdat FROM ((chat_rooms as c INNER  JOIN room_members as r ON c.uid=r.roomid)
            INNER JOIN users as u ON r.memberid = u.uid)
             WHERE u.uid =($1)`;
            let response = await db_connect.query(query, [uid],);
            if (response.rowCount > 0)
                return this.userChatRooms(response.rows);
                //Displaying the array in json format 
            return;
            
        } catch (error) {
            throw error;
        }
    }


    /**
         * Deleting chat room
         * @param String chat_id to delete
         */
    async deleteChatRoom(id) {
        try {
            let response = await db_connect.query("DELETE FROM chat_rooms WHERE uid = $1", [id]);
            return response.rowCount > 0;
        }
        catch (e) {
            throw new Error(e);
        }
    }

    //create chat messages
    //for a particular user
    //using a chat id for a particular chat room
    async createChatMessage(chatMessage) {
        try {
            let response = await db_connect.query(`INSERT INTO chat_messages (id, chat_id, image, message, sender_uid, time)
                VALUES ($1, $2, $3, $4, $5, $6)`, 
                [chatMessage.id, chatMessage.chat_id, chatMessage.image, chatMessage.message, chatMessage.sender_uid, chatMessage.time],);
            
            if (response.rowCount > 0)
                return CONFIG.CHATMESSAGE_CREATED_SUCCESSFULLY;
            return CONFIG.CHATMESSAGE_CREATE_FAILED;

        } catch (error) {
            return error;
        }
    }

    /**
    * Fetching All chat Messages
    * By chat id
    */  
    async getChatMessageByChatId(id, callback){
        try {
            let response = await db_connect.query('SELECT * FROM chat_messages WHERE chat_id = ($1)', [id],);
            if (response.rowCount > 0) 
                return response.rows;
            return ;
        } catch (error) {
            throw error;
        }
    }

    /**
    * Fetching All chat messages
    * by user uid
    */ 

    async getChatMessageByUserUid(uid) {
        try {
            let response = await db_connect.query('SELECT * FROM chat_room INNER JOIN chat_messages ON (chat_rooms.uid == chat_messages.chat_id) INNER JOIN room_members ON (room_members.roomid == chat_rooms.uid) WHERE room_members.memberid = ($1)',
                [uid]);
            if (response.rowCount > 0)
                return response.rows;
            return ;
        } catch (error) {
            throw error;
        }
    }

    //chat message to json
    async fromChatUsertoJson(user, row, result) {
        result["chat_id"]   = row.chat_id;
        result["chatUser"]      = user;
        result["image"]     = row.image;
        result["message"]   = row.message;
        result["time"]      = row.time;

        return result;
    }

    //chat user to json
    async fromChatMessagetoJson(user, row, result) {
        result["chat_id"]   = row.chat_id;
        result["other_user"] = user;
        result["message"]   = (row.message.isEmpty)? 'image': row.message;
        result["time"]      = row.time;

        return result;
    }

    //change to json
    fromChatJson(row){
        return {
            "room_id": row.uid,
            "name": row.name,
            "description": row.description,
            "createdAt": row.createdat,
            
        };
    }

    createRoomList(v, i = false) {
        try {
            const roomMap = new Map();
            for (const room of v) {
                const existingRoom = roomMap.get(room.roomid);
                if (existingRoom) {
                    existingRoom.participants.push(room.userid);
                } else {
                    let _rm = {
                        roomid: room.roomid,
                        name: room.name,
                        description: room.description,
                        imageurl: room.imageurl,
                        creator: room.creator,
                        createdat: room.createdat,
                        participants: [room.userid],
                    };
                    if (!i)
                        delete _rm.creator;
                    
                    roomMap.set(room.roomid, _rm); 
                }
            }
            // Convert the Map values to an array
            return Array.from(roomMap.values());
        } catch (error) {
            throw new Error(error)
        }
          
    }

    userChatRooms(v) {
        try {
            const userRoomMap = new Map();
            for (const row of v) {
                let _rm = {
                        roomid: row.roomid,
                        name: row.room_name,
                        description: row.room_desc,
                        imageurl: row.room_imageurl,
                        createdat: row.createdat,
                }
                
                const existing = userRoomMap.get(row.user_id);
                if (existing) 
                    existing.rooms.push(_rm);
                else 
                    userRoomMap.set(row.user_id,
                    {
                        uid: row.user_id,
                        name: row.user_name,
                        about: row.user_about,
                        avatar: row.user_img,
                        rooms:[_rm]
                    }); 
                
            }
            // Convert the Map values to an array
            return Array.from(userRoomMap.values());
        } catch (error) {
            throw new Error(error)
        }
          
    }

    
}


module.exports = ChatService;