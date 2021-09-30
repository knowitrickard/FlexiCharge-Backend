module.exports = function ({ databaseInterfaceCharger, messageHandler, v, constants, func, test }) {
    const c = constants.get()
    exports.handleClient = function (clientSocket, chargerSerial) {

        var messageCache = ""

        isValidClient(clientSocket, chargerSerial, function (chargerID) {
            if (chargerID) {
                console.log("Charger with ID: " + chargerID + " connected to the system.")
                console.log("Number of connected chargers: " + v.getLengthConnectedSockets() + " (" + v.getLengthChargerSerials() + ")" + " (" + v.getLengthChargerIDs() + ")")
                if (messageCache != "") {

                    /*****************************************
                    used for internal testing, remove before production
                    *****************************************/
                    let data = JSON.parse(messageCache)
                    let messageTypeID = data[0]

                    if (messageTypeID == c.SSB) {
                        test.testSSB()
                    }
                    else if (messageTypeID == c.CHARGER_PLUS) {
                        test.testChargerPlus()
                    }
                    /*****************************************/

                    else{
                        messageHandler.handleMessage(messageCache, clientSocket, chargerID)
                    }

                }

            } else {
                console.log("Charger with serial # " + chargerSerial + " was refused connection.\nReason: Charger not found in system.")
                let message = func.buildJSONMessage([c.CALL_ERROR, 1337, c.SECURITY_ERROR,
                    "Serial number was not found in database GTFO", {}])
                clientSocket.send(message)
                clientSocket.terminate()
            }
        })

        clientSocket.on('message', function incoming(message) {

            if (v.isInChargerSerials(chargerSerial)) {

                /*****************************************
                 used for internal testing, remove before production
                *****************************************/
                let data = JSON.parse(message)
                let messageTypeID = data[0]

                if (messageTypeID == c.SSB) {
                    test.testSSB()
                }
                else if (messageTypeID == c.CHARGER_PLUS) {
                    test.testChargerPlus()
                }
                /*****************************************/

                else {
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
            } else {

                if (charger.length != 0) {
                    let chargerID = charger.chargerID

                    // Save the websocket with the charger's serial in array:
                    v.addConnectedSockets(chargerID, newSocket)
                    v.addChargerSerials(chargerSerial)
                    v.addChargerIDs(chargerSerial, chargerID)

                    callback(chargerID)
                } else {
                    callback(false)
                }
            }
        })
    }

    return exports
}
