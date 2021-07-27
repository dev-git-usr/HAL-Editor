var { spawn } = require('child_process');

var halcmd;

function getPins() {
    return new Promise(function(resolve, reject) {
        halcmd = spawn(`halcmd`, ['-s', 'show', 'pin']);

        halcmd.stdout.on('data', (data) => {
            pins = [];
            lines = data.toString().trim().split('\n');
            for (i in lines) {
                columns = lines[i].split(/\s+/);
                pin = {
                    'component': columns[0],
                    'type': columns[1],
                    'dir': columns[2],
                    'value': columns[3],
                    'name': columns[4]
                }
                pins.push(pin);
            }

            resolve(pins);
        });

        halcmd.on('error', (error) => {
            reject(error);
        });
    });
}

module.exports = {
    getPins: getPins 
}