const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

let pems = {};

class AuthMiddleware {

    region = 'eu-west-1';
    userPoolId = 'eu-west-1_aSUDsld3S';
    adminUserPoolId = 'eu-west-1_1fWIOF9Yf';

    constructor() {
        this.setUp();
        this.setUpAdmin();
    }


    verifyToken(req, res, next) {
        const token = req.header('Auth');

        if (!token) res.status(401).end();

        let decodeJwt = jwt.decode(token, { complete: true })
        if (!decodeJwt) {
            res.status(401).end()
        }

        let kid = decodeJwt.header.kid;
        let pem = pems[kid];
        if (!pem) {
            res.status(401).end();
        }

        jwt.verify(token, pem, (error, payload) => {
            if (error) {
                res.status(401).end()
            } else {
                console.log("Payload:");
                console.log(payload);
            }
            next()
        })
    }

    async decodeToken(token) {
        const decoded = jwt.decode(token);
        return decoded;
    }

    async setUp() {
        const URL = `https://cognito-idp.${this.region}.amazonaws.com/${this.userPoolId}/.well-known/jwks.json`

        try {
            const response = await fetch(URL);
            // console.log(response);

            if (response.status !== 200) {
                throw 'request not successfull'
            }
            const data = await response.json();
            const { keys } = data;
            keys.forEach(key => {
                const key_id = key.kid
                const modulus = key.n;
                const exponent = key.e;
                const key_type = key.kty;
                const jwk = { kty: key_type, n: modulus, e: exponent };
                const pem = jwkToPem(jwk);
                pems[key_id] = pem
            });
            console.log('Got all pems.');

        } catch (error) {
            console.log(error);
            console.log('Could not fetch jwks.');

        }
    }
    async setUpAdmin() {
        const URL = `https://cognito-idp.${this.region}.amazonaws.com/${this.adminUserPoolId}/.well-known/jwks.json`

        try {
            const response = await fetch(URL);

            if (response.status !== 200) {
                throw 'request not successfull'
            }
            const data = await response.json();
            const { keys } = data;
            keys.forEach(key => {
                const key_id = key.kid
                const modulus = key.n;
                const exponent = key.e;
                const key_type = key.kty;
                const jwk = { kty: key_type, n: modulus, e: exponent };
                const pem = jwkToPem(jwk);
                pems[key_id] = pem
            });
            console.log('Got all admin pems.');

        } catch (error) {
            console.log(error);
            console.log('Could not fetch admin jwks.');

        }
    }

}

module.exports = AuthMiddleware