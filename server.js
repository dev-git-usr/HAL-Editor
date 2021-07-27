var http = require('http');
const { promisify } = require('util');
var shellParser = require('node-shell-parser');
const { spawn } = require('child_process');
const exec = promisify(require('child_process').exec);
const util = require('util')
var server;
var fs = require('fs');

server = http.createServer();
/*server = http.createServer(function(req, res){
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write('Websocket Port for Connection to LinuxCNC-HAL.');
  res.end();
});*/
//var io = require('socket.io')(server);
const io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

//Global Variables
var HAL_Components = {};
var HAL_Functions = {};
var HAL_Pins = {};
var HAL_Signals = {};

io.on('connection', client => {
    get_HAL_Components();
    client.join("HAL");
    /*const ls = spawn('halcmd', ['list', 'pin']);

    ls.stdout.on('data', (data) => {
        client.emit('HAL_Signals', data.toString().split(" "))
      });*/
    
    
    /*  const ls2 = spawn('halcmd', ['list', 'comp']);

      ls2.stdout.on('data', (data) => {
        var dat = data.toString().split(" ").filter(function (item) {
            return item.indexOf("halcmd") !== 0;
         });
          client.emit('HAL_Components', dat);
        });*/
    
    //emit_HAL_PINS();
    combine_Pins_and_Functions();
    
    emit_HAL_Modules();

    client.on("HAL_Component_Add", (data) =>{
        console.log(data);
        const ls = spawn('halcmd', ['loadrt', data, 'count=1']);
        ls.stdout.on('end', function() {
            console.log("added");
            get_HAL_Components();
            combine_Pins_and_Functions();
        })
    });

    client.on("HAL_Component_Remove", (data) =>{
        console.log('Remove ' + util.inspect(data, false, null, true));
        var compname = get_Component_from_ID(data.id).Name;
        console.log(compname);
        if(compname != null) {
            const ls = spawn('halcmd', ['unload', compname]);
            ls.stdout.on('end', function() {
                combine_Pins_and_Functions();
            })
        }
    })

    client.on("HAL_Connection_Remove", (data) =>{
        console.log('Remove Connection' + util.inspect(data, false, null, true));
        if(data.pin) {
            const ls = spawn('halcmd', ['unlinkp', data.pin]);
            ls.stdout.on('end', function() {
                combine_Pins_and_Functions();
            })
        }
    })   

    // Send Manual of HAL-Components to Client on Request.
    client.on("HAL_Manual", (data) => {
        //Textoutput
        //const ls = spawn('man', ['-P', 'cat', data]);
        //HTML-Output
        const ls = spawn('man', ['-Hcat', data]);
        //man -Hcat encoder > test.html for html output
        var stdout_data = '';
        ls.stdout.on('data', (data) => {
            stdout_data += data;
        })
        ls.stdout.on('end', function () {
            //console.log(stdout_data);
            client.emit("HAL_Manual", stdout_data);
        })
    })

    // Store Model

    client.on("Model_Store", (data) => {
        const fs = require('fs');
        fs.writeFileSync('modeldata.json', data);
    })

    client.on("Model_Load", (data) => {
        const fs = require('fs');
        var data = fs.readFileSync('modeldata.json');
        var jsondata = JSON.parse(data);
        client.emit("Model_Load", jsondata);
    })
    // Connect Pins
    client.on("HAL_Connect", (data) => {
        console.log("Connect HAL Pins");
        console.log(data);
        //Check if Source is used - then we have to link to the existing Signal
        var matchingsignals = HAL_Signals.filter(sig => {
            if (sig != null){
                if(sig.Source != null){
                    return (sig.Source.instancename + "." + sig.Source.portname == data.sourcepin) || (sig.Source.instancename + "." + sig.Source.portname == data.targetpin) ;
                }
            }
            return 0;
        });
        console.log(matchingsignals);
        if(matchingsignals.length > 0) {
            const ls = spawn('halcmd', ['net', matchingsignals[0].Name, data.targetpin]);
            console.log("Connect: " + matchingsignals[0].Name + " + " + data.targetpin);
            ls.stdout.on('end', function () {
                get_HAL_Signals();
            })
        } else {
            //No Signal with the same Source exists, so generate a new Signal
            //generate a new Signalname
            var signalid = 1;
            while(signal_exists("Signal" + signalid)){
                signalid += 1
            }
            //Add the Signal to HAL
            const ls = spawn('halcmd', ['net', 'Signal' + signalid, data.sourcepin, data.targetpin]);
            ls.stdout.on('end', function () {
                get_HAL_Signals();
            })
        }
    })
    client.on("Refresh_Values", (data) => {
        combine_Pins_and_Functions();
    })
});



