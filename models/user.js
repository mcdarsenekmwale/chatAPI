
//user object constructor
var user = function (user) {
    //list of attributes
    this.uid = user.uid;
    this.name = user.name;
    this.email = user.email;
    this.username = user.username;
    this.gender = user.gender;
    this.phone = user.phone;
    this.avatar = user.avatar;
    this.description = user.description;
}

module.exports = user;