const express = require('express');
const cors = require('cors');
const model = require('./model');
const session = require('express-session');

const app = express();
app.use(express.static('public'));

function authorizeUser(request, response, next) {
    if (request.session && request.session.userId) {
        //user is authenticated
        model.User.findOne({
             _id: request.session.userId
        }).then((user) => {
            request.user = user;
            next();
        })
    } else {
        response.status(401).send("User not authenticated");
    }
}
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cors());
app.use(session({
    secret: "RqOJSOJnDo094320*$nif0N()$0n($(04n8*IN$)-_",
    saveUninitialized: true,
    resave: false
}));



app.get("/products", function (request, response) {
    model.Product.find({}).then((products) => {
        response.status(200).send(products);
    })
})

app.post("/products", authorizeUser, function (request, response) {
    // only allow creating if authenticated
    let newProduct = new model.Product({
        name: request.body.name,
        brand: request.body.brand,
        bar: request.body.bar,
        imageLink: request.body.imageLink,
        tags: request.body.tags,
        user: request.user._id
    });
    newProduct.save().then(() => {
        console.log("Product added successfully!");
        response.status(201).send("Product added successfully!");
    }).catch((error) => {
        if (error.errors) { // mongoose validation error
            // make a simple json object to return to client
            let errorMessages = {};
            for (let field in error.errors) {
                errorMessages[field] = error.errors[field].message;
            }
            response.status(422).json(errorMessages);
        } else if (error.code === 11000) {
            // duplicate key error
            response.status(422).send("Product with this name already exists");
        } else{
            response.sendStatus(500);
        }
        console.log("Failed to save product", error);
    });
    
});

app.delete("/products/:id", authorizeUser, function (request, response) {

    model.Product.findOneAndDelete({ _id: request.params.id }).then((product) => {
        if (product) {
            response.status(200).send("Product deleted successfully!");
        }
        else {
            response.status(404).send("Product not found");
        }
    }).catch((error) => {
        console.log("Failed to delete product", error);
    });

});

app.put("/products/:id", authorizeUser, function (request, response) {
    model.Product.findOneAndUpdate({ _id: request.params.id }, request.body, { new: true }).then((product) => {
        if (product) {
            response.status(200).send(product);
        }
        else {
            response.status(404).send("Product not found");
        }
    }).catch((error) => {
        console.log("Failed to update product", error);
    });
});

//create account
app.post("/users", function (request, response) {
    // console.log(request.body);
    let newUser = new model.User({
        email: request.body.email,
        firstName: request.body.firstName,
        lastName: request.body.lastName
    });
    newUser.setEncryptedPassword(request.body.plainPassword).then(function () {
        //promise has been fulfilled
        //eggs got cooked and are here
        
        newUser.save().then(() => {
            console.log("User added successfully!");
            response.status(201).send("User added successfully!");
        }).catch((error) => {
            if (error.errors) { // mongoose validation error
                // make a simple json object to return to client
                let errorMessages = {};
                for (let field in error.errors) {
                    errorMessages[field] = error.errors[field].message;
                }
                response.status(422).json(errorMessages);
            } else if (error.code === 11000) {
                // duplicate key error
                response.status(422).send("User with this email already exists");
            } else {
                response.sendStatus(500);
            }
            console.log("Failed to save user", error);
        });

    }).catch((error) => {
        console.log("Failed to hash password", error);
    });

});

//check if logged in
app.get("/session", authorizeUser, function (request, response) {
    response.json(request.user);
});
// login
app.post('/session', function (request, response) {
    //check if user exists by email
    model.User.findOne({ email: request.body.email }).then((user) => {
        if (user) {
            // if yes, check password
            user.verifyEncryptedPassword(request.body.plainPassword).then(function (verified) {
                if (verified) {
                    //if verified, record user into the session (authenticated)
                    request.session.userId = user._id;
                    response.status(201).send("User authenticated");
                } else {
                    // if password is wrong, return 401
                    response.status(401).send("User not authenticated");
                }
            });
        } else {
            //if they dont exist, return 401
            response.status(401).send("User not found");
        }
    })
});

app.delete('/session', authorizeUser, function (request, response) {
    // logout
    request.session.userId = null;
    response.status(200).send("User logged out");
})
app.listen(8080, function () {
    console.log("Listening on Port 8080")
});