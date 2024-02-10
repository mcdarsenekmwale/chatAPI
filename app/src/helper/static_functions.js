class StaticFunctions{
    constructor(){
        this.staticFunctions = new StaticFunctions();
    }

    limit(arr = Array.prototype, limit ) {
         if (arr.length > limit)
                arr.length = limit;
            return arr;
    }

    sortBy(arr = Array.prototype, order, sortBy) { 
        let con = (a, b) => {
            if (order == "ASC")
                return (a - b);
            return (b - a);
        };

        let newArr = arr.sort((a, b) => con(a[sortBy], b[sortBy]));
        return newArr;
    }


     checkSetId(id) {
         let newId = id;
        if (newId == null || newId == "")
            return printError(res, new Error("Invalid id"));
        if (newId.includes('/'))
            newId = newId.split('/')[newId.split('/').length - 1];
        if (newId.length < 24)
            return printError(res, new Error("Invalid id"));
        return newId;
    }

    getRoomOwner(req) {
        let chatRoomId = req.params.roomId;
        let owners = req.body.owners || req.body.data; //create a chat object
        if (chatRoomId == null || chatRoomId == "") return next(new Error("Invalid chat room id"));
        if (!Array.isArray(owners))
            owners = [owners]

        return {
            chatRoomId,
            owners
        };
        
    }

    //get room members
    getRoomMembers(req) {
        let chatRoomId = req.params.roomId || req.body.roomId;
        let members = req.body.data || req.body.members; //create a chat object
        if (chatRoomId == null || chatRoomId == "") return next(new Error("Invalid chat room id"));
        if (members && !Array.isArray(members))
            members = [members]
        return {
            chatRoomId,
            members
        };
    };

            
           
}

module.exports = StaticFunctions;