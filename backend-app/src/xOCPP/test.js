module.exports = function ({ ocppInterface, databaseInterfaceCharger, constants}) {
    const c = constants.get()   

    //test 1
    exports.testFreeCharger = function (chargerID) {

        console.log("Got test FreeCharger :)")

        databaseInterfaceCharger.updateChargerStatus(chargerID, c.AVAILABLE, function (error, charger) {
            if (error.length > 0) {
                console.log("\nError updating charger status in DB: " + error)
            } else {
                console.log("\nCharger "+chargerID+ " updated in DB: " + charger.status)
            }
        })
    }

    //test 2
    exports.testRemoteStart = function (chargerID) {

        console.log("Got test RemoteStart :)")
        ocppInterface.remoteStartTransaction(chargerID, c.CONNECTOR_ID, c.ID_TAG, function (error, response) {
            if (error != null) {
                console.log("\nError updating charger status in DB: " + error)
            } else {
                console.log("\nTest result response: " + response)
            }
        })
    }

    //test 3
    exports.testRemoteStop = function (chargerID) {

        console.log("Got test RemoteStop :)")
        ocppInterface.remoteStopTransaction(chargerID, c.TRANSACTION_ID, function (error, response) {
            if (error != null) {
                console.log("\nError updating charger status in DB: " + error)
            } else {
                console.log("\nTest result response: " + response)
            }
        })
    }

    // test 4
    exports.testReserveNow = function (chargerID) {

        console.log("Got test ReserveNow :)")
        ocppInterface.reserveNow(chargerID, c.CONNECTOR_ID, c.ID_TAG, c.RESERVATION_ID, c.PARENT_ID_TAG, function (error, response) {
            if (error != null) {
                console.log("\nError updating charger status in DB: " + error)
            } else {
                console.log("\nTest result response: " + response)
            }
        })
    }

    return exports
}
