module.exports = function({}){

    exports.get = function() {
        
        const constants = {
            INVALID_ID: "InvalidId",
            SSB: 0,
            CHARGER_PLUS: 1,
            TEST: 999,

            HEART_BEAT_INTERVALL: 86400, //24h
            RESERVATION_TIME: 15, //15sec

            CALL: 2,
            CALL_RESULT: 3,
            CALL_ERROR: 4,

            BOOT_NOTIFICATION: "BootNotification",
            START_TRANSACTION: "startTransaction",
            STOP_TRANSACTION: "stopTransaction",
            INTERNAL_ERROR: "InternalError",
            NOT_IMPLEMENTED: "NotImplemented",
            GENERIC_ERROR: "GenericError",
            SECURITY_ERROR: "SecurityError",
            RESERVE_NOW: "ReserveNow",
            ACCEPTED: "Accepted",
            FAULTED: "Faulted",
            OCCUPIED: "Occupied",
            REJECTED: "Rejected",
            UNAVAILABLE: "Unavailable"

            
        }

        return constants
    }



    return exports
}