var SerialPort = require('serialport');
var Readl = require('@serialport/parser-readline');




// Holding Buffer Allocation List
const mallocate = {
    "Gap": 0,
    "Drive1811": 20,
    "Drive1821": 30,
    "Drive1911": 40,
    "Drive1921": 50,
    "end": 100
}




// Modbus TCP Server
const modbus = require('jsmodbus')
const net = require('net')
const netServer = new net.Server()
const holding = Buffer.alloc(mallocate.end)
const tcpServer = new modbus.server.TCP(netServer, {
    holding: holding
})
netServer.listen(8502)




//  Modbus RTU Client
const rtuOptions = {
    path: 'COM5',
    baudRate: 19200,
}
const rtuSocket = new SerialPort.SerialPort(rtuOptions)
const rtuClient = new modbus.client.RTU(rtuSocket, 1)




getGapUART(SerialPort.SerialPort);




//  Modbus RTU Client Event
rtuSocket.on('open', ()=>{
    console.log('Modbus RTU Client is connected')

    //  Modbus RTU Client Read Holding Register
    setInterval(()=>{

        // on the 100th interval, read to param 18.11 - 18.21
        setTimeout(()=>{
            rtuClient.readHoldingRegisters(1810, 10)
            .then((resp)=>{
                // console.log('Modbus RTU Client Read Drive 18.11', resp.response._body._valuesAsArray)
                for (var i = 0; i < resp.response._body._valuesAsArray.length; i++) {
                    holding.writeUInt16BE(resp.response._body._valuesAsArray[i], mallocate.Drive1811 + i*2)
                }
            })
            .catch((err)=>{
                console.error('Modbus RTU Client Read Drive 18.11 error', err)
            })
        }, 100);

        // on the 200th interval, read to param 18.21 - 18.31
        setTimeout(()=>{
            rtuClient.readHoldingRegisters(1820, 10)
            .then((resp)=>{
                // console.log('Modbus RTU Client Read Drive 18.21', resp.response._body._valuesAsArray)
                for (var i = 0; i < resp.response._body._valuesAsArray.length; i++) {
                    holding.writeUInt16BE(resp.response._body._valuesAsArray[i], mallocate.Drive1821 + i*2)
                }
            })
            .catch((err)=>{
                console.error('Modbus RTU Client Read Drive 18.21 error', err)
            })
        }, 200);

        // on the 300th interval, read to param 19.11 - 19.21
        setTimeout(()=>{
            rtuClient.readHoldingRegisters(1910, 10)
            .then((resp)=>{
                // console.log('Modbus RTU Client Read Drive 19.11', resp.response._body._valuesAsArray)
                for (var i = 0; i < resp.response._body._valuesAsArray.length; i++) {
                    holding.writeUInt16BE(resp.response._body._valuesAsArray[i], mallocate.Drive1911 + i*2)
                }
            })
            .catch((err)=>{
                console.error('Modbus RTU Client Read Drive 19.11 error', err)
            })
        }, 300);

        // on the 400th interval, read to param 19.21 - 19.31
        setTimeout(()=>{
            rtuClient.readHoldingRegisters(1920, 10)
            .then((resp)=>{
                // console.log('Modbus RTU Client Read Drive 19.21', resp.response._body._valuesAsArray)
                for (var i = 0; i < resp.response._body._valuesAsArray.length; i++) {
                    holding.writeUInt16BE(resp.response._body._valuesAsArray[i], mallocate.Drive1921 + i*2)
                }
            })
            .catch((err)=>{
                console.error('Modbus RTU Client Read Drive 19.21 error', err)
            })
        }, 400);

    }, 1000)
})




// Modbus TCP Server Event
tcpServer.on("connection", (client) => {
    console.log("Modbus TCP Client Connected")
})

tcpServer.on('readHoldingRegisters', (request, response, send) => {
    response.body.valuesAsArray = tcpServer.holding.slice(request.start, request.start + request.quantity)
    send(response)
})

