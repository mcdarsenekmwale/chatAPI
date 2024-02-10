const {v4: uuid4} = require('uuid');

//constructor
class Category {

    constructor (category) {
        this.id = this.getId(category.id);
        this.name = category.name;
        this.searchKey = category.searchKey;
    }

    getId(id) {
        console.info(id);
        if (id) return id;
        return uuid4().toString();
    }
} ;
 
module.exports = Category;