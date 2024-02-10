var async		= require("async"),
    {printResponse, printError}   = require('../utils/response'),
    constants   = require('../utils/constants'),
    {ChatRoom, RoomMembers, ChatRoomOwner}        = require('../models/chat'),
    ChatMessage = require('../models/chat_message'),
    UserService     = require('../services/user.service'),
    ChatService    = require('../services/chat.service');
const RoomService = require("../services/rooms.service");
const StaticFunctions = require('../helper/static_functions');


class ChatController { 

    constructor() {
        this.userService = new UserService();
        this.chatService = new ChatService();
        this.chatMessage = new ChatMessage();
        this.roomOwner = new ChatRoomOwner();
        ChatController.bind(this.helperRoom, this.helperRoomMember)
    }

    //bind the function to the controller class

    //create a chat id
    async saveChatRoomDetails (req, res, next) {
        try {
            
            let dataList = req.body || req.body.data; //create a chat object
            if (dataList == null || dataList == "") return next(new Error("Invalid chat room details"));

            let result = { status: 400, message: "Invalid chat room details" };
            
            if (dataList.length == 0) return next(new Error("Invalid chat room details"));
            if (!Array.isArray(dataList))
                dataList = [dataList];
            
            for (let data of dataList) {
                if (Object.keys(data).length == 0) return next(new Error("Invalid chat room details"));
                if (data.members == null || data.members == "") return next(new Error("Invalid chat room details"));
                let chatRoom = new ChatRoom({ ...data })
                let isLast = (chatRoom.name === dataList[dataList.length - 1].name);
                
              
                //check if chat room exists
                let isFound = await ChatService.prototype.isChatRoomExistsWithNameAndCreator(chatRoom);
                
                if (!isFound) {
                    let response = await chatRoom.save();
                    if (response) {
                        for (let member of data.members)
                            await RoomMembers.prototype.addRoomMember(chatRoom.roomId, member);
                       
                        if (isLast) 
                            result = { status: 200, message: 'Chat room has been created' };
                    }
                }
                else 
                    if (isLast)
                        result = { status: 400, message: "Chat room with the details already exists" };    
            }

            printResponse(
                res,
                result.status, result, next);
            return ;
        } catch (error) {
         
            const err = new Error(error);
            printError (res, err);
        }
    }

    //retrieve chat room
    //by chat id
    async getChatRoom (req, res, next){
        try {
            let chatRoomId = req.params.roomId;
            if (chatRoomId == null || chatRoomId == "") return next(new Error("Invalid chat room id"));
            let chatRoom = await ChatService.prototype.getChatRoom(chatRoomId);
            if (chatRoom) 
                printResponse(res, 200,
                    chatRoom, next);
            else {
                printResponse(res, 404, {
                    message: 'Chat room not found'
                }, next);
            }
            return;
        } catch (error) {
            const err = new Error(error);
            printError (res, err); 
        }
    }

    //retrieve all chat rooms
    async getAllChatRooms (req, res, next) {
        try {
            // fetch chat
            let limit = req.query.limit || 10;
			let offset = req.query.offset || 0;
			let sortBy = req.query.sortBy || "createdat";
            let order = req.query.order || "DESC"; //

			offset = offset == 0? 1 : offset;
            let {rooms, total} = await ChatService.prototype.getAllChatRooms(limit, sortBy, order, offset);
           
            if (rooms) {
                let data = {
					page: offset,
					count: total,
					context: req.url,
					nextDataLink: req.url.toString().replace(/offset=\d+/, `offset=${(Number(offset)+1)}`),
					previousDataLink: req.url.toString().replace(/offset=\d+/,`offset=${Math.max(0,Number(offset)-1)}`) ,
					'key tips': "Use limit to choose a specific amount of data, sortBy for sorting to a desired column and order for list order.For example: GET ?limit=3&order=ASC&sortBy=name",
					sortBy: `Sorted by ${sortBy} ${order}`,
					rooms
				};
				if (!data.count)
					delete data.nextDataLink;
				if (Number(offset) - 1 < 0)
					delete data.previousDataLink;
				printResponse(res, 200, data, next);
            }
            else {
                printResponse(res, 404, {
                    message: 'Oops! An error occurred while retrieving chat rooms'
                }, next);
            }
           
        } catch (error) {           
            const err = new Error(error);
            printError (res, err);
        }
    }