tcpServer.on('preWriteSingleRegister', function (value) {
    console.log('Write Single Register')
})

tcpServer.on('WriteSingleRegister', function (value) {
    console.log('New {register, value}:')
})

tcpServer.on('postWriteSingleRegister', function (value) {
    console.log('Write Single Register')
})

tcpServer.on('preWriteMultipleRegisters', function (value) {
    console.log('Write Multiple Registers') 
})

tcpServer.on('WriteMultipleRegisters', function (value) {
    console.log('New {register, value}:')
})

tcpServer.on('postWriteMultipleRegisters', function (value) {
    console.log('Write Multiple Registers')
})

tcpServer.on('writeMultipleCoils', function (value) {
    console.log('Write multiple coils - Existing: ')
})

tcpServer.on('postWriteMultipleCoils', function (value) {
    console.log('Write multiple coils - Complete: ')
})






// Modbus TCP Write Holding Register
// tcpServer.on('writeMultipleRegisters', (request, response, send) => {
//     console.log("writeMultipleRegisters")

//     // if length is more than 10, reject
//     if (request.body.valuesAsArray.length > 10) {
//         response.body.exceptionCode = 0x02
//         send(response)
//         return
//     }
    
//     // if address is between 1810 and 1820, write to drive 18.11
//     if (request.start >= mallocate.Drive1811 && request.start < mallocate.Drive1821) {
//         rtuClient.writeMultipleRegisters(request.start - 20 + 1810, request.body.valuesAsArray)
//         .then((resp)=>{
//             console.log('Modbus RTU Client Write Drive 18.11-20', resp.response._body._valuesAsArray)
//         })
//         .catch((err)=>{
//             console.error('Modbus RTU Client Write Drive 18.11-20 error', err)
//         })
//     }

//     // else, reject
//     else {
//         response.body.exceptionCode = 0x02
//         send(response)
//         return
//     }

// })




function getPortByManufactureName(SerialPort,mfcName){
    console.log(SerialPort)
    return new Promise((resolve,reject)=>{
        SerialPort.list()
            .then((devices)=>{
                console.log("devices", devices)
                var result = [];
                devices.forEach((device)=>{
                    if(device.manufacturer == mfcName){
                        console.log("mfc detected")
                        result.unshift(device.path);
                    }
                });
                resolve(result);
            })
            .catch((err)=>reject(err));
    });
}




function getGapUART(SerialPort){
    getPortByManufactureName(SerialPort, "wch.cn")
    .then((ports)=>{
        // if port is not found, try again in 1 second
        console.log("ports", ports)
        if(ports.length == 0){
            setTimeout(() => getGapUART(),1000);
            console.log("error", {cmd:"SerialPort", value: "Gap1 : UART Disconnect, check USB cable"})
        }

        ports.forEach(port=>{
            console.log("port", port)
            device = new SerialPort({path: port, autoOpen: false, baudRate:115200})
            ddata = device.pipe(new Readl.ReadlineParser());
            device.open((err)=>{
                if(err){ 
                    console.log("error", {cmd:"SerialPort", value: "Gap : Failed to open port"})
                    console.error(err)
                }
            });
            
            ddata.on('data', (data)=>{
                try{
                    var message = JSON.parse(data);
                    if(message.type == "SSIProtocol"){
                        ssiData = message.data;
                        for (var i = 0; i < ssiData.length; i++) {
                            // payload["Gap"+(i+1)] = String(ssiData[i]);
                            tcpServer.holding.writeUInt32BE(ssiData[i], i*4)
                        }
                        // console.log(ssiData)
                    }
                } catch(err){
                    console.log('error', JSON.stringify({cmd:"JSONParse", value: "Gap : Failed to parse data"}));
                    console.error(err)
                    console.error(data)
                }
            });
        });
    })
    .catch((err)=>{
        console.log('error', JSON.stringify({cmd:"SerialPort", value: "Gap : Failed to get manufacture name"}));
        console.error(err)
    });
}