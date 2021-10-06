module.exports = function ({ v, constants }) {
    const c = constants.get()
    
    exports.buildJSONMessage = function (messageArray) {
        const message = []
        messageArray.forEach(i => {
            message.push(i)
        })
        
        return JSON.stringify(message)
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