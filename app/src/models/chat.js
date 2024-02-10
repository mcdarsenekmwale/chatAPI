
const { v4: uuidv4 } = require('uuid');
const ChatService = require('../services/chat.service');
const RoomService = require('../services/rooms.service');


//create chat room class

class ChatRoom{
    constructor(room) {
        this.roomId = this.getId(room.roomId);
        this.name = room.name;
        this.imageUrl = room.imageUrl || "https://images.pexels.com/photos/11485777/pexels-photo-11485777.jpeg";
        this.description = room.description;
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.creator = this.setCreator(room.creator);
    }

    getId(id) {
        try {
            if (id) return id;
            return uuidv4().toString();
        } catch (error) {
            throw new Error(error);
        }
    }

    //set default creator 
    setCreator(creator) {
        try {
            if (creator) return creator;
            return 'Admin';
        } catch (error) {
            throw new Error(error);
        }
    }

    async save() {
        try {
            let res = await ChatService.prototype.createChatRoom(this);
            if (res) return res;
            return;
        } catch (error) {
            throw new Error(error);
        }
    }

    async update() {
        try {
            const res = await ChatService.prototype.updateChatRoom(this);
            if (res) return res;
            return false;
        } catch (error) {
             throw new Error(error);
        }
    }

     async delete() {
        try {
            let response = await ChatService.prototype.deleteChatRoom(this.roomId);
            if (response) return response;
            return;
        } catch (error) {
             throw new Error(error);
        }
    }

    async get() {
        try {
            const res = await ChatService.prototype.getChatRoom(this.roomId);
            if (res)
                return res;
            return ;
        } catch (error) {
             throw new Error(error);
        }
    }

    merge(target, source) {
        try {
            let newData = new ChatRoom({
                ...target
			});
			let _obj = Object.assign({...newData}, {...source});
			return new ChatRoom({..._obj});
        }
        catch (error) {
            throw new Error(error);
        }
    }
}

//room members

class RoomMembers{
    constructor(members) {
        this.roomId = members.roomId;
        this.memberId = members.memberId;
        this.createdAt = new Date();
    }

    static fromJson(json) {
        return new RoomMembers(json);
    }
    
    toJSON() {
        let json =  JSON.stringify({
            "roomId":this.roomId,
            "memberId":this.memberId
        });
        
        return json;
    }

     //add room members
     addRoomMember (rId, mId)  {
        return new Promise(function (resolve, reject) {
             let roomMember = new RoomMembers({
                            roomId: rId,
                            memberId: mId
             });
            return roomMember.save()
                .then(v => resolve(v))
                .catch(error => reject(error));
        });
    } 

    async save() {
        try {
            let res = await RoomService.prototype.addRoomMembers(this);
            if (res) return res;
            return;
        } catch (error) {
            throw new Error(error);
        }
    }

    //delete member
    async delete() {
        try {
            let response = await RoomService.prototype.deleteRoomMembers(this);
            if (response) return response;
            return;
        } catch (error) {
            throw new Error(error);
        }
    }
}

//room ownership
class ChatRoomOwner{
    constructor(owner) {
        this.roomId = owner.roomId;
        this.ownerId = owner.ownerId;
        this.createdAt = new Date();
    }
    
    static fromJson(json) {
        return new ChatRoomOwner(json);
    }

    async save() {
        try {
            let res = await RoomService.prototype.addRoomOwner(this);
            if (res) return res;
            return;
        } catch (error) {
            throw new Error(error);
        }
    }

    async update() {
        try {
            let res = await RoomService.prototype.updateRoomOwner(this);
            if (res) return res;
            return;
        } catch (error) {
            throw new Error(error);
        }
    }

    async exists() {
        try {
            return await RoomService.prototype.isRoomOwnerExists(this);
        } catch (error) {
            throw new Error(error);
        }
    }

    async getRoomsByOwner() {
        try {
            const res = await RoomService.prototype.getRoomsByOwner(this.ownerId);
            if (res)
                return res;
            return ;
        } catch (error) {
            throw new Error(error);
        }
    }

    //get owners of a room
    async getRoomOwner() {
        try {
            const res = await RoomService.prototype.getOwnersByRoomId(this.roomId);
            if (res)
                return res;
            return ;
        } catch (error) {
            throw new Error(error);
        }
    }

    async delete() {
        try {
            let response = await RoomService.prototype.deleteRoomOwner(this);
            if (response) return response;
            return;
        } catch (error) {
            throw new Error(error);
        }
    }
    
    toJSON() {
        let json = JSON.stringify({
            "roomId": this.roomId,
            "ownerId": this.ownerId
        });
        
        return json;
    }
}

module.exports = {
    ChatRoom,
    RoomMembers,
    ChatRoomOwner
};