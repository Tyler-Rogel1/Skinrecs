const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
mongoose.connect(`mongodb+srv://se4200:wkTCKUq2Dabj3thD@mongotest.tny0m.mongodb.net/?retryWrites=true&w=majority&appName=MongoTest`, {
    dbName: 'skincareProducts'
});

const Product = mongoose.model('Product', {
    name: String,
    brand: String,
    bar: String,
    imageLink: String,
    tags: [String]
})

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
    },
    encryptedPassword: {
        type: String,
    },
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    }
});

UserSchema.methods.setEncryptedPassword = function (plainPassword) {
    let promise = new Promise((resolve, reject) => {
        //this is the promise function
        //resolve and reject are also funcitons
        console.log(plainPassword);
        bcrypt.hash(plainPassword, 12).then((hash) => { //eggs being cooked here
            console.log(hash); 
            this.encryptedPassword = hash;
            resolve();
        });
    });

    //return the promise for future eggs
    return promise;
}

UserSchema.methods.verifyEncryptedPassword = function (plainPassword) {
    let promise = new Promise((resolve, reject) => {
        bcrypt.compare(plainPassword, this.encryptedPassword).then((result) => {
            resolve(result);
        });
    });
    return promise;
}

const User  = mongoose.model('User', UserSchema);


module.exports = {
    Product,
    User
};