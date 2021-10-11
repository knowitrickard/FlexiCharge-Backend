module.exports = function ({ v, constants }) {
    const c = constants.get()
    
    exports.buildJSONMessage = function (messageArray) {
        const message = []
        messageArray.forEach(i => {
            message.push(i)
        })
        
        return JSON.stringify(message)
    }

    exports.getDataTransferMessage = function (uniqueID, data, isCall) {

        if (isCall) {
            return exports.buildJSONMessage([c.CALL, uniqueID, c.DATA_TRANSFER, data])
        } else {
            // Sending DataTranser as a CALLRESULT is not implemented yet, but the following fields would be required:
            let dataResponse = {
                status: "Accepted",
                data: "Sample response data"
            }
            switch (data.messageId) {

                default:
                    return exports.buildJSONMessage([c.CALL_RESULT, uniqueID, c.DATA_TRANSFER, dataResponse])
            }
        }
    }

    exports.getUniqueId = function (chargerID, action) {
        
        return chargerID.toString() + action.toString() + Date.now().toString()
    }

    exports.getReservationID = function (chargerID, idTag, connectorID) {
        return chargerID.toString() + Date.now().toString() + idTag.toString() + connectorID.toString()
    }

    exports.checkIfValidUniqueID = function (uniqueID) {
        return v.getCallback(uniqueID) != null ? true : false
    }

    exports.getCallResultNotImplemeted = function (uniqueID, operation) {
        return exports.buildJSONMessage([c.CALL_ERROR, uniqueID, c.NOT_IMPLEMENTED, "The *" + operation + "* function is not implemented yet.", {}])
    }

    exports.getGenericError = function (uniqueID, errorDescription) {
        return exports.buildJSONMessage([c.CALL_ERROR, uniqueID, c.GENERIC_ERROR, errorDescription, {}])
    }
    return exports
}