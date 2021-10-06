const awilix = require('awilix')
const container = awilix.createContainer()

container.register({

    //Data access layers
    dataAccessLayerCharger: awilix.asFunction(require('./data-access-layer/databse/charger-repository')),
    dataAccessLayerReservation: awilix.asFunction(require('./data-access-layer/databse/reservation-repository')),
    dataAccessLayerTransaction: awilix.asFunction(require('./data-access-layer/databse/transaction-repository')),
    dataAccessLayerChargePoint: awilix.asFunction(require('./data-access-layer/databse/charge-point-repository')),
    dataAccessLayerKlarna: awilix.asFunction(require('./data-access-layer/billing/klarna-repository')),
    databaseInit: awilix.asFunction(require('./data-access-layer/databse/db')),

    //Database error
    dbErrorCheck: awilix.asFunction(require('./database-Interface/error/database-error-check')),

    //Business logic layers
    databaseInterfaceCharger: awilix.asFunction(require('./database-Interface/interfaces/database-interface-charger')),
    databaseInterfaceTransactions: awilix.asFunction(require('./database-Interface/interfaces/database-interface-transaction')),
    databaseInterfaceReservations: awilix.asFunction(require('./database-Interface/interfaces/database-interface-reservations')),
    databaseInterfaceChargePoint: awilix.asFunction(require('./database-Interface/interfaces/database-interface-charge-point')),

    //Validation
    chargerValidation: awilix.asFunction(require("./database-Interface/validation/chargerValidation")),
    transactionValidation: awilix.asFunction(require("./database-Interface/validation/transactionValidation")),
    reservationValidation: awilix.asFunction(require("./database-Interface/validation/reservationValidation")),
    chargePointValidation: awilix.asFunction(require("./database-Interface/validation/chargePointValidation")),

    //Presentation layers
    chargersRouter: awilix.asFunction(require('./presentation-layer/chargers-router-api')),
    transactionsRouter: awilix.asFunction(require('./presentation-layer/transactions-router-api')),
    reservationsRouter: awilix.asFunction(require('./presentation-layer/reservations-router-api')),
    authenticationRouter: awilix.asFunction(require('./presentation-layer/authentication-router-api')),

    databaseTestRouter: awilix.asFunction(require('./presentation-layer/database-test')), //Remove for production

    //ocpp
    ocpp: awilix.asFunction(require('./xOCPP/server_ocpp')),


    app: awilix.asFunction(require('./presentation-layer/app'))
})

const app = container.resolve("app")
const ocpp = container.resolve("ocpp")

ocpp.startServer()

app.listen(8080)