module.exports = function ({ func, v, constants, interfaceHandler }) {
    const c = constants.get()

    exports.handleMessage = function (message, clientSocket, chargerID) {
        let data = JSON.parse(message)
        let messageTypeID = data[c.MESSAGE_TYPE_INDEX]
        let uniqueID = data[c.UNIQUE_ID_INDEX]

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

                response = func.getGenericError(uniqueID, "MessageTypeID is invalid")
                break
        }
        if (response != "") {
            clientSocket.send(response)
        }
    }


    function callSwitch(uniqueID, request, chargerID) {

        let action = request[c.ACTION_INDEX]
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
                callResult = func.getCallResultNotImplemeted(uniqueID, action)
                break

            case c.STOP_TRANSACTION:
                //todo
                callResult = func.getCallResultNotImplemeted(uniqueID, action)
                break

            default:
                callResult = func.getCallResultNotImplemeted(uniqueID, action)
                break
        }

        return callResult
    }

    function callResultSwitch(uniqueID, response, chargerID) {

        if(func.checkIfValidUniqueID(uniqueID)){

            let action = response[c.ACTION_INDEX]
            console.log("Incoming result call: " + action)    

            switch (action) {
    
                case c.RESERVE_NOW:
                    interfaceHandler.handleReserveNowResponse(chargerID, uniqueID, response)
                    break
    
                default:
                    let socket = v.getConnectedSocket(chargerID)
                    let message = func.getGenericError(uniqueID, "Could not interpret the response for the callcode: " + action)
                    socket.send(message)
                    break
            }
        }else{
            let socket = v.getConnectedSocket(chargerID)
            let message = func.getGenericError(uniqueID, "Could not found a previous conversation with this unique id.")
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


    return exports
}

