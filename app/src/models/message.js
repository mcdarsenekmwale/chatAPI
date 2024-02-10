const MessageService = require('../services/message.service');

class ChatMessage{
    constructor(message) {
        this.roomId = message.roomId;
        this.senderId = message.senderId;
        this.message = message.message;
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.messageId = this.getId(message.messageId);
    }


}


module.exports = ChatMessage;