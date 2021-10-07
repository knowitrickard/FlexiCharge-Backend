var express = require('express')

const CognitoService = require('./services/cognito.config')

module.exports = function () {
    const router = express.Router()
    const cognito = new CognitoService();

    router.post('/sign-up', function (req, res) {

        let { username, password, email, name, family_name } = req.body;

        // This might cause issues
        // If username is not sent with the request sets the username of the email as username
        username = username == undefined ? email.split('@')[0] : username

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

    router.post('/forgot-password/:username', function (req, res) {
        const username = req.params.username;

        cognito.forgotPassword(username)
            .then(result => {
                if (result.statusCode === 200) {
                    res.status(200).json(result).end();
                } else {
                    res.status(400).json(result).end();
                }
            })
    })

    router.post('/change-password', function (req, res) {

        const { accessToken, previousPassword, newPassword } = req.body;

        cognito.changePassword(accessToken, previousPassword, newPassword)
            .then(result => {
                if (result.statusCode === 200) {
                    res.status(200).json(result.data).end();
                } else if (result.statusCode === 400) {
                    res.status(400).json(result).end();
                } else {
                    res.status(result.statusCode).json(result).end();
                }
            })
    })

    router.post('/confirm-forgot-password', function (req, res) {
        const { username, password, confirmationCode } = req.body;

        cognito.confirmForgotPassword(username, password, confirmationCode)
            .then(result => {
                if (result.statusCode === 200) {
                    res.status(200).json(result.data).end();
                } else if (result.statusCode === 400) {
                    res.status(400).json(result).end();
                } else {
                    res.status(result.statusCode).json(result).end();

                }
            })

    })

    router.post('/sign-in', function (req, res) {

        const { username, password } = req.body;

        cognito.signInUser(username, password)
            .then(result => {
                if (result.statusCode == 200) {
                    res.status(200).json(result.data).end()
                } else {
                    res.status(400).json(result).end();
                }
            })
    })

    router.post('/verify', function (req, res) {
        const { username, code } = req.body;

        cognito.verifyAccount(username, code)
            .then(result => {
                if (result === true) {
                    res.status(200).end()
                } else {
                    res.status(400).json({ message: result.message, code: result.code, statusCode: result.statusCode }).end()
                }
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