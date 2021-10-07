const https = require('https')

module.exports = function({}) {
    const KLARNA_URI = "api.playground.klarna.com"
    const exports = {}

    exports.getNewKlarnaPaymentSession = async function(userID, chargerID, chargePoint, order_lines, callback) {

        if (chargePoint.klarnaReservationAmount > 0) {
            const data = new TextEncoder().encode(
                JSON.stringify({
                    "purchase_country": "SE",
                    "purchase_currency": "SEK",
                    "locale": "sv-SE",
                    "order_amount": chargePoint.klarnaReservationAmount,
                    "order_tax_amount": 0,
                    "order_lines": order_lines
                })
            )
            console.log(Buffer.from(data).toString());

            const options = {
                hostname: KLARNA_URI,
                port: 443,
                path: "/payments/v1/sessions",
                method: "POST",
                headers: {
                    "Authorization": "Basic " + Buffer.from("PK44810_1f4977848b52" + ":" + "AcYW9rvNuy2YpZgX").toString("base64"),
                    "Content-Type": "application/json"
                }
            }

            const request = https.request(options, result => {
                if (result.statusCode == 200) {
                    result.on('data', jsonResponse => {
                        responseData = JSON.parse(jsonResponse);

                        callback([], jsonResponse)
                    })
                } else {
                    switch (result.statusCode) {
                        case 400: // 	We were unable to create a session with the provided data. Some field constraint was violated.
                            callback(["klarnaError403"], [])
                            break;
                        case 403: // 	You were not authorized to execute this operation.
                            callback(["klarnaError404"], [])
                            break;
                        default:
                            callback(["klarnaError"], [])
                    }
                }
            })

            request.on('error', error => {
                console.log(error)
                callback(["klarnaError"], [])
            })

            request.write(data)
            request.end()
        } else {
            callback(["dbError"], [])
        }

    }

    exports.createKlarnaOrder = async function(transactionId, authorization_token, order_lines, billing_address, shipping_address, callback) { //TODO, THIS FUNCTION IS ONLY A START AND NEEDS TO BE IMPROVED AND TESTED
        const data = new TextEncoder().encode(
            JSON.stringify({
                "purchase_country": "SE",
                "purchase_currency": "SEK",
                "status": "CHECKOUT_INCOMPLETE",
                "order_amount": 300, //chargePoint.klarnaReservationAmount,
                "order_tax_amount": 0,
                "order_lines": order_lines,
                "billing_address": billing_address,
                "shipping_address": shipping_address,
            })
        )
        console.log(Buffer.from(data).toString());

        const options = {
            hostname: KLARNA_URI,
            port: 443,
            path: `/payments/v1/authorizations/${authorization_token}/order`,
            method: "POST",
            headers: {
                "Authorization": "Basic " + Buffer.from("PK44810_1f4977848b52" + ":" + "AcYW9rvNuy2YpZgX").toString("base64"),
                "Content-Type": "application/json"
            }
        }

        const request = https.request(options, result => {
            if (result.statusCode == 200) {
                result.on('data', klarnaOrder => {
                    callback([], klarnaOrder)
                })
            } else {
                switch (result.statusCode) {
                    case 400: //	We were unable to create an order with the provided data. Some field constraint was violated.
                        callback(["klarnaError400"], [])
                        break
                    case 401: //	You were not authorized to execute this operation.
                        callback(["klarnaError401"], [])
                        break
                    case 404: // The authorization does not exist.
                        callback(["klarnaError404"], [])
                        break
                    case 409: // The data in the request does not match the session for the authorization.
                        callback(["klarnaError404"], [])
                        break
                    default:
                        callback(["klarnaError"], [])
                }
            }
        })

        request.on('error', error => {
            console.log(error)
            callback(["klarnaError"], [])
        })

        request.write(data)
        request.end()


    }


    exports.finalizeKlarnaOrder = async function(transaction, transactionId, order_lines, callback) {
        const newOrderAmount = Math.round(transaction.pricePerKwh * transaction.kwhTransfered);

        // TODO: Update the klarna order with the correct amount and capture it.
        order_lines[0].total_amount = newOrderAmount;
        order_lines[0].unit_price = newOrderAmount;
        console.log(order_lines)

        updateOrder(transaction, order_lines, function(error, responseData) {

            if (error.length == 0) {
                captureOrder(transaction, function(error) {
                    if (error.length == 0) {
                        callback([], responseData) //capture does not response with anything so we callback the response data from the update.
                    } else {
                        callback(error, [])
                    }
                })
            } else {
                callback(error, [])
            }
        })

    }

    function updateOrder(transaction, order_lines, callback) {

        const data = new TextEncoder().encode(
            JSON.stringify({
                "purchase_country": "SE",
                "purchase_currency": "SEK",
                "locale": "sv-SE",
                "order_tax_amount": 0,
                "order_lines": order_lines,
                "order_amount": Math.round(transaction.pricePerKwh * transaction.kwhTransfered)
            })
        )
        console.log(Buffer.from(data).toString());

        const options = {
            hostname: KLARNA_URI,
            port: 443,
            path: "/ordermanagement/v1/orders/" + transaction.paymentID + "/authorization",
            method: "PATCH",
            headers: {
                "Authorization": "Basic " + Buffer.from("PK44810_1f4977848b52" + ":" + "AcYW9rvNuy2YpZgX").toString("base64"),
                "Content-Type": "application/json"
            }
        }

        const request = https.request(options, result => {
            if (result.statusCode == 200) {
                result.on('data', jsonResponse => {
                    responseData = JSON.parse(jsonResponse);
                    callback([], [responseData])
                })
            } else {
                switch (result.statusCode) {
                    case 400: //We were unable to update an order with the provided data. Some field constraint was violated.
                        callback(["klarnaError400"], [])
                        break
                    case 401: //You were not authorized to execute this operation.
                        callback(["klarnaError401"], [])
                        break
                    case 403: //You tried to modify a read only resource.
                        callback(["klarnaError403"], [])
                        break;
                    case 404: //We did not find any order with given ID. You need to create a new order.
                        callback(["klarnaError404"], [])
                        break;
                    default:
                        callback(["klarnaError"], [])
                }
            }
        })

        request.on('error', error => {
            console.log(error)
            callback(["klarnaError"], [])
        })

        request.write(data)
        request.end()

    }

    function captureOrder(transaction, callback) {

        const captureData = new TextEncoder().encode(
            JSON.stringify({
                "captured_amount": Math.round(transaction.pricePerKwh * transaction.kwhTransfered)
            })
        )
        console.log(Buffer.from(captureData).toString());

        const captureOptions = {
            hostname: KLARNA_URI,
            port: 443,
            path: "/ordermanagement/v1/orders/" + transaction.paymentID + "/captures",
            method: "POST",
            headers: {
                "Authorization": "Basic " + Buffer.from("PK44810_1f4977848b52" + ":" + "AcYW9rvNuy2YpZgX").toString("base64"),
                "Content-Type": "application/json"
            }
        }

        const request = https.request(captureOptions, result => {
            if (result.statusCode == 200) {
                result.on('data', jsonResponse => {
                    responseData = JSON.parse(jsonResponse);
                    callback([])
                })
            } else {
                switch (result.statusCode) {
                    case 403: // Capture not allowed.
                        callback(["klarnaError403"], [])
                        break;
                    case 404: // 	Order not found.
                        callback(["klarnaError404"], [])
                        break;
                    default:
                        callback(["klarnaError"], [])

                }
            }
        })

        request.on('error', error => {
            console.log(error)
            callback(["klarnaError"], [])
        })

        request.write(captureData)
        request.end()
    }





    return exports
}