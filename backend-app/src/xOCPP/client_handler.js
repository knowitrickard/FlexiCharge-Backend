module.exports = function ({ databaseInterfaceCharger, messageHandler, v, constants, func, test }) {
    const c = constants.get()
    
    exports.handleClient = function (clientSocket, chargerSerial) {

        var messageCache = ""

        isValidClient(clientSocket, chargerSerial, function (error, chargerID) {
            if (error == null ) {
                if (chargerID) {
                    console.log("Charger with ID: " + chargerID + " connected to the system.")
                    console.log("Number of connected chargers: " + v.getLengthConnectedSockets() + " (" + v.getLengthChargerSerials() + ")" + " (" + v.getLengthChargerIDs() + ")")
                    if (messageCache != "") {
    
                        /*****************************************
                         used for internal testing, remove before production
                         *****************************************/
                        var test = false
                        test = testSwitch(messageCache, clientSocket)
                        /*****************************************/
    
                        if (!test) {
                            messageHandler.handleMessage(messageCache, clientSocket, chargerID)
                        }
    
                    }
    
                } else {
                    console.log("Charger with serial # " + chargerSerial + " was refused connection.\nReason: Charger not found in system.")
                    let message = func.buildJSONMessage([c.CALL_ERROR, 1337, c.SECURITY_ERROR,
                        "Serial number was not found in database.", {}])
                    clientSocket.send(message)
                    clientSocket.terminate()
                }
            } else {
                func.getGenericError(func.getUniqueId(chargerID, c.INVALID_ID), error.toString())
            }
        })

        clientSocket.on('message', function incoming(message) {

            if (v.isInChargerSerials(chargerSerial)) {

                /*****************************************
                 used for internal testing, remove before production
                 *****************************************/
                var test = false
                test = testSwitch(message, clientSocket)
                /*****************************************/

                if (!test) {
                    messageHandler.handleMessage(message, clientSocket, v.getChargerID(chargerSerial))
                }

            } else {
                messageCache = message
            }
        })
    }

    function isValidClient(newSocket, chargerSerial, callback) {
        databaseInterfaceCharger.getChargerBySerialNumber(chargerSerial, function (errorCodes, charger) {

            if (errorCodes.length) {
                console.log(errorCodes)
                callback(errorCodes[0], false)
            } else {

                if (charger.length != 0) {
                    let chargerID = charger.chargerID

                    // Save the websocket with the charger's serial in array:
                    v.addConnectedSockets(chargerID, newSocket)
                    v.addChargerSerials(chargerSerial)
                    v.addChargerIDs(chargerSerial, chargerID)

                    callback(null, chargerID)
                } else {
                    callback(null, false)
                }
            }
        })
    }

    function testSwitch(message, clientSocket) {
        try {
            let data = JSON.parse(message)
            let chargerSerial = data[0]
            let chargerID = v.getChargerID(chargerSerial)
            
            let testFunction = data[1]

            switch (testFunction) {

                case c.TEST1:
                    test.testFreeCharger(chargerID)
                    return true

                case c.TEST2:
                    test.testRemoteStart(chargerID)
                    return true

                case c.TEST3:
                    test.testRemoteStop(chargerID)
                    return true
                
                case c.TEST4:
                    test.testReserveNow(chargerID)
                    return true
                default:
                    return false

            }
        } catch (error) {
            console.log(error)
            clientSocket.send(func.getGenericError("test error", error.toString()))
            return true
        }
    }
    return exports
}
