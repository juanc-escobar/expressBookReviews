const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
const authenticatedUser = require('./router/auth_users.js').authenticatedUser;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
const username = req.body.username;
const password = req.body.password;

if(!username || !password) {
    return res.status(404).json({message: "Error loggin in"})
}
if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
        data: password
    }, 'access', { expiresIn: 60 * 60});

    req.session.authorization = {
        accessToken,username
    }
    next();
    return res.status(200).send("user succesfully logged in");
} else {
    return res.status(208).json({message: "Invalid login. Check username and password"});
}
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
