module.exports = function ({ constants, func, v, databaseInterfaceCharger }) {
    const c = constants.get()

    exports.handleMessage = function (message, clientSocket, chargerID) {
        let data = JSON.parse(message)
        let messageTypeID = data[0]
        let uniqueID = data[1]

        var response = ""

        switch (messageTypeID) {
            case c.CALL:

                response = callSwitch(uniqueID, data, chargerID)
                break

            case c.CALL_RESULT:

                callResultSwitch(uniqueID, data, chargerID)
                break

            case c.CALL_ERROR:

                response = callErrorSwitch(uniqueID, data)
                break

            default:

                response = getGenericError(uniqueID, "MessageTypeID is invalid")
                break
        }
        if (response != "") {
            clientSocket.send(response)
        }
    }

    exports.interfaceHandler = function (chargerID, action, dataObject, callback) {

        const socket = v.getConnectedSocket(chargerID)

        if (socket != null) {

            var message = ""

            switch (action) {

                case c.RESERVE_NOW:
                    let uniqueID = func.getUniqueId(chargerID, action)
                    message = func.buildJSONMessage([
                        c.CALL,
                        uniqueID,
                        c.RESERVE_NOW, {
                            connectorID: dataObject.connectorID,
                            expiryDate: Date.now()+c.RESERVATION_TIME,
                            idTag: dataObject.idTag,
                            reservationID: dataObject.reservationID,
                            parentIdTag: dataObject.parentIdTag
                        }])
                    v.addCallback(uniqueID, callback)

                    break
            }

            socket.send(message)

        } else {
            console.log("Got no valid chargerID from API.")
            callback(null, c.INVALID_ID)
        }

    }


    function callSwitch(uniqueID, request, chargerID) {

        let action = request[2]
        console.log("Incoming request call: " + action)
        let callResult = ""

        switch (action) {
            case c.BOOT_NOTIFICATION:
                if (chargerID != null) {
                    callResult = func.buildJSONMessage([c.CALL_RESULT, uniqueID,
                    {
                        status: c.ACCEPTED,
                        currentTime: new Date().toISOString(),
                        interval: c.HEART_BEAT_INTERVALL,
                        chargerId: chargerID
                    }])

                } else {
                    callResult = func.buildJSONMessage([c.CALL_ERROR, uniqueID, c.INTERNAL_ERROR,
                        "Tell OCPP gang that error *no chargerID in callSwitch -> BOOT_NOTIFICATION* occured :)", {}])
                }
                break

            case c.START_TRANSACTION:
                //todo
                callResult = getCallResultNotImplemeted(uniqueID, action)
                break

            case c.STOP_TRANSACTION:
                //todo
                callResult = getCallResultNotImplemeted(uniqueID, action)
                break

            default:
                callResult = getCallResultNotImplemeted(uniqueID, action)
                break
        }

        return callResult
    }

    function callResultSwitch(uniqueID, response, chargerID) {

        if(checkIfValidUniqueID(uniqueID)){

            let action = response[2]
            console.log("Incoming result call: " + action)    

            switch (action) {
    
                case c.RESERVE_NOW:
                    let status = response[3].status
                    console.log("\nGot response on about the reservation from charger"
                        + chargerID + ": " + status)
                    callback = v.getCallback(uniqueID)
                    v.removeCallback(uniqueID)
    
    
                    if (status == c.ACCEPTED) {
                        //0 is occupied 
                        var dbNewStatus = 0
    
                        databaseInterfaceCharger.updateChargerStatus(chargerID, dbNewStatus, function (error, charger) {
                            if (error.length > 0) {
                                console.log("Error updating charger status in DB:\n" + error)
                                callback(c.INTERNAL_ERROR, null)
                            } else {
                                console.log("Charger updated in DB:\n" + charger.status)
                                callback(null, status)
                            }
    
                        })
                    } else {
                        //remove before production, should not update charger staus when not accepted
                        databaseInterfaceCharger.updateChargerStatus(chargerID, 1, function (error, charger) {
                            if (error.length > 0) {
                                console.log("Error updating charger status in DB:" + error)
                                callback(c.INTERNAL_ERROR, null)
                            } else {
                                console.log("Charger status in DB:" + charger.status)
                                callback(null, status)
                            }
    
                        })
                    }
    
                    break
    
                default:
                    let socket = v.getConnectedSocket(chargerID)
                    let message = getGenericError(uniqueID, "Could not interpret the response for the callcode: " + action)
                    socket.send(message)
                    break
            }
        }else{
            let socket = v.getConnectedSocket(chargerID)
            let message = getGenericError(uniqueID, "Could not found a previous conversation with this unique id.")
            socket.send(message)
        }

    }

    function callErrorSwitch(response) {
        let uniqueID = response[1]
        let errorCode = response[2]
        let callCode = uniqueID.substring(0, 3)
        let chargerID = uniqueID.substring(4, 9)

        var callResult = new String()

        switch (callCode) {
            default:
                console.log("Ops, the charger (" + chargerID + ") responded with an error: " + errorCode)
                break
        }

        return callResult
    }

    function checkIfValidUniqueID(uniqueID) {
        return v.getCallback(uniqueID) != null ? true : false
    }

    function getCallResultNotImplemeted(uniqueID, operation) {
        return func.buildJSONMessage([c.CALL_ERROR, uniqueID, c.NOT_IMPLEMENTED, "The *" + operation + "* function is not implemented yet.", {}])
    }

    function getGenericError(uniqueID, errorDescription) {
        return func.buildJSONMessage([c.CALL_ERROR, uniqueID, c.GENERIC_ERROR, errorDescription, {}])
    }

    return exports
}

