const query = require('../services/user.service');
const bcrypt = require('bcryptjs');

//user object constructor
class User {
    constructor(user) {
        //list of attributes
        this.uid = user.uid;
        this.name = user.name;
        this.email = user.email;
        this.username = user.username;
        this.gender = user.gender;
        this.phone = user.phone;
        this.avatar = user.avatar;
        this.about = user.about;
        this.password = user.password;
    }

    //saving new user
    async save() {
        try { 
            let newUser = this;
            newUser.password = await this.encryptPassword(newUser.password);
            const res = await query.prototype.createUser(newUser);
            if (res) return res;
            return false;
        }
        catch (error) {
         
            throw new Error(error);
        }
    }

    //update
    async update() {
        try {
            let newUser = this;
            const res = await query.prototype.updateUser(this.uid, newUser);
            if (res) return res;
            return false;
        }
        catch (error) {
            throw new Error(error);
        }
    }

    //delete

    async delete(){
        try {
            const res = await query.prototype.deleteUser(this.uid);
            if (res) return res;
            return false;
        } catch (err) {
            console.log("Error: ", err);
            throw new Error(err);
        }
    }

    //update password
    async updatePassword(password) {
        try {
            let newUser = this;
            let user = await this.fetch();
            let verifyingPassword = await this.validatePassword(this.password, user.password);
            if (!verifyingPassword)
                throw new Error("incorrect current password");
            newUser.password = await this.encryptPassword(password);

            const res = await query.prototype.changePassword(this.uid, newUser);
            if (res) return res;
            return false;  
        }
        catch (error) {
            throw new Error(error);
        }
    }

    async fetch() {
        try {
            const res = await query.prototype.getUser(this.uid);
            if (res)
                return res;
            return {};
        }
        catch (error) {
            throw new Error(error);
        }
    }

    assign(target, source) {
        try {
            let newData = new User({
                ...target
			});
			let _obj = Object.assign({...newData}, {...source});
			return new User({..._obj});
        }
        catch (error) {
            throw new Error(error);
        }
    }

    omit(field) {
        try {
            let newData = this;
            delete newData[field];
            return newData;
        } catch (error) {
          console.log('Error in omit: ', error);
        }
    }

    //encrypt user password
    async encryptPassword(password) { 
        try {
            let salt = await bcrypt.genSalt(10);
            let hashPassword = await bcrypt.hash(password, salt);
            return hashPassword;
        } catch (error) {
            throw new Error(error);
        }
    }

//verifying new password
    async validatePassword(password, hashPassword) { 
        try {
            let isMatch = await bcrypt.compare(password, hashPassword);
            return isMatch;
        } catch (error) {
            throw new Error(error);
        }
    }

    //get user by email
    async getByEmail() {
        try {
            const res = await query.prototype.getUserByEmail(this.email);
            if (res)
                return res;
            return ;
        }
        catch (error) {
            throw new Error(error);
        }
    }

    //remove all users
    async deleteAll() {
        try {
            const res = await query.prototype.deleteAllUsers();
            if (res) return res;
            return false;
        } catch (error) {
            throw new Error(error);
        }
    }

}

module.exports = User;