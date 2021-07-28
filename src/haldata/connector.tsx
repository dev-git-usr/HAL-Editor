import * as ReactDOM from 'react-dom';
import * as React from 'react';
import createEngine, {
	DefaultLinkModel, 
    DefaultNodeModel,
	DefaultPortModel,
	RightAngleLinkFactory,
	PathFindingLinkFactory,
	PathFindingLinkModel,
	LinkModel,
	RightAngleLinkModel,
    PortModelAlignment,
    DiagramModel } from '@projectstorm/react-diagrams';
import { TrayWidget } from '../TrayWidget';
import { TrayItemWidget } from '../TrayItemWidget';
import { engine, model, changemodel} from '../main';
import { TSCustomNodeModel } from '../custom-node-ts/TSCustomNodeModel';
import { CustomPortModel } from '../custom-node-ts/CustomPortModel';
import { forEachChild } from 'typescript';
import {show_manual} from '../dock';
const io = require("socket.io-client");

const socket = io("ws://:8070", {
  reconnectionDelayMax: 10000,
  auth: {
    token: "123"
  },
  query: {
    "my-key": "my-value"
  }
});
socket.on("connect", () => {
    document.getElementById("connectionoverlay").style.display = "none";
});
socket.on("disconnect", () => {
	console.log('disconnected');
    document.getElementById("connectionoverlay").style.display = "block";
  });
socket.on("HAL_Ports_and_Functions", (data) => {
    data.forEach(func => {
        var compnode = model.getNodes().filter(function (item) {return item.options.name == func.Name;})
		var node;
        if (compnode.length == 0) {
            node = new TSCustomNodeModel({ name: func.Name, HAL_ID: func.Owner, Comp: func.Comp, color: 'rgb(0,192,255)' });
            /*node = new DefaultNodeModel({
                name: comp,
                color: 'rgb(255,0,0)'
            });*/
            model.addNode(node);
        } else {
            node = compnode[0];
        }
        func.Ports.forEach(port => {
            var shortname = port.Name.substring(func.Name.length + 1);
            var compport = node.getPort(shortname);
            if (compport == null) {
                var nodeport = new CustomPortModel({label: shortname, direction: (port.Dir == "IN")? 'in' : 'out', portType: port.Type, name: shortname, value: port.Value, allowConnection: true});
                //for test add only connected ports
                //if(element.Signal != null) {
                    node.addPort(nodeport);
                //}
            }
        })
    })
    //Remove unknown Nodes
    var compnodes = model.getNodes();
    compnodes.forEach(node => {
        var exists = false
        data.forEach(func => {
            if(func.Name == node.options.name) {
                exists = true;
            }
        })
        if(!exists){
            model.removeNode(node);
        }
    })
    engine.repaintCanvas();
})
socket.on("HAL_Pins", (data) => {
	//console.log(`HAL-Signals: ${data}`);
	//document.getElementById('signal_window').innerHTML = data;
	//console.log(model.getNodes());
    //Add new Nodes and Ports
	data.forEach(element => {
		var comp = element.Comp.Comp;
		var compnode = model.getNodes().filter(function (item) {return item.options.name == comp;})
		var node;
        if (compnode.length == 0) {
            console.log(element);
            node = new TSCustomNodeModel({ name: comp, HAL_ID: element.Owner, color: 'rgb(0,192,255)' });
            /*node = new DefaultNodeModel({
                name: comp,
                color: 'rgb(255,0,0)'
            });*/
            model.addNode(node);
        } else {
            node = compnode[0];
        }
        if (node != null) {
            var shortname = element.Comp.Pin;
            var compport = node.getPort(shortname);
            if (compport == null) {
                //var port = new CustomPortModel(element.Dir == "IN", shortname, shortname);
                var port = new CustomPortModel({label: shortname, direction: (element.Dir == "IN")? 'in' : 'out', portType: 'number', name: shortname, value: element.Value, allowConnection: true});
                //for test add only connected ports
                //if(element.Signal != null) {
                    node.addPort(port);
                //}
            }

		}
		//console.log(comp);
	});
	engine.repaintCanvas();
})
socket.on("HAL_Components", (data) => {
	//data.forEach(element => console.log(`Comp: ${element.Name}`));
	data.forEach(element => {
		const node = new TSCustomNodeModel({
			name: element.Name,
			color: 'rgb(255,0,0)'
		});
		//model.addNode(node);
	});
	engine.repaintCanvas();
	//console.log("All Components added");
	/*
	const node4 = new DefaultNodeModel({
    name: 'Node 5',
    color: 'rgb(0,192,255)',
});
node2.setPosition(100, 200);
*/
})
socket.on("HAL_Signals", (data) => {
    data.forEach(sig => {
        if(sig.Source != null && sig.Target.length > 0){
            var src_comp = sig.Source.instancename;
            var src_port = sig.Source.portname;
            var src_compnode = model.getNodes().filter(function (item) {return item.options.name == src_comp;})[0]
            if(src_compnode != null) {
                var src_compport = src_compnode.getPort(src_port);
                var src_links = src_compport.getLinks();
                //Workaround if Target is no Array
                if(!Array.isArray(sig.Target)) {
                    sig.Target = [sig.Target];
                }
                sig.Target.forEach(targ => {
                    if(targ != null){
                        var targ_comp = targ.instancename;
                        var targ_port = targ.portname;
                        var targ_compnode = model.getNodes().filter(function (item) {return item.options.name == targ_comp;})[0]
                        if(targ_compnode != null) {
                            var targ_compport = targ_compnode.getPort(targ_port);
                            var exists = false;
                            for (const [key, value] of Object.entries(src_links)) {
                                if(value.getTargetPort() == targ_compport) {
                                    exists = true;
                                }
                            }
                            if(!exists) {
                                let link = src_compport.link<DefaultLinkModel>(targ_compport);
                                model.addAll(link);
                            }
                        } else {
                            console.log("Targetnode " + targ_comp + " not found!");
                        }
                    }
                });
            } else {
                console.log("Sourcenode " + src_comp + " not found!")
            }
        /*	var node;
            if (compnode.length > 0) {
                node = compnode[0];
                var port1 = node.getPort(portname)
                let link = 
                model.addAll(link);
            }
            if (node != null) {
                var shortname = element.Name.split(/\.(.+)/)[1];
                var port = new RightAnglePortModel(element.Dir == "IN", shortname, shortname);
                //for test add only connected ports
                if(element.Signal != null) {
                    node.addPort(port);
                }

            }*/
            //console.log(comp);
        };
	});
    //Remove unknown Links
    var complinks = model.getLinks();
    complinks.forEach(link => {
        var exists = false
        var linksrc = link.sourcePort.parent.options.name + "." + link.sourcePort.options.name;
        var linktarg = link.targetPort.parent.options.name + "." + link.targetPort.options.name;
        data.forEach(sig => {
            if(sig.Source != null){
                var sigsrc = sig.Source.instancename + "." + sig.Source.portname;
                if(sig.Target.length > 0){
                    //Workaround if Target is no Array
                    if(!Array.isArray(sig.Target)) {
                        sig.Target = [sig.Target];
                    }
                    sig.Target.forEach(targ => {
                        if(targ != null) {
                            var sigtarg = targ.instancename + "." + targ.portname;
                            if((linksrc == sigsrc) && (linktarg == sigtarg)) {
                                exists = true;
                            }
                        }
                    })
                }
            }
        })
        if(!exists){
            link.getTargetPort().removeLink(link);
            link.getSourcePort().removeLink(link);
            model.removeLink(link);
        }
    })
	engine.repaintCanvas();
})

