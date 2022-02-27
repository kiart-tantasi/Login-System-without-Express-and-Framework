require("dotenv").config();
const http = require("http");

const { logIn, logOut, register } = require("./auth");
const { decodeCookie } = require("./cookie");

http.createServer((request, response) => {
    const { method, url } = request;

    // '/'
    if (method === "GET" && url === "/") {
        if (request.headers.cookie) {
            const decoded = decodeCookie(request);
            const username = decoded.user.username;
            response.end("You are authenticated with username: " + username);
        } else {
            response.end("not logged in.");
        }
    }

    // '/login'
    else if (method === "POST" && url === "/login") {
        let data = "";
        request.on("data", (chunk) => {
            data += chunk;
        });

        request.on("end", () => {
            const jsonData = JSON.parse(data);
            const { username, password } = jsonData;
            if (!username || !password) {
                response.statusCode = 404;
                response.end("missing username or password")
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
            response.end("You already logged out.");
        }
    }

    // '/register'
    else if (method === "POST" && url === "/register") {
        let data = "";
        request.on("data", (chunk) => {
            data += chunk;
        })

        request.on("end", () => {
            const jsonData = JSON.parse(data);
            const { username, password, firstname, lastname } = jsonData;
            if (!username || !password || !firstname || !lastname) {
                response.statusCode = 400;
                response.end("missing username, password, firstname or lastname");
                return;
            }
            register(username, password, firstname, lastname, response);            
        })
    }
    
    else {
        response.statusCode = 500;
        response.end("route and method does not exist.");
    }
})

.listen(process.env.PORT || 3000);