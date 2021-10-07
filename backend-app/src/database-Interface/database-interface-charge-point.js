module.exports = function({ dataAccessLayerChargePoint, dbErrorCheck, chargePointValidation }) {

    const exports = {}

    exports.getChargePoint = function(chargePointId, callback) {
        dataAccessLayerChargePoint.getChargePoint(chargePointId, function(error, chargePoint) {
            if (Object.keys(error).length > 0) {
                dbErrorCheck.checkError(error, function(errorCode) {
                    callback(errorCode, [])
                })
            } else {
                if (chargePoint == null) {
                    callback([], [])
                } else {
                    callback([], chargePoint)
                }

            }
        })
    }

    exports.getChargePoints = function(callback) {
        dataAccessLayerChargePoint.getChargePoints(function(error, chargePoints) {
            if (Object.keys(error).length > 0) {
                dbErrorCheck.checkError(error, function(errorCode) {
                    callback(errorCode, [])
                })
            } else {
                callback([], chargePoints)
            }
        })
    }

    exports.addChargePoint = function(name, location, price, klarnaReservationAmount, callback) {
        const validationError = chargePointValidation.chargePointValidation(name, location, price, klarnaReservationAmount)
        if (validationError.length > 0) {
            callback(validationError, [])
        } else {
            if ((klarnaReservationAmount == null) || (klarnaReservationAmount == undefined)) {
                klarnaReservationAmount = DEFAULT_RESERVATION_PRICE
            }
            dataAccessLayerChargePoint.addChargePoint(name, location, price, klarnaReservationAmount, function(error, chargePointId) {
                if (Object.keys(error).length > 0) {
                    dbErrorCheck.checkError(error, function(errorCode) {
                        console.log(errorCode)
                        callback(errorCode, [])
                    })
                } else {
                    callback([], chargePointId)
                }
            })
        }
    }

    exports.removeChargePoint = function(chargePointId, callback) {
        dataAccessLayerChargePoint.removeChargePoint(chargePointId, function(error, chargePointRemoved) { //chargePointRemoved = bool
            if (Object.keys(error).length > 0) {
                dbErrorCheck.checkError(error, function(errorCode) {
                    callback(errorCode, chargePointRemoved)
                })
            } else {
                callback([], chargePointRemoved)
            }
        })
    }

    exports.updateChargePoint = function(chargePointId, name, location, price, callback) {
        const validationError = chargePointValidation.chargePointValidation(name, location, price)
        if (validationError.length > 0) {
            callback(validationError, [])
        } else {
            dataAccessLayerChargePoint.updateChargePoint(chargePointId, name, location, price, function(error, chargePoint) {
                if (Object.keys(error).length > 0) {
                    dbErrorCheck.checkError(error, function(errorCode) {
                        callback(errorCode, [])
                    })
                } else {
                    callback([], chargePoint)
                }
            })
        }
    }


    return exports

}