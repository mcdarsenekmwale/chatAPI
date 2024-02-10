
//constructor
var chatMessage = function (ChatMessage){
    //attributes
    this.id = ChatMessage.id;
    this.chat_id = ChatMessage.chat_id;
    this.image = ChatMessage.image;
    this.message = ChatMessage.message;
    this.time = ChatMessage.time;
    this.sender_uid = ChatMessage.sender_uid;
};

module.exports = chatMessage;
