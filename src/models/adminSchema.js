const mongoose = require("mongoose");
var crypto = require('crypto'); 

const AdminSchema = mongoose.Schema({
  
    email: {
        type: String,
    },
    hash : String, 
    salt : String, 
    role: { type: String, enum: ['admin', 'restricted'], required: true },
});

// Method to set salt and hash the password for a user 
AdminSchema.methods.setPassword = function(password) {  
    this.salt = crypto.randomBytes(16).toString('hex'); 
    this.hash = crypto.pbkdf2Sync(password, this.salt,  
    1000, 64, `sha512`).toString(`hex`); 
}; 
  
// Method to check the entered password is correct or not 
AdminSchema.methods.validPassword = function(password) { 
    var hash = crypto.pbkdf2Sync(password,  
    this.salt, 1000, 64, `sha512`).toString(`hex`); 
    return this.hash === hash; 
}; 
  
  

module.exports = mongoose.model("admin", AdminSchema);
