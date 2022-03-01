require("dotenv").config();
const http = require("http");

const { logIn, logOut, register } = require("./auth");
const { decodeCookie } = require("./cookie");
const { transformJsonAndUrlencoded } = require("./utils");

http.createServer((request, response) => {
    const { method, url } = request;

    // '/'
    if (method === "GET" && url === "/") {
        if (request.headers.cookie) {
            const decoded = decodeCookie(request);
            const username = decoded.user.username;
            const jsonMessage = JSON.stringify({message: "You are authenticated with username: " + username});
            response.end(jsonMessage);
        } else {
            const jsonMessage = JSON.stringify({message: "not logged in."});
            response.end(jsonMessage);
        }
    }

    // '/login'
    else if (method === "POST" && url === "/login") {
        let data = "";
        request.on("data", (chunk) => {
            data += chunk;
            data = transformJsonAndUrlencoded(data);
        });

        request.on("end", () => {
            const { username, password } = data;
            if (!username || !password) {
                response.statusCode = 404;
                const jsonMessage = JSON.stringify({message: "missing username or password"});
                response.end(jsonMessage)
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
            const jsonMessage = JSON.stringify({message: "You already logged out."});
            response.end(jsonMessage);
        }
    }

    // '/register'
    else if (method === "POST" && url === "/register") {
        let data = "";
        request.on("data", (chunk) => {
            data += chunk;
            data = transformJsonAndUrlencoded(data);
        })

        request.on("end", () => {
            const { username, password, firstname, lastname } = data;
            if (!username || !password || !firstname || !lastname) {
                response.statusCode = 400;
                const jsonResponse = ({message:"missing username, password, firstname or lastname"});
                response.end(jsonResponse);
                return;
            }
            register(username, password, firstname, lastname, response);            
        })
    }
    
    else {
        response.statusCode = 500;
        const jsonResponse = ({message:"route and method does not exist."});
        response.end(jsonResponse);
    }
})

.listen(process.env.PORT || 3000);

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