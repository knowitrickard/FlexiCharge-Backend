const AWS = require('aws-sdk')
const { createHmac } = require('crypto')
// const AuthMiddleware = require('../middleware/auth.middleware')
// const auth = new AuthMiddleware();

class CognitoService {

    config = {
        region: 'eu-west-1',
    }

    cognitoIdentity;
    secretHash = '17dlkm3vvufapqf8cv4p3252j3m4j4rd6t69bo5jc1kheqovcoui'
    clientId = '2ng9ud2h1cd4het746tcldvlh2'

    constructor() {
        this.cognitoIdentity = new AWS.CognitoIdentityServiceProvider(this.config);
    }

    async signUpUser(username, password, userAttributes) {

        console.log(userAttributes);

        const params = {
            Username: username,
            Password: password,
            ClientId: this.clientId,
            SecretHash: this.generateHash(username),
            UserAttributes: userAttributes
        }
        try {
            const data = await this.cognitoIdentity.signUp(params).promise();
            return true
        } catch (error) {
            return error
        }
    }

    async verifyAccount(username, code) {
        const params = {
            ClientId: this.clientId,
            ConfirmationCode: code,
            SecretHash: this.generateHash(username),
            Username: username,
        };

        try {
            const data = await this.cognitoIdentity.confirmSignUp(params).promise();
            return true
        } catch (error) {
            return error
        }
    }

    async signInUser(username, password) {
        const params = {
            AuthFlow: 'USER_PASSWORD_AUTH',
            ClientId: this.clientId,
            AuthParameters: {
                'USERNAME': username,
                'PASSWORD': password,
                'SECRET_HASH': this.generateHash(username)
            }
        }
        try {

            const tokens = await this.cognitoIdentity.initiateAuth(params).promise();
            if (tokens.ChallengeName) {
                return tokens
            }
            const userdata = await auth.decodeToken(tokens.AuthenticationResult.IdToken);

            const data = {
                accessToken: tokens.AuthenticationResult.AccessToken,
                email: userdata.email,
                username: userdata['cognito:username'],
                name: userdata.name,
                family_name: userdata.family_name,
                user_id: userdata.sub
            }

            const res = {
                data: data,
                statusCode: 200
            }

            return res

        } catch (error) {
            console.log(error);
            return error
        }
    }

    async changePassword(accessToken, previousPassword, newPassword) {
        const params = {
            "AccessToken": accessToken,
            "PreviousPassword": previousPassword,
            "ProposedPassword": newPassword
        }

        try {
            const res = await this.cognitoIdentity.changePassword(params).promise();
            const data = {
                data: res,
                statusCode: 200
            }
            return data;

        } catch (error) {
            console.log(error);
            return error
        }

    }

    async confirmForgotPassword(username, password, confirmationCode) {
        const params = {
            "Username": username,
            "Password": password,
            "ClientId": this.clientId,
            "ConfirmationCode": confirmationCode,
            "SecretHash": this.generateHash(username)
        }

        try {
            const res = await this.cognitoIdentity.confirmForgotPassword(params).promise();
            const data = {
                data: res,
                statusCode: 200
            }
            return data;

        } catch (error) {
            console.log(error);
            return error
        }

    }

    async forgotPassword(username) {

        const params = {
            "ClientId": this.clientId,
            "Username": username,
            "SecretHash": this.generateHash(username)
        }

        try {
            const res = await this.cognitoIdentity.forgotPassword(params).promise();
            console.log(res);
            const data = {
                data: res,
                statusCode: 200
            }
            return data;

        } catch (error) {
            console.log(error);
            return error;
        }
    }

    async respondToAuthChallenge(username, password, session) {

        const params = {
            "ChallengeName": "NEW_PASSWORD_REQUIRED",
            "ChallengeResponses": {
                "USERNAME": username,
                "NEW_PASSWORD": password,
                "SECRET_HASH": this.generateHash(username)
            },
            "ClientId": this.clientId,
            "Session": session,
        }

        try {
            const tokens = await this.cognitoIdentity.respondToAuthChallenge(params).promise();
            if (tokens.ChallengeName) {
                return tokens
            }
            const userdata = await auth.decodeToken(tokens.AuthenticationResult.IdToken);

            const data = {
                accessToken: tokens.AuthenticationResult.AccessToken,
                email: userdata.email,
                username: userdata['cognito:username'],
                name: userdata.name,
                family_name: userdata.family_name,
                user_id: userdata.sub
            }

            const res = {
                data: data,
                statusCode: 200
            }
            return res

        } catch (error) {
            console.log(error);
            return error
        }
    }

    generateHash(username) {
        return createHmac('SHA256', this.secretHash)
            .update(username + this.clientId)
            .digest("base64");
    }
}

module.exports = CognitoService
