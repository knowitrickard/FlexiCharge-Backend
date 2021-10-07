const { truncate } = require('fs/promises');
const { Sequelize, DataTypes } = require('sequelize');

// const sequelize = new Sequelize('postgres', 'postgres', 'postgres', {
//     host: 'flexicharge.cqjgliexpw2a.eu-west-1.rds.amazonaws.com',
//     dialect: "postgres"
// });
const sequelize = new Sequelize('postgres://postgres:abc123@postgre_db:5432/postgredb')

//sequelize.query('CREATE EXTENSION IF NOT EXISTS postgis', { raw: true })

try {
    sequelize.authenticate();
    console.log('Connection has been established successfully.');
} catch (error) {
    console.error('Unable to connect to the database:', error);
}


const Chargers = sequelize.define('Chargers', {
    chargerID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    location: {
        type: DataTypes.ARRAY(DataTypes.FLOAT),
        unique: false,
        allowNull: false
    },
    serialNumber: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: false
});

const Reservations = sequelize.define('Reservations', {
    reservationID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    start: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    end: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    userID: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: false
});

const Transactions = sequelize.define('Transactions', {
    transactionID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    isKlarnaPayment: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    kwhTransfered: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    currentChargePercentage: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    pricePerKwh: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    timestamp: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    paymentID: {
        type: DataTypes.STRING,
        allowNull: true
    },
    userID: {
        type: DataTypes.STRING,
        allowNull: true
    },
    payment_method_categories: {
        type: DataTypes.ARRAY(DataTypes.JSON),
        allowNull: true
    },
    session_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    client_token: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    paymentConfirmed: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    }
}, {
    timestamps: false
});

const ChargePoints = sequelize.define('ChargePoints', {
    chargePointID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    location: {
        type: DataTypes.ARRAY(DataTypes.FLOAT),
        unique: false,
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        unique: false,
        allowNull: false
    },
    klarnaReservationAmount: {
        type: DataTypes.INTEGER,
        unique: false,
        allowNull: false
    },
}, {
    timestamps: false
});

Reservations.hasOne(Reservations, { foreignKey: 'chargerID', onDelete: 'cascade' })
Reservations.belongsTo(Chargers, { foreignKey: 'chargerID', onDelete: 'cascade' })

// Transactions.hasOne(Transactions, { foreignKey: 'chargerID', onDelete: 'cascade' })
Transactions.belongsTo(Chargers, { foreignKey: 'chargerID', onDelete: 'cascade' })

// Chargers.hasOne(Chargers, { foreignKey: 'chargePointID', onDelete: 'cascade' })
Chargers.belongsTo(ChargePoints, { foreignKey: 'chargePointID', onDelete: 'cascade' })

sequelize.sync({ force: true }).then(function() {
    ChargePoints.findAndCountAll().then(function({ rows, count }) {
        if (count < 1) {
            ChargePoints.create({
                name: 'Jönköping University',
                location: [57.777714, 14.163010],
                price: 44.52,
                klarnaReservationAmount: 30000
            });
            // Chargers.create({
            //     chargerID: 100000,
            //     location: [57.777714, 14.163012],
            //     serialNumber: 'abc123',
            //     status: '1',
            //     chargePointID: 1
            // });
            // Chargers.create({
            //     chargerID: 100001,
            //     location: [57.777714, 14.163016],
            //     serialNumber: '123abc',
            //     status: '0',
            //     chargePointID: 1
            // });
            Transactions.create({
                paymentID: null,
                userID: "1",
                timestamp: 1631522252,
                isKlarnaPayment: true,
                kwhTransfered: 5,
                currentChargePercentage: 20,
                pricePerKwh: 44.66
            });
            Reservations.create({
                chargerID: 1,
                userID: 1,
                start: 164966755,
                end: 164968555
            });
        }
    })
})

module.exports = function({}) {
    const exports = { Chargers, Transactions, Reservations, ChargePoints }
    return exports
}