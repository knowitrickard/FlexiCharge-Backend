/** This file should be removed before production,
 *  Only used for testing the database connection.
 */
const express = require('express')

module.exports = function({ databaseInterfaceCharger, databaseInterfaceReservations, databaseInterfaceTransactions, databaseInterfaceChargePoint }) {

    const router = express.Router()

    router.use('/', function(request, response, next) {
        next()
    })

    router.get("/check", async function(request, response) {



        switch ('transaction') {

            case 'chargePoints':

                const chargePoint = {
                    chargePointId: 1,
                    location: [57.78016419007881, 14.182610301538203],
                    name: "Kunskapsfabriken",
                    price: 0.55,
                }

                databaseInterfaceChargePoint.addChargePoint(chargePoint.name, chargePoint.location, chargePoint.price, chargePoint.klarnaReservationAmount, function(errors, chargePointAdded) {
                    console.log(errors)
                    console.log(chargePointAdded)
                    databaseInterfaceChargePoint.updateChargePoint(chargePoint.chargePointId, 'haj', chargePoint.location, chargePoint.price, function(errors, updatedChargePoint) {
                        console.log(errors)
                        console.log(updatedChargePoint)
                        response.redirect("/")
                    })
                })


                // databaseInterfaceChargePoint.getChargePoints(function(errors, chargePoints) {
                //     console.log(errors)
                //     console.log(chargePoints)
                //     response.redirect("/")
                // })

                // databaseInterfaceChargePoint.getChargePoint(chargePoint.chargePointId, function(errors, chargePoint) {
                //     console.log(errors)
                //     console.log(chargePoint)
                //     response.redirect("/")
                // })

                // databaseInterfaceChargePoint.updateChargePoint(chargePoint.chargePointId, 'haj', chargePoint.location, chargePoint.price, function(errors, updatedChargePoint) {
                //     console.log(errors)
                //     console.log(updatedChargePoint)
                //     response.redirect("/")
                // })

                // databaseInterfaceChargePoint.removeChargePoint(chargePoint.chargePointId, function(errors, chargePointRemoved) {
                //     console.log(errors)
                //     console.log(chargePointRemoved)
                //     response.redirect("/")
                // })

                break;
            case 'charger':

                const charger = {
                    chargePointID: 1,
                    location: [57.78016419007881, 14.182610301538203],
                    serialNumber: '##€43cstsdx6765',
                    status: 1
                }

                databaseInterfaceCharger.addCharger(charger.chargePointID, charger.serialNumber, charger.location, function(errors, chargerAdded) {
                    console.log(errors)
                    console.log(chargerAdded)
                    response.redirect("/")

                const charger2 = {
                    chargePointID: 1,
                    location: [57.78016419007881, 14.182610301538203],
                    serialNumber: '##€43cstsdx676',
                    status: 2
                }

                // databaseInterfaceCharger.addCharger(charger.chargePointID, charger.location, function(errors, chargerAdded) {
                //     console.log(errors)
                //     console.log(chargerAdded)

                //     databaseInterfaceCharger.removeCharger(charger.chargerID, function(errors, chargers) {
                //         console.log(errors)
                //         console.log(chargers)
                //         response.redirect("/")
                //     })


                })

                // databaseInterfaceCharger.removeCharger(charger.chargerID, function(errors, chargers) {
                //     console.log(errors)
                //     console.log(chargers)
                //     response.redirect("/")
                // })


                databaseInterfaceCharger.addCharger(charger.chargePointID, charger.serialNumber, charger.location, function(errors, chargerAdded) {
                    console.log(errors)
                    console.log(chargerAdded)
                    
                })

                databaseInterfaceCharger.addCharger(charger2.chargePointID, charger2.serialNumber, charger2.location, function(errors, chargerAdded) {
                    console.log(errors)
                    console.log(chargerAdded)
                    response.redirect("/")
                })


                // databaseInterfaceCharger.getChargers(function(errors, chargers) {
                //     console.log(errors)
                //     console.log(chargers)
                //     response.redirect("/")
                // })

                // databaseInterfaceCharger.getCharger(charger.chargerID, function(errors, charger) {
                //     console.log(errors)
                //     console.log(charger)
                //     response.redirect("/")
                // })

                // databaseInterfaceCharger.getAvailableChargers(function(errors, chargers) {
                //     console.log(errors)
                //     console.log(chargers)
                //     response.redirect("/")
                // })


                // databaseInterfaceCharger.updateChargerStatus(charger.chargerID, charger.status, function(errors, updatedCharger) {
                //     console.log(errors)
                //     console.log(updatedCharger)
                //     response.redirect("/")
                // })

                // })

                // databaseInterfaceCharger.getChargers(function(errors, chargers) {
                //     console.log(errors)
                //     console.log(chargers)
                //     response.redirect("/")
                // })

                break;
            case 'reservation':
                const reservation = {
                    reservationID: 1,
                    userID: 1,
                    chargerID: 1,
                    start: 1,
                    end: 4
                }

                databaseInterfaceReservations.getReservationForCharger(reservation.chargerID, function(errors, chargerReservation) {
                    console.log(errors)
                    console.log(chargerReservation)
                    databaseInterfaceReservations.removeReservation(55, function(errors, reservation) {
                        console.log(errors)
                        console.log(reservation)
                        response.redirect("/")
                    })
                })

                // databaseInterfaceReservations.getReservationForUser(reservation.userID, function(errors, userReservation) {
                //     console.log(errors)
                //     console.log(userReservation)
                //     response.redirect("/")
                // })

                // databaseInterfaceReservations.removeReservation(reservation.reservationID, function(errors, reservation){
                //     console.log(errors)
                //     console.log(reservation)
                //     response.redirect("/")
                // })

                // databaseInterfaceReservations.addReservation(reservation.chargerID, reservation.userID, reservation.start, reservation.end, function(errors, reservationId){
                //     console.log(errors)
                //     console.log(reservationId)
                //     response.redirect("/")
                // })

                // databaseInterfaceReservations.getReservation(reservation.reservationID, function(errors, reservation){
                //     console.log(errors)
                //     console.log(reservation)
                //     response.redirect("/")
                // })

                break;
            case 'transaction':

                const transaction = {
                    transactionID: 2,
                    chargerID: 1,
                    isKlarnaPayment: true,
                    pricePerKwh: 45.66,
                    kwhTransfered: 10.5,
                    currentChargePercentage: 59.3,
                    paymentID: 44,
                    userID: null
                }

                databaseInterfaceTransactions.addTransaction(transaction.userID, transaction.chargerID, transaction.isKlarnaPayment, transaction.pricePerKwh, function(errors, transactionId) {
                    console.log(errors)
                    console.log(transactionId)

                    databaseInterfaceTransactions.getTransaction(transaction.transactionID, function(errors, createdTransaction){
                        console.log(errors)
                        console.log(createdTransaction)

                        databaseInterfaceTransactions.updateTransactionChargingStatus(transaction.transactionID, transaction.kwhTransfered, transaction.currentChargePercentage, function(errors, updatedTransaction) {
                            console.log(errors)
                            console.log(updatedTransaction)

                            databaseInterfaceTransactions.updateTransactionPayment(transaction.transactionID, transaction.paymentID, function(errors, updatedTransaction) {
                                console.log(errors)
                                console.log(updatedTransaction)
<<<<<<< HEAD
                                response.redirect("/")
=======


                                const order_lines = [{
                                    "type": "physical",
                                    "reference": "19-402",
                                    "name": "Battery Power Pack",
                                    "quantity": 1,
                                    "unit_price": 30000,
                                    "tax_rate": 0,
                                    "total_amount": 30000,
                                    "total_discount_amount": 0,
                                    "total_tax_amount": 0,
                                    "image_url": "https://www.exampleobjects.com/logo.png",
                                    "product_url": "https://www.estore.com/products/f2a8d7e34"
                                }]


                                databaseInterfaceTransactions.finalizeKlarnaOrder(transaction.transactionID, order_lines, function(errors, updatedTransaction) {
                                    console.log(errors)
                                    console.log(updatedTransaction)
                                    response.redirect("/")
                                })
>>>>>>> 2f3dd375bf688ef4f18c20ea97f6845f881c34b0
                            })
                        })
                    })
                    
                })

                // databaseInterfaceTransactions.getTransaction(transaction.transactionID, function(errors, transaction) {
                //     console.log(errors)
                //     console.log(transaction)
                //     response.redirect("/")
                // })

                // databaseInterfaceTransactions.getTransactionsForUser(transaction.userID, function(errors, transactions) {
                //     console.log(errors)
                //     console.log(transactions)
                //     response.redirect("/")
                // })

                // databaseInterfaceTransactions.getTransactionsForCharger(transaction.chargerID, function(errors, transactions) {
                //     console.log(errors)
                //     console.log(transactions)
                //     response.redirect("/")
                // })

                // databaseInterfaceTransactions.updateTransactionPayment(transaction.transactionID, transaction.paymentID, function(errors, updatedTransaction) {
                //     console.log(errors)
                //     console.log(updatedTransaction)
                //     response.redirect("/")
                // })

                // databaseInterfaceTransactions.updateTransactionMeter(transaction.transactionID, transaction.meterStop, function(errors, updatedTransaction) {
                //     console.log(errors)
                //     console.log(updatedTransaction)
                //     response.redirect("/")
                // })

                break;
<<<<<<< HEAD
=======
            case 'klarna':

                const order_lines = [{
                    "type": "digital",
                    "name": "Electrical Vehicle Charging",
                    "quantity": 1,
                    "unit_price": 30000,
                    "tax_rate": 0,
                    "total_amount": 30000,
                    "total_discount_amount": 0,
                    "total_tax_amount": 0
                }]

                // databaseInterfaceTransactions.getNewKlarnaPaymentSession(null, 1, order_lines, function(error, transaction) {
                //     console.log(error)
                //     console.log(transaction)
                //     response.redirect("/")


                    // databaseInterfaceTransactions.getTransaction(transaction.transactionID, function(errors, createdTransaction) {
                    //     console.log(errors)
                    //     console.log(createdTransaction)

                    //     databaseInterfaceTransactions.updateTransactionChargingStatus(transaction.transactionID, transaction.kwhTransfered, transaction.currentChargePercentage, function(errors, updatedTransaction) {
                    //         console.log(errors)
                    //         console.log(updatedTransaction)

                    //         databaseInterfaceTransactions.finalizeKlarnaOrder(transaction.transactionID, order_lines, function(errors, updatedTransaction) {
                    //             console.log(errors)
                    //             console.log(updatedTransaction)
                    //             response.redirect("/")
                    //         })

                    //         })
                    //     })
                // });

                const charger1 = {
                    chargePointID: 1,
                    location: [57.78016419007881, 14.182610301538203],
                    serialNumber: '##€43cstsdx6765',
                    status: 1
                }

                databaseInterfaceCharger.addCharger(charger1.chargePointID, charger1.serialNumber, charger1.location, function(errors, chargerAdded) {
                    console.log(errors)
                    console.log(chargerAdded)

                    // databaseInterfaceTransactions.createKlarnaOrder(1, "c2a8a213-5833-1f02-a6a3-56a1626ff76b",  null, null, function(error, order) {
                    //     console.log(error)
                    //     console.log(order)
                    //     response.redirect("/")
                    // })


                    databaseInterfaceTransactions.getNewKlarnaPaymentSession(null, 100000, function(error, transaction) {
                        console.log(error)
                        console.log(transaction)

                        databaseInterfaceTransactions.getTransaction(transaction.transactionID, function(errors, createdTransaction) {
                            console.log(errors)
                            console.log(createdTransaction)

                            databaseInterfaceTransactions.updateTransactionChargingStatus(transaction.transactionID, transaction.kwhTransfered, transaction.currentChargePercentage, function(errors, updatedTransaction) {
                                console.log(errors)
                                console.log(updatedTransaction)

                                databaseInterfaceTransactions.finalizeKlarnaOrder(transaction.transactionID, function(errors, updatedTransaction) {
                                    console.log(errors)
                                    console.log(updatedTransaction)
                                    response.redirect("/")
                                })

                            })
                        })
                    });
                })

                // databaseInterfaceTransactions.finalizeKlarnaOrder(1, order_lines, function(error, transaction){
                //     console.log(error)
                //     console.log(transaction)
                //     response.redirect("/")
                // })


                break;
>>>>>>> 2f3dd375bf688ef4f18c20ea97f6845f881c34b0

            default:
                break;
        }
    })

    return router
}