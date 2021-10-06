module.exports = function ({ ocppInterface, databaseInterfaceCharger, constants}) {
    const c = constants.get()

    exports.testSSB = function () {

        console.log("Got test SSB :)")
        ocppInterface.reserveNow(100004, 1, 123, 321, null, function (error, response) {

            console.log("Test result response:" + response)
            console.log("Test result error:" + error)
        })
    }

    exports.testChargerPlus = function () {

        console.log("Got test ChargerPlus :)")
        ocppInterface.reserveNow(100005, 1, 123, 321, null, function (error, response) {

            console.log("Test result response:" + response)
            console.log("Test result error:" + error)
        })
    }

    //test 1
    exports.testFreeCharger = function () {

        console.log("Got test FreeCharger :)")

        databaseInterfaceCharger.updateChargerStatus(100004, c.AVAILABLE, function (error, charger) {
            if (error.length > 0) {
                console.log("Error updating charger status in DB: " + error)
            } else {
                console.log("Charger SSB updated in DB: " + charger.status)
                databaseInterfaceCharger.updateChargerStatus(100005, c.AVAILABLE, function (error, charger) {
                    if (error.length > 0) {
                        console.log("Error updating charger status in DB: " + error)
                    } else {
                        console.log("Charger chargerPlus updated in DB: " + charger.status)
            
                    }
                })
            
            }
        })
    }

    //test 2
    exports.testRemoteStart = function () {

        console.log("Got test RemoteStart :)")
        ocppInterface.remoteStartTransaction(100004, 1, 123, function (error, response) {

            console.log("Test result response:" + response)
            console.log("Test result error:" + error)
        })
    }

    //test 3
    exports.testRemoteStop = function () {

        console.log("Got test RemoteStop :)")
        ocppInterface.remoteStopTransaction(100004, 45698, function (error, response) {

            console.log("Test result response:" + response)
            console.log("Test result error:" + error)
        })
    }

    return exports
}