    //retrieve chat room
    //by chat user uid
    async getUserChatRooms(req, res, next){
        try {
            let uid = req.params.uid;
            let user = await ChatService.prototype.getAllChatRoomsByUId(uid);
            if(user)
                printResponse(res, 200,  {user: user[0]} , next);
            return;
       
        } catch (error) {
            const err = new Error(error);
            printError (res, err);
        }
    }

    //get rooms user is owner of
    async getChatRoomsByOwnerUid(req, res, next) {
        try {
            let uid = req.params.uid;
            let user = await RoomService.prototype.getRoomsByOwner(uid);
            printResponse(res, 200,  {user: user}, next);
            
        } catch (error) {
            const err = new Error(error);
            printError(res, err);
        }
    }

    //retrieve chat room owners by room uid
    async getChatRoomOwnersByRoomId(req, res, next) {
        try {
            let roomId = req.params.roomId;
            if (!roomId) throw new Error('No chat room id provided');
           
            let room = await RoomService.prototype.getOwnersByRoomId(roomId);
            if (!room)
                room = 'Not data for the id found'
            printResponse(res, 200,  {room: room}, next);
            return;
        } catch (error) {
            const err = new Error(error);
            printError(res, err);
        }
    }
            
            
 
      //remove chat room
    //by chat_id
    async removeChatRoom (req, res, next) {
        try {
            let chatRoomId = StaticFunctions.prototype.checkSetId(req.params[0]);
            let deletedRoom = new ChatRoom({ roomId: chatRoomId });
            
            let isFound = await deletedRoom.get();
            if (!isFound) return  printError (res, {status: 404, message:'No room with id ' + chatRoomId+' found'});
            let response = await deletedRoom.delete();
            if (response) 
                printResponse(res, 200, {
                    message: 'Chat room deleted successfully'
                }, next);
            else
                 printError (res,new Error('Failed Chat room deleted successfully'));
            return;
            
        }
        catch (error) {
            const err = new Error(error);
            printError (res, err);
        }
    }

    //update chat room
    //by chat id
    async updateChatRoom(req, res, next) {
        try {
            let chatRoomId = StaticFunctions.prototype.checkSetId(req.params[0]);
            let object = req.body || req.body.data; //create a chat object
            if (object == null || object == "") return next(new Error("Invalid chat room details"));
			if (Object.keys(object).length == 0) return next(new Error("Invalid chat room details"));

            
			let chatRoomData = await new ChatRoom({ roomId: chatRoomId }).get();
			if (!chatRoomData) return next(new Error("Invalid chat room id"));

			//updating user details
            let updatedData = ChatRoom.prototype.merge(chatRoomData, object);
            updatedData.roomId = chatRoomId;
            let response = await updatedData.update();
			if (response)
				return printResponse(res, 200, {
					message: `chat room details have been updated.`,
					room: updatedData
				});
			throw new Error(`Unable to update the chat room with ID ${chatRoomId}`);

        }
        catch (error) {
            const err = new Error(error);
            printError(res, err);
        }
    }

    //add chat room owners
    async addChatRoomOwner(req, res, next) {
        try {
            let { chatRoomId, owners } = StaticFunctions.prototype.getRoomOwner(req);
            let result = {status : 400, message: 'Bad Request! Please try again later'};
            for (let owner of owners) {
                let { isFound,isRoomAvailable, roomOwnerData } = await ChatController.prototype.helperRoom(owner, chatRoomId);
                if (!isRoomAvailable) {
                    result.status = 404;
                    result.message = 'Room is not available';
                    break;
                }

                if (!isFound) {
                    let response = await roomOwnerData.save();
                    if ((owner === owners[owners.length - 1]) && response) {
                         result.status = 200;
                         result.message = 'Room owner has been added';
                    }
                }
            }
            return printResponse(res, result.status, result, next);
        }
        catch (error) {
            const err = new Error(error);
            printError(res, err);
        }
    }

    async helperRoom(owner, chatRoomId) {
        if (owner == null || owner == "") return next(new Error("Invalid chat room details"));
        if (Object.keys(owner).length == 0) return next(new Error("Invalid chat room details"));
        let roomOwnerData = new ChatRoomOwner({ roomId: chatRoomId, ownerId: owner });
        let isFound = await RoomService.prototype.isRoomOwnerExists(roomOwnerData);
        let isRoomAvailable = await RoomService.prototype.isRoomAvailable(chatRoomId);
        return { isFound, isRoomAvailable, roomOwnerData };
    }

