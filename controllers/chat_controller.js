'use strict'

var async		= require("async"),
    printJSON   = require('../utils/response'),
    constants   = require('../utils/constants'),
    Chat        = require('../models/chat'),
    ChatMessage = require('../models/chat_message'),
    db_user     = require('../databases/db_user'),
    db_query    = require('../databases/db_chat');


const ChatController = ChatMessage;

//create a chat id
ChatController.saveChatRoomDetails = function (req, res, next) {
    try {
        var chat = new Chat(req.body); //create a chat object
        //check if chat room exists
        db_query.isChatRoomExists(chat, function (err, response){
            if (err)
                next(err);
			if (!response) {
                db_query.createChatRoom(chat, function (err, response) {
                    var message = response;
                    console.info(response);
                    if (err)
                        next(err);
                    if (response == constants.CHATROOM_CREATED_SUCCESSFULLY) {
                        next = "success";
                        message = "chat-room create successfully";
                    } else if (response == constants.CHATROOM_CREATE_FAILED) {
                        next = "failed";
                        message = "Oops! An error occurred while create chat-room";
                    }
                    // echo json response
                     printResponse(res, 200, message, next);
                });
            }
        });
    } catch (error) {
        throw error;
    }
}

//retrieve chat room
//by chat id
ChatController.getChatRoom = function(req, res, next){
    try {
        db_query.getChatRoom(req.params.id, function(err, response){
            if (err)
            next(err);
        // body...
        var message;
        if (response != null)
            message = response;
        else
            message = "over";
        printResponse(res, 200, message, next);
        });
    } catch (error) {
        throw error;
    }
}

//retrieve all chat rooms
ChatController.getAllChatRooms = function (req, res, next) {
    try {
    // fetch chat
    var error = "";
    db_query.getAllChatRooms(function (err, response) {
            // body...
            if (err)
                next(err);
            if (response != null)  
                next = true;
            else {
                next = false;
                response = "not found";
            }

            printResponse(res, 200, response, next);
        });
    } catch (error) {
        throw error;
    }
}

//retrieve chat room
//by chat user uid
ChatController.getUserChatRooms = function(req, res, next){
    try {
        db_query.getAllChatRoomsByUId(req.params.uid, function(err, response){
            if (err)
            next(err);
        // body...
        var message;
        if (response != null)
            message = response;
        else
            message = "over";
        printResponse(res, 200, message, next);
        });
    } catch (error) {
        throw error;
    }
}

//retrieve all recent messages chats
//by chat user uid
ChatController.getAllChatRoomsRecentMessagesByUserUid = function (req, res, next){
    try {
        db_query.getAllChatRoomsByUId(req.params.uid, function(err, response){
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
        throw error;
    }
}

//remove chat room
//by chat_id
ChatController.removeChatRoom = function (req, res, next) {
	try {
		db_query.deleteChatRoom(req.params.id, function (err, result) {
			if (err)
				next(err);
			var message = !result?'Chat room deleted successfully': "Failed to delete chat room record";
			next = 'Notification';
			printResponse(res, 200, message, next);
		});
	}
	catch (e) {
		return e;
	}
}

//create a chat message
ChatController.saveChatMessageDetails = function (req, res, next){
    try {
        //create a chat message object
        var chatMessage = new ChatMessage(req.body);
        db_query.createChatMessage(chatMessage, function (err, response){
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
        throw error;
    }
}

//retrieve chatMessages for a particular 
//chat room
ChatController.getChatMessageByChatId = function (req, res, next){
    try {
        db_query.getChatMessageByChatId(req.params.chat_id, function (err, result){
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
            console.log('response');
        });
    } catch (error) {
        throw error;
    }
}


//retrieve chat message for a partiicular user
ChatController.getChatMessageByUserUid = function (req, res, next){
    try {
        db_query.getChatMessageByUserUid(req.params.uid, function (err, result){
            if (err) next(err);
            // body...
            var message;
            if (result != null)
                db_user.getUser(result.user, function (err, res){
                    if (err) throw err;
                    console.log(res);
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
ChatController.recallChatMessage = function (req, res, next){
    try {
        
    } catch (error) {
        throw error;
    }
}

//delete the chat Message
ChatController.removeChatMessage= function(req, res, next){
    try {
        
    } catch (error) {
        throw error;
    }
}

//get other user
//from the chat_id
function getOtherUid(main, part){
    var start = main.indexOf(part);
    var end = start + part.length;
    return main.substring(0, start - 1) + main.substring(end);
}

module.exports = ChatController;