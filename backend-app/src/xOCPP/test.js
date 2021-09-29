module.exports = function ({ ocppInterface, databaseInterfaceCharger }) {


    exports.testSSB = function () {

        console.log("Got test :)")
        ocppInterface.reserveNow(100004, 1, 123, 321, null, function (error, response) {

            console.log("Test result response:" + response)
            console.log("Test result error:" + error)
        })
    }

    exports.testChargerPlus = function () {

        console.log("Got test :)")
        ocppInterface.reserveNow(100005, 1, 123, 321, null, function (error, response) {

            console.log("Test result response:" + response)
            console.log("Test result error:" + error)
        })
    }

    return exports
}