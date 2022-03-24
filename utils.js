
// THIS WORKS JUST FINE TO REPLACE EXPRESS'S BODY-PARSER() AND URLENCODED()
function transformJsonAndUrlencoded(data, contentType) {
    if (contentType === "application/x-www-form-urlencoded") {
        const params = new URLSearchParams(data);
        const entries = params.entries();
        const result = {};
        for (const [key, value] of entries) {
            result[key] = value;
        }
        return result;
    }
    else if (contentType === "application/json") return JSON.parse(data);
    else throw new Error("The data type is not url-encoded nor json!");
}

function jsonMessage(message) {
    return JSON.stringify({message: message});
}

module.exports = { transformJsonAndUrlencoded, jsonMessage };

