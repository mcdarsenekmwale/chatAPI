const ChatService = require('./chat.service');
var db_connect = require('./connect'),
    CONFIG = require('../utils/constants'),
    StaticFunctions = require('../helper/static_functions'),
    async = require('async');

class RoomService{
    constructor() { 
        this.db_connect = db_connect;
    }


    //adding room owner
    async addRoomOwner(roomOwner) {
        try {
            let response = await db_connect.query('INSERT INTO room_owners (roomid, ownerid, createdat) VALUES ($1, $2, $3) ',
                [roomOwner.roomId, roomOwner.ownerId, roomOwner.createdAt]);
            return (response.rowCount > 0) 
          
        } catch (error) {
            
            throw error;
        }
    }

    //delete this owner from the room
    async deleteRoomOwner(roomOwner) {
        try {
            let response = await db_connect.query('DELETE FROM room_owners WHERE roomid = ($1) AND ownerid = ($2) ',
                [roomOwner.roomId, roomOwner.ownerId]);
            return (response.rowCount > 0) 
             
        } catch (error) {
            throw error;
        }
    }

    //update room ownership
    async updateRoomOwner(roomOwner, newOwner) {
        try {
            let response = await db_connect.query('UPDATE room_owners SET ownerid = ($1) WHERE roomid = ($2) AND ownerid =($3) ',
                [newOwner, roomOwner.roomId, roomOwner.ownerId]);
            if (response.rowCount > 0) 
                return response.rows[0];
            return ;
        } catch (error) {
            throw error;
        }
    }

    //get the room that is currently owned by this user
    async getRoomsByOwner(ownerId) {
        try {
            let query =  `SELECT u.uid as user_Id, u.avatar as user_img , c.name as room_Name, c.description as room_desc,
             u.name  as user_name, r.roomid, c.imageurl as room_imageurl,
             u.description as user_about, c.createdat FROM ((chat_rooms as c INNER  JOIN room_owners as r ON c.uid=r.roomid)
            INNER JOIN users as u ON r.ownerid = u.uid)
             WHERE u.uid =($1)`;
            let response = await db_connect.query(query,
                [ownerId]);
            
            if (response.rowCount > 0) 
                return ChatService.prototype.userChatRooms(response.rows);
            
            return [];
        } catch (error) {
            throw error;
        }
    }

    //get the owners of a room
    async getOwnersByRoomId(roomId) {
        try {
            let query = `SELECT c.uid, c.creator, c.name, c.description, c.createdat, r.roomid, r.ownerid as userid
            FROM (chat_rooms as c INNER  JOIN room_owners as r ON c.uid=r.roomid) WHERE c.uid = ($1)`;
            const response = await db_connect.query(query, [roomId])

            if (response.rowCount > 0) { 
                let data = ChatService.prototype.createRoomList(response.rows, true)[0];
                data = { ...data, owners: data.participants };
                delete data.participants;
                return data;
                 
            }
            return;
        } catch (err) {
            console.log("Error in getting owner list: ", err);
            return undefined;
        }
    }

    //checking is room available
    async isRoomAvailable(roomId) {
        try {
            let query = `SELECT * FROM chat_rooms WHERE uid = ($1) `;
            let response = await db_connect.query(query,
                [roomId]);
            return response.rowCount > 0;
        } catch (error) {
            throw error;
        }
    }

    //room and owner already exist
    async isRoomOwnerExists(roomOwner) {
        try {
            let query = `SELECT * FROM room_owners WHERE ownerid = ($1) AND roomid = ($2) `;
            let response = await db_connect.query(query,
                [roomOwner.ownerId, roomOwner.roomId]);
            return response.rowCount > 0;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    //check member exists
    async isRoomMemberExists(member) {
        try {
            let query = `SELECT * FROM room_members WHERE roomid = ($1) AND memberid = ($2) `;
            let response = await db_connect.query(query,
                [member.roomId, member.memberId]);
            
            return response.rowCount > 0;
        } catch (error) {
            throw error;
        }
    }

      //adding members to the room
    async addRoomMembers(roomMembers) {
        try {
            let response = await db_connect.query(`INSERT INTO room_members (roomid, memberid, createdat ) VALUES ($1, $2, $3)`, 
                [roomMembers.roomId, roomMembers.memberId, roomMembers.createdAt],);
            
            return response.rowCount > 0;
        }
        catch (e) {
            throw new Error(e);
        }
    }

    //remove member from chat room
    async deleteRoomMembers(roomMembers) {
        try {
            let response = await db_connect.query(`DELETE FROM room_members WHERE roomid = ($1) AND memberid = ($2) `,
                [roomMembers.roomId, roomMembers.memberId]);
            return response.rowCount > 0;
        }
        catch (e) {
            throw new Error(e);
        }
    }

}

 
module.exports =  RoomService;