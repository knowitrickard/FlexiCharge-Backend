module.exports = function({}) {
    /*
        "Available",
        "Preparing",
        "Charging",
        "SuspendedEVSE",
        "SuspendedEV",
        "Finishing",
        "Reserved",
        "Unavailable",
        "Faulted"
    */
    //Status codes 
    const statusCodes = ["Available", "Preparing", "Charging", "SuspendedEVSE", "SuspendedEV", "Finishing", "Reserved", "Unavailable", "Faulted"]

    //Validation for location
    LONGITUDE_MIN_VALUE = -180
    LONGITUDE_MAX_VALUE = 180
    LATITUDE_MIN_VALUE = -90
    LATITUDE_MAX_VALUE = 90

    //Validation for serial number
    SERIAL_NUMBER_MIN_VALUE = 1
    SERIAL_NUMBER_MAX_VALUE = 36



    const exports = {}

    exports.getAddChargerValidation = function(location, serialNumber) {

        const validationErrors = []

        if (location === undefined) {
            validationErrors.push("invalidLocation")
        } else {
            if ((location instanceof Array) == false || (typeof location[0] !== 'number') || (typeof location[1] !== 'number')) {
                validationErrors.push("invalidDataType")
            }
            if (location[0] < LATITUDE_MIN_VALUE || location[0] > LATITUDE_MAX_VALUE) {
                validationErrors.push("invalidLatitude")
            }
            if (location[1] < LONGITUDE_MIN_VALUE || location[1] > LONGITUDE_MAX_VALUE) {
                validationErrors.push("invalidLongitude")
            }
        }
        if (serialNumber === undefined) {
            validationErrors.push("invalidSerialNumber")
        } else {
            if (typeof serialNumber !== 'string') {
                validationErrors.push("invalidDataType")
            }
            if (serialNumber.length < SERIAL_NUMBER_MIN_VALUE || serialNumber.length > SERIAL_NUMBER_MAX_VALUE) {

                validationErrors.push("invalidSerialNumber")
            }
        }


        return validationErrors
    }

    exports.getChargerBySerialNumberValidation = function(serialNumber) {
        const validationErrors = []

        if (serialNumber === undefined) {
            validationErrors.push("invalidSerialNumber")
        } else {
            if (typeof serialNumber !== 'string') {
                validationErrors.push("invalidDataType")
            }
            if (serialNumber.length < SERIAL_NUMBER_MIN_VALUE || serialNumber.length > SERIAL_NUMBER_MAX_VALUE) {
                validationErrors.push("invalidSerialNumber")
            }
        }


        return validationErrors
    }

    exports.getUpdateChargerStatusValidation = function(status) {
        const ValidationErrors = []

        if (status === undefined) {
            ValidationErrors.push("invalidStatus")
        } else {
            if (typeof status !== 'string') {
                ValidationErrors.push("invalidDataType")
            }
            if (!statusCodes.includes(status)) {
                ValidationErrors.push("invalidStatus")
            }
        }

        return ValidationErrors
    }

    return exports

}