var fs = require('fs');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var curentRoom = './data/curentRoom.json';


// Liefert die Liste der aktuellen Rauminhalte für den Request
function getList () {
    var data = readFile();
    return data;
}

// Liest die Datei aus in der sich die dokumentierten aktuellen Rauminhalte befinden
function readFile () {
    var data;
    data = fs.readFileSync(curentRoom, 'utf8');
    if (data != "") {
	   return JSON.parse(data);
    } else {
        return data;
    }
}


// Schreibt Änderungen der Rauminhalte in die Datei fest
function writeFile (data) {
    var testdata = data
    var curentData = readFile(curentRoom);
    var tmp = {"data":[]};
    if (curentData.data.length > 0) {
        curentData.data.push(testdata);
        fs.writeFileSync(curentRoom, JSON.stringify(curentData));
        console.log('Data saved: ' + JSON.stringify(curentData));
    } else {
        tmp.data.push(testdata);
        fs.writeFileSync(curentRoom, JSON.stringify(tmp));
        console.log('Data saved: ' + JSON.stringify(tmp));
    }
}


// Reagiert auf Meldungen durch den RFID Scanner (simuliert) und aktualisiert die Liste mit Rauminhalten
function updateList (item) {

    var curentData = readFile();
    item = JSON.parse(item);
    var check = false;
    for (var i = 0; i < curentData.data.length; i++) {
        if (parseInt(item.id) == parseInt(JSON.stringify(curentData.data[i].id))) { // Wenn der Gegenstand bereits in der Liste vorhanden ist
            check = true; 
            curentData.data.splice(i,1);
            fs.writeFileSync(curentRoom, JSON.stringify(curentData));
	    console.log('');
            console.log("Removed: " + JSON.stringify(item));
            sendList();
            break;
        }
    }
    if (check === false) { // Wenn der Gegenstand noch nicht in der Liste vorhanden ist
        var time = Date.now();
        item.timestamp = time
        curentData.data.push(item);
        fs.writeFileSync(curentRoom, JSON.stringify(curentData));
	console.log('');
        console.log("Added: " + JSON.stringify(item));
        sendList();
    }
}


// Sendet sobald eine aktualisierung vorliegt, die Liste mit den Rauminhalten an den Server
function sendList () {
    
    var data = readFile();
    data = JSON.stringify(data);
    var options = {
        host: VARIABLES.webserver.address,
        port: VARIABLES.webserver.port,
        path: '/roomList',
        method:'POST',
        headers:{
            accept:'application/json',
	    'Content-Length': Buffer.byteLength(data)
        }
    }
    var exReq = http.request(options, function(exRes) {
        exRes.on("data", function(chunk) {
            if (exRes.statusCode == 200) {
                console.log('POST /roomList - OK'); 
            }
        });
    });
    exReq.write(data);
    exReq.end();
}

// Sendet die IP des Minipcs bei Serverstart an den Server
function sendIP() {
    var options = {
        host: VARIABLES.webserver.address,
        port: VARIABLES.webserver.port,
        path: '/miniPcPing',
        method:'POST',
        headers:{
            accept:'application/json'
        }
    }

    var data = {
	   room_id: VARIABLES.room.room_id,
	   host: IP.address(),
	   port: VARIABLES.minipc.port
	}

    var statusCode;
    var exReq = http.request(options, function(exRes) {
        exRes.on("data", function(chunk){
            if (exRes.statusCode != 200) {
                sendIP();
                console.log("IP Not Send");
            } else {
                console.log("IP Send");
            } 
        });	
    });
    exReq.on("error", function(err) {
        console.log("Error in Request" + err);
    });
    
    exReq.write(JSON.stringify(data));
    exReq.end();
}

// Bestätigt eine Buchung in der Konsole.
// Außerhalb des Prototypen würde diese Funktion den Raum öffnen
function book() {
    console.log('Room Booked!');
}

// Exportiert die Funktionen in andere .js Dateien
module.exports = {
    writeFile: function(data) {
        return writeFile(data);
    },
    readFile: function() {
        return readFile();
    },
    getList: function() {
        return getList();
    },
    updateList: function(item) {
        return updateList(item);
    },
    sendIP: function() {
        return sendIP();
    },
    book: function() {
	return book();
    }
}