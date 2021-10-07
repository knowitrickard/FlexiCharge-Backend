const https = require('https')

module.exports = function({}) {
    const KLARNA_URI = "api.playground.klarna.com"
    const exports = {}

    exports.getNewKlarnaPaymentSession = async function(userID, chargerID, chargePoint, callback) {

        if (chargePoint.klarnaReservationAmount > 0) {
            const data = new TextEncoder().encode(
                JSON.stringify({
                    "purchase_country": "SE",
                    "purchase_currency": "SEK",
                    "locale": "sv-SE",
                    "order_amount": chargePoint.klarnaReservationAmount,
                    "order_tax_amount": 0,
                    "order_lines": getOrderLines(chargePoint.klarnaReservationAmount)
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
                        const responseData = JSON.parse(jsonResponse);
                        callback([], responseData)
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

    exports.createKlarnaOrder = async function(transactionId, klarnaReservationAmount, authorization_token, callback) {
        const data = new TextEncoder().encode(
            JSON.stringify({
                "purchase_country": "SE",
                "purchase_currency": "SEK",
                "status": "CHECKOUT_INCOMPLETE",
                "order_amount": klarnaReservationAmount,
                "order_tax_amount": 0,
                "order_lines": getOrderLines(klarnaReservationAmount)
            })
        )

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
                result.on('data', jsonKlarnaOrder => {
                    const klarnaOrder = JSON.parse(jsonKlarnaOrder);
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


    exports.finalizeKlarnaOrder = async function(transaction, transactionId, klarnaReservationAmount, callback) {
        const newOrderAmount = Math.round(transaction.pricePerKwh * transaction.kwhTransfered);
        const order_lines = getOrderLines(klarnaReservationAmount)

        order_lines[0].total_amount = newOrderAmount;
        order_lines[0].unit_price = newOrderAmount;


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
            if (result.statusCode == 204) {
                callback([], [])
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

    function getOrderLines(klarnaReservationAmount) {
        const order_lines = [{
            "type": "digital",
            "name": "Electrical Vehicle Charging",
            "quantity": 1,
            "unit_price": klarnaReservationAmount,
            "tax_rate": 0,
            "total_amount": klarnaReservationAmount,
            "total_discount_amount": 0,
            "total_tax_amount": 0
        }]

        return order_lines

    }
    return exports
}