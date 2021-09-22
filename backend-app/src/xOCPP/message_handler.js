module.exports = function({constants, clientHandler}) {

    exports.handleMessage = function(clientSocket, chargerSerial) {
        
        clientSocket.on('message', function incoming(message) {

            if(chargerSerial in constants.getConstants().chargerSerials) {                
                
                handleMessage2(message, clientSocket, null)
                
            } else {
                clientHandler.isValidClient(clientSocket, chargerSerial, function(chargerID){

                    if (chargerID) {
                        handleMessage2(message, clientSocket, chargerID)
                    } else {
                        clientSocket.terminate()
                        console.log("Charger with serial # " + chargerSerial + " was refused connection.\nReason: Charger not found in system.")
            
                    }
                })
            } 
        })
    }
    return exports
}

function handleMessage2(message, clientSocket, chargerID) {
    let request = JSON.parse(message)
        let messageTypeID = request[0]
        let callID = request[1]
        let action = request[2]
        
        console.log("Incoming request call: " + action)

        var response = ""

        switch(messageTypeID) {
            case constants.getConstants().CALL:
                response = callSwitch(request)
                break

            case constants.getConstants().CALLRESULT:
                response = callResultSwitch(request)
                break

            case constants.getConstants().CALLERROR:
                response = callErrorSwitch(request)
                break

            default:
                response = JSON.stringify('[4, ' + callID + ',"GenericError","MessageTypeID is invalid",{}]')
                break
        }
        clientSocket.send(response)
}

function callSwitch(request) {
    let callID = request[1]
    let action = request[2]

    var callResult = ""
    switch(action) {
        case "BootNotification":
            callResult = JSON.stringify('[3,' + callID + ',{"status":"Accepted","currentTime":' + new Date().toISOString() + ',"interval":86400}]')
            break
        default:
            callResult = JSON.stringify('[4, ' + callID + ',"NotImplemented","This function is not implemented.",{}]')
            break
        }

    return callResult
}

function callResultSwitch(response) {
    let callID = response[1]
    let callCode = callID.substring(0,3)
    let chargerID = callID.substring(4,9)

    var callResult = ""
    switch(callCode) {
        default:
            callResult = JSON.stringify('[4, ' + callID + ',"NotImplemented","This function is not implemented.",{}]') 
            break
    }
    return callResult
}

function callErrorSwitch(response) {
    let callID = response[1]
    let callCode = callID.substring(0,3)
    let chargerID = callID.substring(4,9)

    var callResult = ""
    switch(callCode) {
        default:
            callResult = JSON.stringify('[4, ' + callID + ',"NotImplemented","This function is not implemented.",{}]') 
        break
    }

    return callResult
}