const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
mongoose.connect(`mongodb+srv://se4200:wkTCKUq2Dabj3thD@mongotest.tny0m.mongodb.net/?retryWrites=true&w=majority&appName=MongoTest`, {
    dbName: 'skincareProducts'
});

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    brand: {
        type: String,
        required: true
    },
    bar: {
        type: String,
        required: true
    },
    imageLink: {
        type: String,
        required: true
    },
    tags: [String],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

productSchema.index({ name: 'text' });
const Product = mongoose.model('Product', productSchema);

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    encryptedPassword: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
    }
});

UserSchema.methods.setEncryptedPassword = function (plainPassword) {
    let promise = new Promise((resolve, reject) => {
        //this is the promise function
        //resolve and reject are also funcitons
        // console.log(plainPassword);
        bcrypt.hash(plainPassword, 12).then((hash) => { //eggs being cooked here
            // console.log(hash); 
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