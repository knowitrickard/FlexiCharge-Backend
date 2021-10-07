module.exports = function({}) {

    //Validation for Charge Precentage
    MAX_CHARGE_PRECENTAGE = 100
    MIN_CHARGE_PRECENTAGE = 0

    //Validation for Kwh Price
    MIN_KWH_PRICE = 0

    //Validation for Transfered Kwh
    MIN_TRANSFERED_KWH = 0

    //Validation for payment_method_categories
    MIN_PAYMENT_METHOD_CATEGORIES = 1

    //Validation for session_id
    MIN_SESSION_ID = 1

    //Validation for client_token
    MIN_CLIENT_TOKEN = 1

    const exports = {}

    exports.getAddTransactionValidation = function(currentChargePercentage, pricePerKwh) {
        const validationErrors = []

        if (pricePerKwh < MIN_KWH_PRICE) {
            validationErrors.push("invalidKwhPrice")
        }

        return validationErrors
    }

    exports.getUpdateTransactionChargingStatus = function(kwhTransfered, currentChargePercentage) {
        const validationErrors = []

        if (currentChargePercentage < MIN_CHARGE_PRECENTAGE) {
            validationErrors.push("invalidChargePrecentage")
        }
        if (currentChargePercentage > MAX_CHARGE_PRECENTAGE) {
            validationErrors.push("invalidChargePrecentage")
        }
        if (kwhTransfered < MIN_TRANSFERED_KWH) {
            validationErrors.push("invalidTransferedKwh")
        }

        return validationErrors
    }

    exports.addKlarnaTransactionValidation = function(session_id, client_token, payment_method_categories) {

        const validationErrors = []

        if (session_id === undefined) {
            validationErrors.push("invalidSessionID")
        } else {
            if (typeof session_id !== 'string') {
                validationErrors.push("invalidDataType")
            }
            if (session_id.length < MIN_SESSION_ID) {
                validationErrors.push("invalidSessionID")
            }
        }

        if (client_token === undefined) {
            validationErrors.push("invalidClientToken")
        } else {
            if (typeof client_token !== 'string') {
                validationErrors.push("invalidDataType")
            }
            if (client_token.length < MIN_CLIENT_TOKEN) {
                validationErrors.push("invalidClientToken")
            }
        }

        if (payment_method_categories === undefined) {
            validationErrors.push("invalidPaymentMethodCategories")
        } else {
            if ((payment_method_categories instanceof Array) == false) {
                validationErrors.push("invalidDataType")
            }
            if (payment_method_categories < MIN_PAYMENT_METHOD_CATEGORIES) {
                validationErrors.push("invalidPaymentMethodCategories")
            }
        }

        return validationErrors
    }

    return exports
}