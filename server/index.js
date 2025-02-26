const express = require('express');
const cors = require('cors');
const model = require('./model');

const app = express();


app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cors());

app.get("/products", function (request, response) {
    model.Product.find({}).then((products) => {
        response.status(200).send(products);
    })
})

app.post("/products", function (request, response) {
    let newProduct = new model.Product({
        name: request.body.name,
        brand: request.body.brand,
        bar: request.body.bar,
        imageLink: request.body.imageLink,
        tags: request.body.tags
    });
    newProduct.save().then(() => {
        console.log("Product added successfully!");
        response.status(201).send("Product added successfully!");
    }).catch((error) => {
        console.log("Failed to save product", error);
    });
    
});

app.delete("/products/:id", function (request, response) {

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

app.post("/users", function (request, response) {
    console.log(request.body);
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
            console.log("Failed to save user", error);
        });

    }).catch((error) => {
        console.log("Failed to hash password", error);
    });

});

// login
app.post('/session', function (request, response) {
    //check if user exists by email
    model.User.findOne({ email: request.body.email }).then((user) => {
        if (user) {
            // if yes, check password
            user.verifyEncryptedPassword(request.body.plainPassword).then(function (verified) {
                if (verified) {
                    // if password is correct, record user into the session (authenticated)
                    //if verified, record user into the session (authenticated)
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

app.delete('/session', function (request, response) {
    // logout
})
app.listen(8080, function () {
    console.log("Listening on Port 8080")
});