socket.on("HAL_Comps", (data) => {
	//Clear Componentlist
    ReactDOM.render(<TrayWidget id="signaltray">
					{data.map(function (value) {
						return <TrayItemWidget model={{ type: {value} }} name={value} key={value} color="rgb(192,0,0)" />
						})
					}
					</TrayWidget>, document.querySelector('#solution_window'));
})

socket.on("HAL_Manual", (data) => {
    show_manual(data);
    //window.alert(data);
})

socket.on("Model_Load", (data) => {
    var model2 = new DiagramModel();
    model2.deserializeModel(data, engine);
    changemodel(model2);
})

export function HAL_add_Component(name) {
    socket.emit("HAL_Component_Add", name);
}

export function HAL_remove_Component(name, id) {
    socket.emit("HAL_Component_Remove", {component: name, id: id});
}

export function HAL_remove_Connection(name) {
    socket.emit("HAL_Connection_Remove", {pin: name});
}

export function HAL_connect(sourcepin, targetpin) {
    socket.emit("HAL_Connect", {sourcepin: sourcepin, targetpin: targetpin});
}
export function HAL_get_Manual(name) {
    socket.emit("HAL_Manual", name);
}
export function startConnector() {
    socket.connect();
}
export function savemodelonserver(data) {
    socket.emit("Model_Store", data);
}

export function loadmodelfromserver() {
    socket.emit("Model_Load", null);
}

export function refreshvalues() {
    socket.emit("Refresh_Values", null);
}