module.exports = function ({ func, constants, v, databaseInterfaceCharger }) {
    const c = constants.get()

    exports.interfaceHandler = function (chargerID, action, dataObject, callback) {

        const socket = v.getConnectedSocket(chargerID)

        if (socket != null) {

            var message = ""

            switch (action) {

                case c.RESERVE_NOW:
                    message = sendReserveNowCall(chargerID, action, dataObject, callback)
                    break
            }

            socket.send(message)

        } else {
            console.log("Got no valid chargerID from API.")
            callback(null, c.INVALID_ID)
        }

    }


    /************************************************************
     * RESERVE NOW FUNCTIONS
    **************************************************************/
    function sendReserveNowCall(chargerID, action, dataObject, callback) {
        let uniqueID = func.getUniqueId(chargerID, action)
        let message = func.buildJSONMessage([
            c.CALL,
            uniqueID,
            c.RESERVE_NOW, 
            {
                connectorID: dataObject.connectorID,
                expiryDate: Date.now()+c.RESERVATION_TIME,
                idTag: dataObject.idTag,
                reservationID: dataObject.reservationID,
                parentIdTag: dataObject.parentIdTag
            }])
        v.addCallback(uniqueID, callback)
        return message

    }

    exports.handleReserveNowResponse = function (chargerID, uniqueID, response) {

        let status = response[c.PAYLOAD_INDEX].status
        console.log("\nGot response on about the reservation from charger"
            + chargerID + ": " + status)
        callback = v.getCallback(uniqueID)
        v.removeCallback(uniqueID)

        if (status == c.ACCEPTED) {

            databaseInterfaceCharger.updateChargerStatus(chargerID, c.RESERVED, function (error, charger) {
                if (error.length > 0) {
                    console.log("Error updating charger status in DB: " + error)
                    callback(c.INTERNAL_ERROR, null)
                } else {
                    console.log("Charger updated in DB: " + charger.status)
                    callback(null, status)
                }
            })
        }else{
            callback(null, status)
        }
    }
    /************************************************************
     * END
    **************************************************************/

    return exports
}

