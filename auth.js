require("dotenv").config();
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { MongoClient } = require("mongodb");

const { setCookie, removeCookie } = require("./cookie");

const logIn = async(username, password, response) => {
    // PREPARATION
    const dbUrl = "mongodb://localhost:27017"; // your mongodb url in the file .env
    const client = new MongoClient(dbUrl);

    try {
        // CHECK IF USER EXISTS
        await client.connect();
        const db = client.db("userDB");
        const collection = db.collection("users");
        const user = await collection.findOne({username: username});
        if (!user) throw new Error("User does not exist.");
        client.close();
        
        // CHECK PASSWORD
        const correctPassword = bcryptjs.compareSync(password, user.password);
        if (!correctPassword) throw new Error("incorrect password");

        // CORRECT PASSWORD
        else {
            const exp = 60*60*24
            const privateKey = process.env.PRIVATE_KEY; // your secret / private key in the file .env
            const token = jwt.sign({
                user: {username: user.username},
                exp: Math.floor(Date.now()/1000) + exp
            }, privateKey);
            setCookie(response, token, exp);
            response.end("logged In successfully");
        }
    } catch (error) {
        response.statusCode = 400;
        response.end(error.message);
    }
}

const logOut = (response) => {
    removeCookie(response);
    response.end("logged out successfully");
}

const register = async(username, password, firstname, lastname, response) => {
    // PREPARATION
    const dbUrl = "mongodb://localhost:27017"; // your mongodb url in the file .env
    const client = new MongoClient(dbUrl);
    let clientIsConnected = false;

    try {
        // CHECK DATA
        if (!username || !password) throw new Error("missing username or password")

        // CHECK IF USER EXISTS
        await client.connect();
        clientIsConnected = true;
        const db = client.db("userDB");
        const collection = db.collection("users");
        const user = await collection.findOne({username: username});
        if (user) throw new Error("username is used.");
  
        // CREATE USER
        else {
            await collection.insertOne({
                username: username,
                password: bcryptjs.hashSync(password, 10),
                firstname: firstname,
                lastname: lastname
            })
            response.end("registered successfully with username: " + username);
        }

    } catch (error) {
        if (clientIsConnected) client.close();
        response.statusCode = 400;
        response.end(error.message);
    }
}


module.exports = {logIn, logOut, register};
