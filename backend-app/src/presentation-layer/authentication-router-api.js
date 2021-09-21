var express = require('express')
const bodyParser = require('body-parser')

const CognitoService = require('./services/cognito.config')

module.exports = function () {
    const router = express.Router()

    router.post('/sign-up', function (req, res) {

        const { username, password, email, name, family_name } = req.body;
        const cognito = new CognitoService();

        let userAttributes = [];
        userAttributes.push({ Name: 'email', Value: email });
        userAttributes.push({ Name: 'name', Value: name });
        userAttributes.push({ Name: 'family_name', Value: family_name });

        cognito.signUpUser(username, password, userAttributes)
            .then(result => {
                if (result === true) {
                    res.status(200).end()
                } else {
                    res.status(400).json({ message: result.message, code: result.code, statusCode: result.statusCode }).end()
                }
            });
    })

    router.post('/admin/sign-in', function (req, res) {
        const cognito = new CognitoService();

        const { username, password } = req.body;

        cognito.signInAdmin(username, password)
            .then(result => {
                if (result.statusCode === undefined) {
                    res.status(200).json(result).end()
                } else if (result.statusCode === 403) {
                    res.status(403).json(result).end()
                } else {
                    res.status(400).json({ message: result.message, code: result.code, statusCode: result.statusCode }).end()
                }
            })

    })

    router.post('/sign-in', function (req, res) {

        const cognito = new CognitoService();
        const { username, password } = req.body;

        cognito.signInUser(username, password)
            .then(result => {
                if (result.statusCode == 400) {
                    res.status(400).json({ message: result.message, code: result.code, statusCode: result.statusCode }).end()
                } else if (result.statusCode == undefined) {
                    res.status(200).json(result).end()
                } else {
                    res.status(500).json(result).end()
                }
            })
    })

    router.post('/verify', function (req, res) {
        const { username, code } = req.body;
        const cognito = new CognitoService();

        cognito.verifyAccount(username, code)
            .then(result => {
                if (result === true) {
                    res.status(200).end()
                } else {
                    res.status(400).json({ message: result.message, code: result.code, statusCode: result.statusCode }).end()
                }
            })
    })

    return router
}