    //remove chat room owners
    async removeChatRoomOwner(req, res, next) {
        try {
            let { chatRoomId, owners } = StaticFunctions.prototype.getRoomOwner(req);
            let result = {status : 400, message: 'Bad Request! Please try again later'};
            for (let owner of owners) {
                let { isFound,isRoomAvailable, roomOwnerData } = await ChatController.prototype.helperRoom(owner, chatRoomId);
                if (!isRoomAvailable) {
                    result.status = 404;
                    result.message = 'Room is not available';
                    break;
                }
            
                if (isFound) {
                    let response = await roomOwnerData.delete();
                    if ((owner === owners[owners.length - 1]) && response) {
                         result.status = 200;
                        result.message = 'Chat room owner removed successfully';
                    }
                }
            }
            return printResponse(res, result.status, result, next);
        }
        catch (error) {
            const err = new Error(error);
            printError(res, err);
        }
    }
    
    //add chat room members
    async addChatRoomMembers(req, res, next) {
        try {
            let { chatRoomId, members } = StaticFunctions.prototype.getRoomMembers(req); 
            let result = { status: 400, message: 'Bad Request! Please try again later' };
            if(members) 
                for (let member of members) {
                    let { isFound,isRoomAvailable, roomMemberData } = await ChatController.prototype.helperRoomMember(member, chatRoomId);
                    if (!isRoomAvailable) {
                        result.status = 404;
                        result.message = 'Room is not available';
                        break;
                    }
                    if (!isFound) {
                        let response = await roomMemberData.save();
                        if ((member === members[members.length - 1]) && response){
                            result.status = 200;
                            result.message = 'Chat room members added successfully';
                        }
                    }
                }
            return printResponse(res, result.status, result, next);
        }
        catch (error) {
            const err = new Error(error);
            printError(res, err);
        }
    }

    //remove chat room members
    async removeChatRoomMembers(req, res, next) {
        try {
            let { chatRoomId, members } = StaticFunctions.prototype.getRoomMembers(req); 
            let result = {status : 400, message: 'Bad Request! Please try again later'};
            for (let member of members) {
                let { isFound,isRoomAvailable, roomMemberData } = await ChatController.prototype.helperRoomMember(member, chatRoomId);
                if (!isRoomAvailable) {
                    result.status = 404;
                    result.message = 'Room is not available';
                    break;
                }
                if (isFound) {
                    let response = await roomMemberData.delete();
                    if ((member === members[members.length - 1]) && response){
                        result.status = 200;
                        result.message = 'Chat room members removed successfully';
                    }
                }
            }
            return printResponse(res, result.status, result, next);
        } catch (error) {
            const err = new Error(error);
            printError(res, err);
        }
    }

    //helper room members
    async helperRoomMember(member, chatRoomId) {
        if (member == null || member == "") return next(new Error("Invalid chat room details"));
        if (Object.keys(member).length == 0) return next(new Error("Invalid chat room details"));
        let roomMemberData = new RoomMembers({ roomId: chatRoomId, memberId: member });
        let isFound = await RoomService.prototype.isRoomMemberExists(roomMemberData);
        let isRoomAvailable = await RoomService.prototype.isRoomAvailable(chatRoomId);
        return { isFound, isRoomAvailable, roomMemberData };
    }

    //join a room
    async joinChatRoom(req, res, next) {
        try {
            let chatRoomId = req.params.roomId;
            let uid = req.body.uid;
            if (chatRoomId == null || chatRoomId == "") return next(new Error("Invalid chat room id"));
            if (uid == null || uid == "") return next(new Error("Invalid chat room id"));
            let roomMemberData = new RoomMembers({ roomId: chatRoomId, memberId: uid });
            let isFound = await RoomService.prototype.isRoomMemberExists(roomMemberData);
            
            if (!isFound) {
                let isAdded = await roomMemberData.save();
                if (isAdded)
                    printResponse(
                        res, 201, {
                            message: 'Chat room joined successfully'
                        },
                        next
                    );
            }
            return;
        }
        catch (error) {
            const err = new Error(error);
            printError(res, err);
        }
    }

