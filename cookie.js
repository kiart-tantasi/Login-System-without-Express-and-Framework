const cookie = require("cookie");
const jwt = require("jsonwebtoken");

const decodeCookie = (request) => {
    const rawCookie = request.headers.cookie;
    const parsed = cookie.parse(rawCookie);
    const token = parsed.token;
    const privateKey = process.env.PRIVATE_KEY;
    const decoded = jwt.decode(token, privateKey);
    return decoded;
}

const setCookie = (response, token, exp) => {
    response.setHeader("Set-Cookie", cookie.serialize("token", token, {
        httpOnly: true,
        maxAge: exp
    }));
}

const removeCookie = (response) => {
    response.setHeader("Set-Cookie", cookie.serialize("token", "expired1234", {
        httpOnly: true,
        maxAge: 0
    }));
}

module.exports = { decodeCookie, setCookie, removeCookie };