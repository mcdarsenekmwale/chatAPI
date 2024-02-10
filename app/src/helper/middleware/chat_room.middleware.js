const { ChatRoom, ChatRoomOwner } = require("../../models/chat");
const { ResponseUtil } = require("../../utils/response");
const StaticFunctions = require("../static_functions");
const authorization = require("./authorization");

class ChatRoomMiddleware {

    constructor() {
        
    }

    //check if the user is a chat room owner
    async isChatRoomOwner(req, res, next) {
        try {
           
            let chatRoomId = req.params.roomId;
            
            if (!chatRoomId)
                chatRoomId = StaticFunctions.prototype.checkSetId(req.params[0]);
            if (!chatRoomId) throw (new Error("Invalid chat room id"));
            let uid = req.user.uid;
            if (uid == null || uid == "")  throw (new Error("Invalid chat room id"));
            
            authorization.isAdmin(req, res, next);
            let room = new ChatRoomOwner({ roomId: chatRoomId, ownerId:uid });
            let exists = await room.exists();

            if (exists || req.isAdmin) return next();
            if (!exists) throw new Error(`You are not an owner of this chat room. or the chat room with id ${chatRoomId} does not exist`);

            
        } catch (error) {
            ResponseUtil.forbiddenResponse(req, res, new Error(error));
        }
    }
}


module.exports = new ChatRoomMiddleware;
// Here