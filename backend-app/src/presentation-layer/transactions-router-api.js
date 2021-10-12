var express = require('express')
const AuthMiddleware = require('./middleware/auth.middleware')
const authenticate = new AuthMiddleware().verifyToken;

module.exports = function ({ databaseInterfaceTransactions }) {

    const router = express.Router()
    router.get('/:id', function (request, response) {

        const transactionId = request.params.id
        databaseInterfaceTransactions.getTransaction(transactionId, function (errors, transaction) {
            if (errors.length == 0 && transaction.length == 0) {
                response.status(404).end()
            } else if (errors.length == 0) {
                response.status(200).json(transaction)
            } else {
                response.status(500).json(errors)
            }
        })
    })

    router.get('/userTransactions/:userID', function (request, response) {

        const userId = request.params.userID
        databaseInterfaceTransactions.getTransactionsForUser(userId, function (errors, userTransaction) {
            if (errors.length == 0 && userTransaction.length == 0) {
                response.status(404).end()
            } else if (errors.length == 0) {
                response.status(200).json(userTransaction)
            } else {
                response.status(500).json(errors)
            }
        })
    })

    router.get('/chargerTransactions/:chargerID', function (request, response) {

        const chargerId = request.params.chargerID
        databaseInterfaceTransactions.getTransactionsForCharger(chargerId, function (errors, chargerTransaction) {
            if (errors.length == 0 && chargerTransaction.length == 0) {
                response.status(404).end()
            } else if (errors.length == 0) {
                response.status(200).json(chargerTransaction)
            } else {
                response.status(500).json(errors)
            }
        })
    })

    router.post('/', function (request, response) {

        const { userID, chargerID, isKlarnaPayment, pricePerKwh } = request.body;
        databaseInterfaceTransactions.addTransaction(userID, chargerID, isKlarnaPayment, pricePerKwh, function (errors, transaction) {
            if (errors.length > 0) {
                response.status(400).json(errors)
            } else if (transaction) {
                response.status(201).json(transaction)
            } else {
                response.status(500).json(errors)
            }
        })
    })


    router.put('/payment/:transactionID', function (request, response) {

        const transactionId = request.params.transactionID
        const paymentId = request.body.paymentID
        databaseInterfaceTransactions.updateTransactionPayment(transactionId, paymentId, function (error, updatedTransactionPayment) {
            if (error.length == 0) {
                response.status(201).json(updatedTransactionPayment)
            } else {
                if (error.includes("internalError") || error.includes("dbError")) {
                    response.status(500).json(error)
                } else {
                    response.status(404).json(error)
                }
            }
        })
    })

    router.put('/chargingStatus/:transactionID', function (request, response) {
        const transactionId = request.params.transactionID
        const kwhTransfered = request.body.kwhTransfered
        const currentChargePercentage = request.body.currentChargePercentage
        databaseInterfaceTransactions.updateTransactionChargingStatus(transactionId, kwhTransfered, currentChargePercentage, function (error, updatedTransaction) {
            if (error.length == 0) {
                response.status(201).json(updatedTransaction)
            } else {
                if (error.includes("internalError") || error.includes("dbError")) {
                    response.status(500).json(error)
                } else {
                    response.status(404).json(error)
                }
            }
        })
    })

    router.put('/start/:transactionID', function (request, response) {

        const { transactionID, authorization_token } = request.body;

        databaseInterfaceTransactions.createKlarnaOrder(transactionID, authorization_token, function (error, klarnaOrder) {
            console.log(error);
            console.log(klarnaOrder);
            if (error.length === 0) {
                response.status(201).json(klarnaOrder)
            } else if (error.includes("internalError") || error.includes("dbError")) {
                response.status(500).json(error)
            } else {
                response.status(400).json(error);
            }
        })
    })

    router.post('/session', function (request, response) {
        const userID = request.body.userID
        const chargerID = request.body.chargerID

        databaseInterfaceTransactions.getNewKlarnaPaymentSession(userID, chargerID, function (error, klarnaSessionTransaction) {
            if (error.length > 0) {
                response.status(400).json(error)
            } else if (klarnaSessionTransaction) {
                response.status(201).json(klarnaSessionTransaction)
            } else {
                response.status(500).json(error)
            }
        })
    })

    router.put('/stop/:transactionID', function (request, response) {
        const transactionID = request.params.transactionID
        databaseInterfaceTransactions.finalizeKlarnaOrder(transactionID, function (error, stoppedTransaction) {
            if (error.length > 0) {
                response.status(400).json(error)
            } else if (stoppedTransaction) {
                response.status(200).json(stoppedTransaction)
            } else {
                response.status(500).json(error)
            }
        })
    })

    return router
}