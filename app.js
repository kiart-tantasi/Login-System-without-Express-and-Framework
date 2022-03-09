require("dotenv").config();
const http = require("http");

const { logIn, logOut, register } = require("./auth");
const { decodeCookie } = require("./cookie");
const { transformJsonAndUrlencoded, jsonMessage } = require("./utils");

const app = http.createServer((request, response) => {
    const { method, url } = request;

    // '/'
    if (method === "GET" && url === "/") {
        if (request.headers.cookie) {
            const decoded = decodeCookie(request);
            const username = decoded.user.username;
            response.end(jsonMessage("You are authenticated with username: " + username));
        } else {
            response.end(jsonMessage("not logged in."));
        }
    }

    // '/login'
    else if (method === "POST" && url === "/login") {
        let str = "";
        let data;
        request.on("data", (chunk) => {
            str += chunk;
            data = transformJsonAndUrlencoded(str, request.headers["content-type"]);
        });

        request.on("end", () => {
            const { username, password } = data;
            if (!username || !password) {
                response.statusCode = 404;
                response.end(jsonMessage("missing username or password"))
                return;
            }
            logIn(username, password, response);            
        })
    }

    // '/logout'
    else if (method === "POST" && url === "/logout") {
        //remove cookie
        if (request.headers.cookie) {
            logOut(response);
        } else {
            response.statusCode = 400;
            response.end(jsonMessage("You already logged out."));
        }
    }

    // '/register'
    else if (method === "POST" && url === "/register") {
        let str = "";
        let data;
        request.on("data", (chunk) => {
            str += chunk;
            data = transformJsonAndUrlencoded(str, request.headers["content-type"]);
        });

        request.on("end", () => {
            const { username, password, firstname, lastname } = data;
            if (!username || !password || !firstname || !lastname) {
                response.statusCode = 400;
                response.end(jsonMessage("missing username, password, firstname or lastname"));
                return;
            }
            register(username, password, firstname, lastname, response);            
        })
    }
    
    else {
        response.statusCode = 500;
        response.end(jsonMessage("route and method does not exist."));
    }
})

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("running on port", port));

/*
TESTING

// GET '/'
fetch("http://localhost:3000").then(res => res.json()).then(data => console.log(data))

// LOGIN
fetch("http://localhost:3000/login",{
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({username:"admin",password:"password"})
}).then(res => res.json()).then(data => console.log(data))

// REGISTER
fetch("http://localhost:3000/register",{
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({username:"admin",password:"password",firstname:"firstnametest", lastname:"lastnametest"})
}).then(res => res.json()).then(data => console.log(data))

// LOG OUT
fetch("http://localhost:3000/logout",{method: "POST"}).then(res => res.json()).then(data => console.log(data))

*/