server.listen(8070);
console.log("Server started!");




function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}
/*
function emit_HAL_PINS() {
    const ls2 = spawn('halcmd', ['show', 'pin']);
    var stdout_data2 = '';
    ls2.stdout.on('data', (data) => {
        stdout_data2 += data;
    })
    ls2.stdout.on('end', function () {
        //Remove first line
        var clean_data = stdout_data2.substring((stdout_data2).indexOf("\n") + 1);
        var parsed = shellParser(clean_data);
        parsed = parsed.filter(function (item) {
            if(item == null) {
                return 0;
            } else {
                return item.Name.indexOf("halcmd") !== 0;
            }
        })
        //Add field for connection
        parsed.forEach(element => {
            var parsplit = element.Name.split(" ");
            if(parsplit.length > 1) {
                element.Signal = parsplit [2];
            } else {
                element.Signal = null;
            }
            //Remove Connection info from Name field
            element.Name = parsplit[0];
            element.Comp = split_signalname(element.Name);
        });
        io.to("HAL").emit('HAL_Pins', parsed);
    })
}*/

// Collects all available LinuxCNC HAL Modules and emits to Socket
// Collection is done by looking at /usr/lib/linuxcnc/modules
function emit_HAL_Modules() {
    const ls = spawn('ls', ['/usr/lib/linuxcnc/modules']);
    var stdout_data = '';
    ls.stdout.on('data', (data) => {
        stdout_data += data;
    })
    ls.stdout.on('end', function() {
        var ele = stdout_data.split(/\s+/);
        var comps = [];
        ele.forEach(element => {
            if (element.endsWith(".so")) {
                comps.push(element.substring(0, element.length - 3));
            }
        })
        io.to("HAL").emit('HAL_Comps',comps);
    })
}

// Collects all Components added to HAL by halcmd show comp
// Structure is {ID, Type, Name,PID, State}
function get_HAL_Components() {
    const ls = spawn('halcmd', ['show', 'comp']);
    var stdout_data = '';
    ls.stdout.on('data', (data) => {
        stdout_data += data;
    })
    ls.stdout.on('end', function () {
        //Remove first line
        var clean_data = stdout_data.substring((stdout_data).indexOf("\n") + 1);
        var parsed = shellParser(clean_data);
        parsed = parsed.filter(function (item) {
            if(item == null) {
                return 0;
            } else {
                return item.Name.indexOf("halcmd") !== 0;
            }
        });
        HAL_Components = parsed;
    });
}
// Often itś necessary to get the Component Name from the Owner/ID (e.g. to remove the Component)
function get_Component_from_ID(id) {
    //console.log('Components: ' + util.inspect(HAL_Components, false, null, true));
    var retval = null;
    HAL_Components.forEach(element=>{
        if(Number(element.ID) == Number(id)) {
            //console.log(element.Name);
            //console.log(util.inspect(element, false, null, true));
            retval = element
        };
    });
    return retval;
}

// Collects all Functions added to HAL by halcmd show function
// Structure is {Owner, CodeAddr, Arg, FP, Users, Name}
async function get_HAL_Functions() {
    var ret = await exec('halcmd show function');
        //Remove first line (Header)
        //console.log(ret.stdout);
        var clean_data = ret.stdout.substring((ret.stdout).indexOf("\n") + 1);
        clean_data = clean_data.substring((clean_data).indexOf("\n") + 1);
        var lines = clean_data.split("\n");
        var parsed = [];
        lines.forEach(line => {
            var split = line.trim().split(/\s+/g);
            if(split.length == 6)
                parsed.push({Owner:split[0], CodeAddr:split[1], Arg:split[2],FP:split[3],Users:split[4],Name:split[5]});
                //console.log(parsed);
        })
        HAL_Functions = parsed;
}

