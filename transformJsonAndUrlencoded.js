const querystring = require('querystring');

function transformJsonAndUrlencoded(data) {
    try {
        const json = JSON.parse(data);
        return json;
    } catch(err) {
        return querystring.parse(data);
    }
}

module.exports = transformJsonAndUrlencoded;