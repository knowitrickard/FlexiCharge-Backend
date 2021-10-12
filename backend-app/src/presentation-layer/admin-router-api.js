var express = require('express')
const jwtAuthz = require('express-jwt-authz');
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');

const AdminCognitoService = require('./services/cognito.admin.config')

// Put in .env variable?
const checkIfAdmin = jwtAuthz(['Admins'], { customScopeKey: 'cognito:groups' });
const region = 'eu-west-1';
const adminUserPoolId = 'eu-west-1_1fWIOF9Yf';

const checkJwt = jwt({
    // Dynamically provide a signing key
    // based on the kid in the header and 
    // the signing keys provided by the JWKS endpoint.
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://cognito-idp.${region}.amazonaws.com/${adminUserPoolId}/.well-known/jwks.json`,
        // jwksUri: `https://dev-t3vri3ge.us.auth0.com/.well-known/jwks.json`
    }),

    // Validate the audience and the issuer.
    // audience: 'flexicharge.app',
    issuer: [`https://dev-t3vri3ge.us.auth0.com/`, 'https://cognito-idp.eu-west-1.amazonaws.com/eu-west-1_1fWIOF9Yf'],
    algorithms: ['RS256']
});

module.exports = function () {
    const router = express.Router()
    const cognito = new AdminCognitoService();

    router.post('/sign-in', function (req, res) {

        const { username, password } = req.body;

        cognito.adminSignIn(username, password)
            .then(result => {
                if (result.statusCode === 200) {
                    res.status(200).json(result.data).end();
                } else {
                    console.log(result);
                    res.status(400).json(result).end();
                }
            })
    })

    router.post('/set-user-password', checkJwt, checkIfAdmin, function (req, res) {

        const { username, password } = req.body;

        cognito.setUserPassword(username, password)
            .then(result => {
                if (result.statusCode === 201) {
                    res.status(200).json(result).end();
                } else {
                    console.log(result);
                    res.status(400).json(result).end();
                }
            })
    })

    router.get('/users/:username', checkJwt, checkIfAdmin, function (req, res) {
        const username = req.params.username
        cognito.getUser(username)
            .then(result => {
                if (result.statusCode === 200) {
                    console.log(result);
                    res.status(200).json(result.data).end();
                } else {
                    console.log(result);
                    res.status(400).json(result).end();
                }
            })
    })

    router.get('/users', checkJwt, checkIfAdmin, function (req, res) {

        // req.query.token replaces the + with a space, making the token incorrect
        const token = req.query.pagination_token
        const limit = req.query.limit
        const filterAttribute = req.query.filter_attribute
        const filterValue = req.query.filter_value

        let paginationToken = undefined
        if (token) {
            // re adds the + which makes the token correct again
            paginationToken = token.replace(/\ /g, '+')
        }

        cognito.getUsers(paginationToken, limit, filterAttribute, filterValue)
            .then(result => {
                if (result.statusCode === 200) {
                    console.log(result);
                    res.status(200).json(result.data).end();
                } else {
                    console.log(result);
                    res.status(400).json(result).end();
                }
            })
    })

    router.get('/:username', checkJwt, checkIfAdmin, function (req, res) {
        const username = req.params.username
        cognito.getAdmin(username)
            .then(result => {
                if (result.statusCode === 200) {
                    console.log(result);
                    res.status(200).json(result.data).end();
                } else {
                    console.log(result);
                    res.status(400).json(result).end();
                }
            })
    })
    router.get('/', checkJwt, checkIfAdmin, function (req, res) {
        // req.query.token replaces the + with a space, making the token incorrect
        const token = req.query.pagination_token
        const limit = req.query.limit
        const filterAttribute = req.query.filter_attribute
        const filterValue = req.query.filter_value

        let paginationToken = undefined
        if (token) {
            // re adds the + which makes the token correct again
            paginationToken = token.replace(/\ /g, '+')
        }

        cognito.getAdmins(paginationToken, limit, filterAttribute, filterValue)
            .then(result => {
                if (result.statusCode === 200) {
                    res.status(200).json(result.data).end();
                } else {
                    console.log(result);
                    res.status(400).json(result).end();
                }
            })
    })

    router.post('/users', checkJwt, checkIfAdmin, async function (req, res) {
        const { username, password, email, name, family_name } = req.body;

        let userAttributes = [];
        userAttributes.push({ Name: 'email', Value: email });
        userAttributes.push({ Name: 'name', Value: name });
        userAttributes.push({ Name: 'family_name', Value: family_name });
        userAttributes.push({ Name: 'email_verified', Value: "true" });

        cognito.createUser(username, password, userAttributes)
            .then(result => {
                if (result.statusCode === 201) {
                    res.status(201).json(result.data).end();
                } else {
                    console.log(result);
                    res.status(400).json(result).end();
                }
            })
    })
    router.post('/', checkJwt, checkIfAdmin, function (req, res) {
        const { username, password, email, name, family_name } = req.body;

        let userAttributes = [];
        userAttributes.push({ Name: 'email', Value: email });
        userAttributes.push({ Name: 'name', Value: name });
        userAttributes.push({ Name: 'family_name', Value: family_name });
        userAttributes.push({ Name: 'email_verified', Value: "true" });

        cognito.createAdmin(username, password, userAttributes)
            .then(result => {
                if (result.statusCode === 201) {
                    res.status(201).json(result.data).end();
                } else {
                    console.log(result);
                    res.status(400).json(result).end();
                }
            })
    })

    router.delete('/users/:username', checkJwt, checkIfAdmin, function (req, res) {
        const username = req.params.username;

        cognito.deleteUser(username)
            .then(result => {
                if (result.statusCode === 200) {
                    res.status(200).json(result.data).end();
                } else if (result.statusCode === 400) {
                    console.log(result);
                    res.status(400).json(result).end();
                } else {
                    console.log(result);
                    res.status(500).json(result).end();
                }
            })
    })

    router.delete('/:username', checkJwt, checkIfAdmin, function (req, res) {
        const username = req.params.username;

        cognito.deleteAdmin(username)
            .then(result => {
                if (result.statusCode === 200) {
                    res.status(200).json(result.data).end();
                } else {
                    console.log(result);
                    res.status(400).json(result).end();
                }
            })
    })

    router.put('/users/:username', checkJwt, checkIfAdmin, function (req, res) {

        const username = req.params.username;
        const { userAttributes } = req.body;

        cognito.updateUserAttributes(username, userAttributes)
            .then(result => {
                if (result.statusCode === 204) {
                    res.status(204).json(result.data).end();

                } else if (result.statusCode === 400) {
                    res.status(400).json(result).end();
                } else {
                    console.log(result);
                    res.status(500).json(result).end();
                }
            })
    })

    router.put('/users/:username/enable', checkJwt, checkIfAdmin, function (req, res) {
        const username = req.params.username;

        cognito.enableUser(username)
            .then(result => {
                if (result.statusCode === 200) {
                    res.status(200).json(result.data).end();

                } else if (result.statusCode === 400) {
                    console.log(result);
                    res.status(400).json(result).end();
                } else {
                    console.log(result);
                    res.status(500).json(result).end();
                }
            })
    })

    router.put('/users/:username/disable', checkJwt, checkIfAdmin, function (req, res) {
        const username = req.params.username;

        cognito.disableUser(username)
            .then(result => {
                if (result.statusCode === 200) {
                    res.status(200).json(result.data).end();

                } else if (result.statusCode === 400) {
                    console.log(result);
                    res.status(400).json(result).end();
                } else {
                    console.log(result);
                    res.status(500).json(result).end();
                }
            })
    })

    router.put('/:username', checkJwt, checkIfAdmin, function (req, res) {

        const username = req.params.username;
        const { userAttributes } = req.body;

        cognito.updateAdminAttributes(username, userAttributes)
            .then(result => {
                if (result.statusCode === 204) {
                    res.status(204).json(result.data).end();

                } else if (result.statusCode === 400) {
                    console.log(result);
                    res.status(400).json(result).end();
                } else {
                    console.log(result);
                    res.status(500).json(result).end();
                }
            })
    })

    router.put('/:username/enable', checkJwt, checkIfAdmin, function (req, res) {

        const username = req.params.username;

        cognito.enableAdmin(username)
            .then(result => {
                if (result.statusCode === 200) {
                    res.status(200).json(result.data).end();

                } else if (result.statusCode === 400) {
                    console.log(result);
                    res.status(400).json(result).end();
                } else {
                    console.log(result);
                    res.status(500).json(result).end();
                }
            })
    })
    router.put('/:username/disable', checkJwt, checkIfAdmin, function (req, res) {
        const username = req.params.username;

        cognito.disableAdmin(username)
            .then(result => {
                if (result.statusCode === 200) {
                    res.status(200).json(result.data).end();

                } else if (result.statusCode === 400) {
                    console.log(result);
                    res.status(400).json(result).end();
                } else {
                    console.log(result);
                    res.status(500).json(result).end();
                }
            })
    })

    router.post('/reset-user-password/:username', checkJwt, checkIfAdmin, function (req, res) {
        const username = req.params.username;

        cognito.resetUserPassword(username)
            .then(result => {
                if (result.statusCode === 200) {
                    res.status(200).json(result.data).end();
                } else if (result.statusCode === 400) {
                    res.status(400).json(result).end();
                } else {
                    res.status(500).json(result).end();
                }
            })
    })

    router.post('/set-admin-password', checkJwt, checkIfAdmin, function (req, res) {
        const { username, password } = req.body;

        cognito.setAdminPassword(username, password)
            .then(result => {
                res.status(200).json(result).end();
            })
    })

    router.post('/force-change-password', function (req, res) {

        const { username, password, session } = req.body;

        cognito.respondToAuthChallenge(username, password, session)
            .then(result => {
                if (result.statusCode === 200) {
                    res.status(200).json(result.data).end();
                } else {
                    res.status(400).json(result).end();
                }
            })
    })

    return router
}