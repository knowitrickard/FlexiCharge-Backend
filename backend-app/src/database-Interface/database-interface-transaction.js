const { checkPrime } = require("crypto")

module.exports = function({ dataAccessLayerTransaction, transactionValidation, dbErrorCheck, dataAccessLayerCharger, dataAccessLayerChargePoint, dataAccessLayerKlarna }) {

    const exports = {}

    exports.getTransaction = function(transactionID, callback) {
        dataAccessLayerTransaction.getTransaction(transactionID, function(error, transaction) {
            if (Object.keys(error).length > 0) {
                dbErrorCheck.checkError(error, function(errorCode) {
                    callback(errorCode, [])
                })
            } else {
                if (transaction == null) {
                    callback([], [])
                } else {
                    callback([], transaction)
                }
            }
        })
    }

    exports.getTransactionsForUser = function(userID, callback) {
        dataAccessLayerTransaction.getTransactionsForUser(userID, function(error, userTransaction) {
            if (Object.keys(error).length > 0) {
                dbErrorCheck.checkError(error, function(errorCode) {
                    callback(errorCode, [])
                })
            } else {
                callback([], userTransaction)
            }
        })
    }

    exports.getTransactionsForCharger = function(chargerID, callback) {
        dataAccessLayerTransaction.getTransactionsForCharger(chargerID, function(error, chargerTransaction) {
            if (Object.keys(error).length > 0) {
                dbErrorCheck.checkError(error, function(errorCode) {
                    callback(errorCode, [])
                })
            } else {
                callback([], chargerTransaction)
            }
        })
    }

    exports.addTransaction = function(userID, chargerID, isKlarnaPayment, pricePerKwh, callback) {
        const validationError = transactionValidation.getAddTransactionValidation(pricePerKwh)
        if (validationError.length > 0) {
            callback(validationError, [])
        } else {
            timestamp = (Date.now() / 1000 | 0)
            dataAccessLayerTransaction.addTransaction(userID, chargerID, isKlarnaPayment, pricePerKwh, timestamp, function(error, transactionId) {
                if (Object.keys(error).length > 0) {
                    dbErrorCheck.checkError(error, function(errorCode) {
                        callback(errorCode, [])
                    })
                } else {
                    callback([], transactionId)
                }
            })
        }
    }

    exports.updateTransactionPayment = function(transactionID, paymentID, callback) {
        dataAccessLayerTransaction.updateTransactionPayment(transactionID, paymentID, function(error, updatedTransaction) {
            if (Object.keys(error).length > 0) {
                dbErrorCheck.checkError(error, function(errorCode) {
                    callback(errorCode, [])
                })
            } else {
                callback([], updatedTransaction)
            }
        })
    }

    exports.updateTransactionChargingStatus = function(transactionID, kwhTransfered, currentChargePercentage, callback) {
        const validationError = transactionValidation.getUpdateTransactionChargingStatus(kwhTransfered, currentChargePercentage)
        if (validationError.length > 0) {
            callback(validationError, [])
        } else {
            dataAccessLayerTransaction.updateTransactionChargingStatus(transactionID, kwhTransfered, currentChargePercentage, function(error, updatedTransaction) {
                if (Object.keys(error).length > 0) {
                    dbErrorCheck.checkError(error, function(errorCode) {
                        callback(errorCode, [])
                    })
                } else {
                    dataAccessLayerCharger.getCharger(updatedTransaction[0].chargerID, function(error, charger) {
                        if (Object.keys(error).length > 0) {
                            dbErrorCheck.checkError(error, function(errorCode) {
                                callback(errorCode, [])
                            })
                        } else {
                            dataAccessLayerChargePoint.getChargePoint(charger.chargePointID, function(error, chargePoint) {
                                if (Object.keys(error).length > 0) {
                                    dbErrorCheck.checkError(error, function(errorCode) {
                                        callback(errorCode, [])
                                    })
                                } else {
                                    if (updatedTransaction.pricePerKwh * kwhTransfered >= chargePoint.klarnaReservationAmount) {
                                        //TODO: STOP CHARGING HERE
                                    } else {
                                        callback([], updatedTransaction)
                                    }
                                }
                            })
                        }
                    })

                }
            })
        }
    }

    exports.getNewKlarnaPaymentSession = async function(userID, chargerID, callback) {
        dataAccessLayerCharger.getCharger(chargerID, async function(error, charger) {
            if (Object.keys(error).length > 0) {
                dbErrorCheck.checkError(error, function(errorCode) {
                    callback(errorCode, [])
                })
            } else {
                if(charger != null) {
                    dataAccessLayerChargePoint.getChargePoint(charger.chargePointID, async function(error, chargePoint) {
                        if (Object.keys(error).length > 0) {
                            dbErrorCheck.checkError(error, function(errorCode) {
                                callback(errorCode, [])
                            })
                        } else {
                            dataAccessLayerKlarna.getNewKlarnaPaymentSession(userID, chargerID, chargePoint, async function(error, transactionData) {
                                if (error.length == 0) {
                                    const validationError = transactionValidation.addKlarnaTransactionValidation(transactionData.session_id, transactionData.client_token, transactionData.payment_method_categories)
                                    if (validationError.length > 0) {
                                        callback(validationError, [])
                                    } else {
                                        const paymentConfirmed = false
                                        const isKlarnaPayment = true
                                        const timestamp = (Date.now() / 1000 | 0)

                                        dataAccessLayerTransaction.addKlarnaTransaction(userID, chargerID, chargePoint.price, transactionData.session_id, transactionData.client_token, transactionData.payment_method_categories, isKlarnaPayment, timestamp, paymentConfirmed, function(error, klarnaTransaction) {
                                            if (Object.keys(error).length > 0) {
                                                dbErrorCheck.checkError(error, function(error) {
                                                    callback(error, [])
                                                })
                                            } else {
                                                callback([], klarnaTransaction)
                                            }
                                        })
                                    }
                                } else {
                                    callback(error, [])
                                }
                            })
                        }
                    })
                } else {
                    callback(["invalidChargerId"], [])
                }
            }
        })
    }

    exports.createKlarnaOrder = async function(transactionId, authorization_token, callback) { //TODO, THIS FUNCTION IS ONLY A START AND NEEDS TO BE IMPROVED AND TESTED

        dataAccessLayerTransaction.getTransaction(transactionId, function(error, transaction) {
            if (Object.keys(error).length > 0) {
                dbErrorCheck.checkError(error, function(errorCode) {
                    callback(errorCode, [])
                })
            } else { //Mock transaction data with a charger id cant be created in development
                dataAccessLayerCharger.getCharger( /*transaction.chargerID*/ 100000, function(error, charger) {
                    if (Object.keys(error).length > 0) {
                        dbErrorCheck.checkError(error, function(errorCode) {
                            callback(errorCode, [])
                        })
                    } else {
                        dataAccessLayerChargePoint.getChargePoint(charger.chargePointID, async function(error, chargePoint) {
                            if (Object.keys(error).length > 0) {
                                dbErrorCheck.checkError(error, function(errorCode) {
                                    callback(errorCode, [])
                                })
                            } else {
                                dataAccessLayerKlarna.createKlarnaOrder(transactionId, chargePoint.klarnaReservationAmount, authorization_token, function(error, klarnaOrder) {
                                    if (error.length == 0) {
                                        dataAccessLayerTransaction.updateTransactionPayment(transactionId, klarnaOrder.order_id, function(error, updatedTransaction) {
                                            if (Object.keys(error).length > 0) {
                                                dbErrorCheck.checkError(error, function(errorCode) {
                                                    callback(errorCode, [])
                                                })
                                            } else {
                                                callback([], updatedTransaction)
                                            }
                                        })
                                    } else {
                                        callback(error, [])
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })
    }

    exports.finalizeKlarnaOrder = async function(transactionId, callback) {

        dataAccessLayerTransaction.getTransaction(transactionId, function(error, transaction) {
            if (Object.keys(error).length > 0) {
                dbErrorCheck.checkError(error, function(errorCode) {
                    callback(errorCode, [])
                })
            } else {
                dataAccessLayerCharger.getCharger( /*transaction.chargerID*/ 100000, function(error, charger) {
                    if (Object.keys(error).length > 0) {
                        dbErrorCheck.checkError(error, function(errorCode) {
                            callback(errorCode, [])
                        })
                    } else {
                        dataAccessLayerChargePoint.getChargePoint(charger.chargePointID, async function(error, chargePoint) {
                            if (Object.keys(error).length > 0) {
                                dbErrorCheck.checkError(error, function(errorCode) {
                                    callback(errorCode, [])
                                })
                            } else {
                                dataAccessLayerKlarna.finalizeKlarnaOrder(transaction, transactionId, chargePoint.klarnaReservationAmount, function(error, responseData) {
                                    if (error.length == 0) {
                                        callback([], responseData)
                                        dataAccessLayerTransaction.updateTransactionPaymentConfirmed(transactionId, true, function(error, transaction) {
                                            if (Object.keys(error).length > 0) {
                                                dbErrorCheck.checkError(error, function(errorCode) {
                                                    callback(errorCode, [])
                                                })
                                            } else {
                                                callback([], transaction)
                                            }
                                        })
                                    } else {
                                        callback(error, [])
                                    }

                                })
                            }
                        })
                    }
                })
            }
        })
    }

    return exports
}