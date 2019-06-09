var randtoken = require('rand-token');
const jwt = require('jsonwebtoken');
const jwtSecretKey = require('../config/jwtSecretKey');
const secretOrPrivateKey = jwtSecretKey;
const options = {
    algorithm: "HS256",
    expiresIn: "1h",
    issuer: "jaesuk"
};
const refreshOptions = {
    algorithm: "HS256",
    expiresIn: "24h * 14",
    issuer: "jaesuk"
};

module.exports = {
    sign: (user) => {
        const payload = {
            userIdx: user.userIdx,
            id: user.id,
            name: user.name
        };

        const result = {
            token: jwt.sign(payload, secretOrPrivateKey, options)
        };
        //refreshToken을 만들 때에도 다른 키를 쓰는게 좋다.

        return result;
    },
    verify: (token) => {
        let decoded;
        try {
            decoded = jwt.verify(token, secretOrPrivateKey);
        } catch (err) {
            if (err.message === 'jwt expired') {
                console.log('expired token');
                return -3;
            } else if (err.message === 'invalid token') {
                console.log('invalid token');
                return -2;
            } else {
                console.log("invalid token");
                return -2;
            }
        }
        return decoded;
    },
    refresh: (user) => {
        const payload = {
            idx: user.idx,
            grade: user.grade,
            name: user.name
        };

        return jwt.sign(payload, secretOrPrivateKey, options);
    }
};