    //leave room
    async leaveChatRoom(req, res, next) {
        try {

            let chatRoomId = req.params.roomId || req.body.roomId;
            let uid = req.body.uid;
            if (chatRoomId == null || chatRoomId == "") return next(new Error("Invalid chat room id"));
            if (uid == null || uid == "") return next(new Error("Invalid chat room id"));
            
            let roomMemberData = new RoomMembers({ roomId: chatRoomId, memberId: uid });
            let isFound = await RoomService.prototype.isRoomMemberExists(roomMemberData);

            let result = { status:400 , message: 'Bad Request!. Failed to leave room'};
            if (isFound) {
                let isRemoved = await roomMemberData.delete();
                if (isRemoved)
                    result = { status: 201, message: 'Left chat room successfully' };
            }
            else
                result = { status:404 , message: 'Membership to a room with given id not found'};
             printResponse(
                 res, result.status,
                 {
                     message: result.message
                 }, next
             )
            return;
        }
        catch (error) {
            const err = new Error(error);
            printError(res, err);
        }
    }



    /*===========================================================================================
    =============================================================================================
    //retrieve all recent messages chats
    //by chat user uid
    //retrieve all chat rooms
    //by
    *********************************************************************************************
   **********************************************************************************************/

    //retrieve all recent messages chats
    //by chat user uid
    async getAllChatRoomsRecentMessagesByUserUid (req, res, next){
        try {


            await db_query.getAllChatRoomsByUId(req.params.uid, function(err, response){
                if (err) next(err);

                //data attributes
                var data = {};
                var result = [];
                if (response != null)
                    response.forEach((element)=>{
                        db_query.getChatMessageByChatId(element.chat_id, function (err, data_messages){
                            if (err) next(err);
                            var temp = data_messages[data_messages.length-1];
                            var uid;
                            if(temp.sender_uid == req.params.uid)
                                uid = getOtherUid(temp.chat_id, req.params.uid);
                            else 
                                uid = temp.sender_uid;
                            
                        //create chat user
                        db_user.getUser(uid, function (err, user_data){
                                if (err) throw err;
                                //Adding results to an array
                                result.push( db_query.fromChatUsertoJson(user_data, temp, data));
                                if (result.length == response.length)
                                    printResponse(res, 200, result, true);
                            });
                            data = {};  
                        });
                    });
            });
        } catch (error) {
            const err = new Error(error);
            printError (res, err);
        }
    }

    //create a chat message
    async saveChatMessageDetails (req, res, next){
        try {
            //create a chat message object
            var chatMessage = new ChatMessage(req.body);
            await db_query.createChatMessage(chatMessage, function (err, response){
                if (err) next(err);
                var message;
                if (response == constants.CHATMESSAGE_CREATED_SUCCESSFULLY) {
                    next = "success";
                    message = "Chat Message added successfully";
                } else if (response == constants.CHATMESSAGE_CREATE_FAILED) {
                    next = "failed";
                    message = "Oops! An error occurred while adding chat message detail(s)";
                }
                // echo json response
                printResponse(res, 200, message, next);
                            
            });
        } catch (error) {
            const err = new Error(error);
            printError (res, err);
        }
    }

    //retrieve chatMessages for a particular 
    //chat room
    async getChatMessageByChatId  (req, res, next){
        try {
            await db_query.getChatMessageByChatId(req.params.chat_id, function (err, result){
                if (err) next(err);
                // body...
                var message;
                var data = {};
                var response = [];
                if (result != null)
                    result.forEach((element)=>{
                        db_user.getUser(element.sender_uid, function (err, user_data){
                            if (err) throw err;
                            //Adding results to an array
                            response.push( db_query.fromChatMessagetoJson(user_data, element, data));
                            if (result.length == response.length)
                                printResponse(res, 200, response, next);
                        });
                        data = {};
                    });
                
                else{
                    message = "over";
                    printResponse(res, 200, message, next);
                }   
                
            });
        } catch (error) {
            throw error;
        }
    }


    //retrieve chat message for a partiicular user
    async getChatMessageByUserUid  (req, res, next){
        try {
            db_query.getChatMessageByUserUid(req.params.uid, function (err, result){
                if (err) next(err);
                // body...
                var message;
                if (result != null)
                    db_user.getUser(result.user, function (err, res){
                        if (err) throw err;
                       
                    });
                else{
                    message = "over";
                    printResponse(res, 200, message, next);
                }    
            });
        } catch (error) {
            throw error;
        }
    } 


    //recall the chatMessage for edit
    async recallChatMessage (req, res, next){
        try {
            
        } catch (error) {
            throw error;
        }
    }

    //delete the chat Message
    async removeChatMessage (req, res, next){
        try {
            
        } catch (error) {
            throw error;
        }
    }

    //get other user
    //from the chat_id
     getOtherUid(main, part){
        var start = main.indexOf(part);
        var end = start + part.length;
        return main.substring(0, start - 1) + main.substring(end);
    }

}



module.exports = ChatController;