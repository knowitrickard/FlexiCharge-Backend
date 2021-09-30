const databaseInterface = require('../database-interface-charger');

  //mock data access layer for charger
  jest.mock('../../data-access-layer/charger-repository', () => ({
    getChargers: (callback) => callback([], "hejhej"),
    getCharger: (chargerId, callback) => callback(),
    getChargerBySerialNumber: (serialNumber, callback) => callback(),
    getAvailableChargers: (callback) => callback(),
    addCharger: (chargePointId, serialNumber, location, callback) => callback(),
    removeCharger: (chargerId, callback) => callback(),
    updateChargerStatus: (chargerId, status, callback) => callback()
  }));

  //mock db error check
  jest.mock('../error/database-error-check', () => ({
    checkError: (error, callback) => {},
  }));

  //mock charger validation
  jest.mock('../validation/chargerValidation', () => ({
    getAddChargerValidation: (location, serialNumber) => [],
    getChargerBySerialNumberValidation: (serialNumber) => [],
    getUpdateChargerStatusValidation: (status) => [],
  }));

 
      test('Get chargers', () => {
       // expect(databaseInterface).toHaveProperty('getChargers');
    
        databaseInterface.getChargers(function(error, chargers) {
          expect(Object.keys(error).length).toBe(0);
        })
      });

  