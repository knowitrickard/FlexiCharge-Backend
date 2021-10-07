var express = require('express')

module.exports = function ({ databaseInterfaceCharger }) {

    const router = express.Router()

    router.get('/', async function (request, response) {

        databaseInterfaceCharger.getChargers(function (error, chargers) {
            if (error.length > 0) {
                response.status(500).json(error)
            } else {
                response.status(200).json(chargers)
            }
        })
    })
    router.get('/available', function (request, response) {

        databaseInterfaceCharger.getAvailableChargers(function (errors, chargers) {
            if (errors.length > 0) {
                response.status(404).json(errors)
            } else {
                response.status(200).json(chargers)
            }
        })
    })

    router.get('/serial/:serialNumber', function (request, response) {

        const serialNumber = request.params.serialNumber
        databaseInterfaceCharger.getChargerBySerialNumber(serialNumber, function (error, charger) {
            if (error.length > 0) {
                response.status(500).json(error)
            } else {
                response.status(200).json(charger)
            }
        })
    })

    router.get('/:id', function (request, response) {

        const id = request.params.id
        databaseInterfaceCharger.getCharger(id, function (errors, charger) {
            if (errors.length == 0 && charger.length == 0) {
                response.status(404).end()
            } else if (errors.length == 0) {
                response.status(200).json(charger)
            } else {
                response.status(500).json(errors)
            }
        })
    })



    router.post('/', function (request, response) {

        const chargerPointId = request.body.chargePointID
        const location = request.body.location
        const serialNumber = request.body.serialNumber;

        databaseInterfaceCharger.addCharger(chargerPointId, serialNumber, location, function (errorCodes, chargerId) {
            if (errorCodes.length == 0) {
                response.status(201).json(chargerId)
            } else {
                if (errorCodes.includes("internalError") || errorCodes.includes("dbError")) {
                    response.status(500).json(errorCodes)
                } else {
                    response.status(404).json(errorCodes)
                }

            }
        })
    })

    router.delete('/:id', function (request, response) {

        const id = request.params.id
        databaseInterfaceCharger.removeCharger(id, function (errors, isChargerDeleted) {
            if (errors.length == 0 && isChargerDeleted) {
                response.status(204).json()
            } else if (errors.length == 0 && !isChargerDeleted) {
                response.status(404).json()
            } else {
                response.status(500).json(errors)
            }
        })
    })

    router.put('/:id', function (request, response) {
        const chargerId = request.params.id
        const newStatus = request.body.status
        databaseInterfaceCharger.updateChargerStatus(chargerId, newStatus, function (errors, charger) {
            if (errors.length == 0) {
                response.status(200).json(charger)
            } else {
                response.status(400).json(errors)
            }
        })
    })


    return router
}