// Collects all Pins added to HAL by halcmd show pin
// Structure is {Owner, Type, Dir, Value, Name}
async function get_HAL_Pins() {
        var ret = await exec('halcmd show pin');
        //console.log(ret.stdout);
        //Remove first line
        var clean_data = ret.stdout.substring((ret.stdout).indexOf("\n") + 1);
        clean_data = clean_data.substring((clean_data).indexOf("\n") + 1);
        var lines = clean_data.split("\n");
        var parsed = [];
        lines.forEach(line => {
            var split = line.trim().split(/\s+/g);
            if(split.length >= 5)
                parsed.push({Owner:split[0], Type:split[1], Dir:split[2],Value:split[3],Name:split[4]});
                //console.log(parsed);
        })
        HAL_Pins = parsed;
}

// HAL Pins are named with instancename.pinname and instancename is often built by modulename.instanceid
// This function splits the pinnames by {instancename, portname} and respects instanceid if available
function split_pinnames(data) {
    if (data == null) return null;
    var splitdata = data.split(".")
    var out = {};
    out.instancename = splitdata[0];
    /*if(!isNaN(splitdata[1]) ){
        out.instancename += "." + splitdata[1];
    }
    out.portname= data.substring(out.instancename.length + 1, data.length);
    */
    out.portname = splitdata.pop();
    out.instancename = splitdata.join(".");
    return out;
}

// This Function combines Functions and Ports to one structure
async function combine_Pins_and_Functions() {
    get_HAL_Components();
    await get_HAL_Functions();
    await get_HAL_Pins();
    //console.log(HAL_Functions);
    HAL_Pins.forEach(pin => {
        var pindata = split_pinnames(pin.Name);
        var funct =  null;
        HAL_Functions.forEach(fun => {
            if(fun.Name == pindata.instancename){
                funct = fun;
                if (fun.Ports == null) fun.Ports = [];
                fun.Ports.push(pin);
            }
        })
        if(funct == null) {
            //Build function from Pins
            funct = {};
            funct.Owner = pin.Owner;
            funct.Name = pindata.instancename;
            funct.Ports = [];
            funct.Ports.push(pin);
            HAL_Functions.push(funct);
        }
    })
    HAL_Functions.forEach(funct => {
        /*var ports = HAL_Pins.filter(function (pin) {
            var splitdata = split_pinnames(pin.Name);
            //console.log(splitdata.instancename + " - " + funct.Name)
            if(splitdata.instancename == funct.Name) {
                return 1;
            } else {
                return 0;
            }
        });
        funct.Ports = ports;*/
        funct.Comp = get_Component_from_ID(funct.Owner);
    })
    io.to("HAL").emit("HAL_Ports_and_Functions", HAL_Functions);
    //console.log('Functions: ' + util.inspect(HAL_Functions, false, null, true));
    get_HAL_Signals();
}

// 
async function get_HAL_Signals() {
    const ls3 = spawn('halcmd', ['show', 'signal']);
    var stdout_data3 = '';
    ls3.stdout.on('data', (data) => {
        stdout_data3 += data;
    })
    ls3.stdout.on('end', function() {
        var clean_data = stdout_data3.substring((stdout_data3).indexOf("\n") + 1);
        clean_data = clean_data.substring((clean_data).indexOf("\n") + 1);
        var lines = clean_data.split("\n");
        var signals = [];
        var signal = {};
        signal.Target = [];
        lines.forEach(element => {
            var ele = element.trim().split(/\s+/g);
            if (ele.length > 2) {
                if(!isEmpty(signal)) {
                    signals.push(signal);
                    signal = {};
                }
                signal.Name = ele[2];
                signal.Source = null;
                signal.Target = [];
            } else {
                if(ele[0] == "<=="){
                    signal.Source = split_pinnames(ele[1]);
                } else {
                    signal.Target.push(split_pinnames(ele[1]));
                }
            }
        })
        if(!isEmpty(signal)) {
            signals.push(signal);
        }
        HAL_Signals = signals;
        io.to("HAL").emit('HAL_Signals', signals);
    })
}

//Checks if a Signal with a specific Name does exist
function signal_exists(signalname) {
    var exists = false;
    HAL_Signals.forEach(element => {
        if(element.Name == signalname) {
            exists = true;
        }
    })
    return exists;
}