# FlexiCharge-Backend

# Start app
- cd /FlexiCharge-Backend
- docker-compose up

# Add packages
- cd /FlexiCharge-Backend/backend-app
- npm install "package name"

# Access database
- Add awilix variable to the module.exports function. 
```
module.exports = function({ databaseInterfaceCharger}) {

}
```
- Then you can access the methods. e.g. "getChargers". 
```
module.exports = function({ databaseInterfaceCharger}) {

   databaseInterfaceCharger.getChargers(function(errors, chargers) {
   

   })

}
```
# Connect to local database
  - Host: 127.0.0.1
  - Port: 5432
  - Username: postgres
  - Password: abc123
## Awilix variables and methods
- databaseInterfaceCharger
  - addCharger(chargerPointId: int, function(errors, chargerId))
  - getCharger(chargerId: int, function(errors, charger))
  - removeCharger(chargerId: int, function(errors, chargerRemoved: bool)) 
  - updateChargerStatus(chargerId: int, status: int, function(errors, updatedCharger)) //status: 0: Occupied, 1: Available, 2: Reserved, 3: Faulty
  - getChargers(function(errors, chargers)) 
  - getAvailableChargers(function(errors, availableChargers))
  - getChargerBySerialNumber(serialNumber:string,function(error, charger)) //OCPP Only
- databaseInterfaceTransaction
  - addTransaction(userId: int, chargerId: int, MeterStartValue: int, function(errors, transactionId))
  - getTransaction(transactionId: int, function(errors, transaction))
  - getTransactionsForUser(userId: int, function(errors, transactions))
  - getTransactionsForCharger(chargerId: int, function(errors, transactions))
  - updateTransactionPayment(transactionId: int, paymentId: int))
  - updateTransactionMeter(transactionId: int, meterValue: int))
- databaseInterfaceReservations
  - addReservation(chargerId: int, userId: int, start: int, stop: int, function(errors, reservation))
  - getReservation(reservationId: int, function(errors, reservation))
  - getReservationForUser(userId: int, function(errors, reservations))
  - getReservationForCharger(chargerId: int, function(errors, reservations))
  - removeReservation(reservationId: int, function(errors, reservationRemoved: bool))


## Database Interface Errorcodes and explanation
- internalError: General internal error
- dbError: General database error
- dbForeignKeyConstraintError: Specified foreign key doesn´t match a primary key
- dbUniqueConstraintError: A unique constraint has been violated
