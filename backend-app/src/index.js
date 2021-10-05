const awilix = require('awilix')
const container = awilix.createContainer()

container.register({

    //Data access layers
    dataAccessLayerCharger: awilix.asFunction(require('./data-access-layer/charger-repository')),
    dataAccessLayerReservation: awilix.asFunction(require('./data-access-layer/reservation-repository')),
    dataAccessLayerTransaction: awilix.asFunction(require('./data-access-layer/transaction-repository')),
    dataAccessLayerChargePoint: awilix.asFunction(require('./data-access-layer/charge-point-repository')),

    //Business logic layers
    databaseInterfaceCharger: awilix.asFunction(require('./database-Interface/database-interface-charger')),
    databaseInterfaceTransactions: awilix.asFunction(require('./database-Interface/database-interface-transaction')),
    databaseInterfaceReservations: awilix.asFunction(require('./database-Interface/database-interface-reservations')),
    databaseInterfaceChargePoint: awilix.asFunction(require('./database-Interface/database-interface-charge-point')),
    databaseInit: awilix.asFunction(require('./data-access-layer/db')),
    //Database error
    dbErrorCheck: awilix.asFunction(require('./database-Interface/error/database-error-check')),

    //Validation
    chargerValidation: awilix.asFunction(require("./database-Interface/validation/chargerValidation")),
    transactionValidation: awilix.asFunction(require("./database-Interface/validation/transactionValidation")),
    reservationValidation: awilix.asFunction(require("./database-Interface/validation/reservationValidation")),
    chargePointValidation: awilix.asFunction(require("./database-Interface/validation/chargePointValidation")),

    //Presentation layers
    chargePointsRouter: awilix.asFunction(require('./presentation-layer/charge-point-router-api')),
    chargersRouter: awilix.asFunction(require('./presentation-layer/chargers-router-api')),
    transactionsRouter: awilix.asFunction(require('./presentation-layer/transactions-router-api')),
    reservationsRouter: awilix.asFunction(require('./presentation-layer/reservations-router-api')),
    authenticationRouter: awilix.asFunction(require('./presentation-layer/authentication-router-api')),
    adminRouter: awilix.asFunction(require('./presentation-layer/admin-router-api')),

    //ocpp
    ocpp: awilix.asFunction(require('./xOCPP/server_ocpp')),
    ocppInterface: awilix.asFunction(require('./xOCPP//interface')),
    clientHandler: awilix.asFunction(require('./xOCPP/client_handler')),
    messageHandler: awilix.asFunction(require('./xOCPP/message_handler')),
    constants: awilix.asFunction(require('./xOCPP/constants')),
    //v is for variables
    v: awilix.asFunction(require('./xOCPP/variables')),
    func: awilix.asFunction(require('./xOCPP/global_functions')),
    test: awilix.asFunction(require('./xOCPP/test')),

    app: awilix.asFunction(require('./presentation-layer/app'))
})

const app = container.resolve("app")
const ocpp = container.resolve("ocpp")

ocpp.startServer()


app.listen(8080)