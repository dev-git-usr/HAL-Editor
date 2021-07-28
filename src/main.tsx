import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './main.css';
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
	DagreEngine,
    DiagramModel } from '@projectstorm/react-diagrams';
import { DeleteItemsAction } from './CustomDeleteAction';
import { TSCustomNodeFactory } from './custom-node-ts/TSCustomNodeFactory';
import { TSCustomNodeModel } from './custom-node-ts/TSCustomNodeModel';
import { CustomPortFactory } from './custom-node-ts/CustomPortFactory';
import { CustomPortModel } from './custom-node-ts/CustomPortModel';
import { NodeModel} from '@projectstorm/react-diagrams';
import { BodyWidget } from './BodyWidget';
import styled from '@emotion/styled';
import {Haltable} from './Haltable';
import { Menu, Item, Separator, Submenu } from 'react-contexify';
import { BiHelpCircle } from 'react-icons/Bi';
import 'react-contexify/dist/ReactContexify.css';
// create an instance of the engine
export const drageengine = new DagreEngine({
	graph: {
		rankdir: 'LR',
		ranker: 'tight-tree',
		marginx: 5,
		marginy: 5
	},
	includeLinks: false
});
// create a diagram model
export var model = new DiagramModel();

export const engine = createEngine({
	//registerDefaultZoomCanvasAction: false,
    registerDefaultDeleteItemsAction: false
});
import { HAL_add_Component, savemodelonserver, loadmodelfromserver, refreshvalues, HAL_get_Manual} from './haldata/connector';

import { TrayWidget } from './TrayWidget';
import { TrayItemWidget } from './TrayItemWidget';
import { DefaultState } from './DefaultState';
import './dock';
import { FiRefreshCw } from 'react-icons/fi';

namespace S {
	export const Body = styled.div`
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		min-height: 100%;
	`;

	export const Header = styled.div`
		display: flex;
		background: rgb(30, 30, 30);
		flex-grow: 0;
		flex-shrink: 0;
		color: white;
		font-family: Helvetica, Arial, sans-serif;
		padding: 10px;
		align-items: center;
	`;
	export const Editormenubar = styled.div`
		flex:0 1 44px;
		display: flex;
		width: 100%;
		background: rgb(20, 20, 20);
	`;
	export const Editormenubutton = styled.div`
		margin: 2px;
		height: 38px;
		width: 38px;
		background: #EEE;
		border-width: 1px;
		border-color: white;
		border-style: solid;
		border-radius: 3px;
		&:hover {
			border-color: orange;
			border-width: 3px;
			width: 34px;
			height: 34px;
		}
	`;

	export const Content = styled.div`
		height: 100%;
		width: 100%;
		display: inline-flex;
		flex-flow: column;
	`;

	export const Editordiv = styled.div`
		width: 100%;
		height: 50%;
		display: flex;
		flex-flow: column;
		flex-grow: 1;
	`;

	export const Editorcontainer = styled.div`
		flex: 1 1 auto;
	`;
	export const Tablediv = styled.div`
	width: 100%;
	height: 20%;
	overflow: scroll;
	:empty{
		display:none;
	}
`;
	export const Layer = styled.div`
		position: relative;
		flex-grow: 1;
		height: 100%;
	`;
	
}


engine.getLinkFactories().registerFactory(new RightAngleLinkFactory());

// register the engines
engine.getNodeFactories().registerFactory(new TSCustomNodeFactory());

engine.getPortFactories().registerFactory(new CustomPortFactory());

// Use this custom "DefaultState" instead of the actual default state we get with the engine
engine.getStateMachine().pushState(new DefaultState());
	
const pathfinding = engine.getLinkFactories().getFactory<PathFindingLinkFactory>(PathFindingLinkFactory.NAME);

//Setup Engine
const state = engine.getStateMachine().getCurrentState();
//disallow movement of canvas by drag
state.dragCanvas.config.allowDrag = false;
//disallow creation of loose links
//state.dragNewLink.config.allowLooseLinks = false;

// Snap Nodes to Grid and set Gridsize
model.setGridSize(5);

export function changemodel(modeldata) {
	model = modeldata;
	engine.setModel(model);
}

export function handleselectionchanged(e) {
	var entities = model.getSelectedEntities();
	//only show detailinformation if only one element is selected
	if(entities.length == 1){
		if(entities[0] instanceof NodeModel){
			//console.log(entities[0]);
			ReactDOM.render(<Haltable node={entities[0]}/>, document.getElementById('haltablediv'));
			return;
		}
	}
	if(entities.length == 0){
		//show available Nodes
		//tbd
	}
	//Hide if nothing valid selected
	ReactDOM.render("", document.getElementById('haltablediv'));
}
//####################################################

// install the model into the engine
engine.setModel(model);

engine.getActionEventBus().registerAction(new DeleteItemsAction());
/*model.registerListener({selectionChanged: function(e){
	console.log("test");
}});*/

/*
model.registerListener({
	nodesUpdated: e => console.log("nodesUpdated", e),
	linksUpdated: e => console.log("linksUpdated", e),
	
	// these are never triggered
	zoomUpdated: e => console.log("zoomUpdated", e),
	gridUpdated: e => console.log("gridUpdated", e),
	offsetUpdated: e => console.log("offsetUpdated", e),
	entityRemoved: e => console.log("entityRemoved", e),
	selectionChanged: e => console.log("selectionChanged", e)
});*/

function autoDistribute (){
	drageengine.redistribute(model);
	engine.repaintCanvas();
	// only happens if pathfing is enabled (check line 25)
};

export function hide_Port(	port: CustomPortModel, visible: boolean) {
	port.getOptions().isvisible = visible;
	var node = port.getParent();
	var ports = Object.values(node.getPorts());
	ports.forEach(port => {
		port.reportPosition();
		port.reportedPosition = null;
		port.getOptions().updatecounter = port.getOptions().updatecounter + 1;
	})
	engine.repaintCanvas();
}
export function hide_Node( node: TSCustomNodeModel, visible: boolean) {
	node.getOptions().isvisible = visible;
	engine.repaintCanvas();
}
function hide_unused_Ports() {
	var nodes = model.getNodes();
	nodes.forEach(node => {
		var ports = Object.values(node.getPorts());
		var portschanged = false;
		if(!Array.isArray(ports)) {
			ports = [ports];
		}
		ports.forEach(port => {
			if(Object.keys(port.getLinks()).length == 0) {
				if(port.getOptions().isvisible){
					port.getOptions().isvisible = false;
					portschanged = true;
				}
			}
		})
		//Update Link models
		if(portschanged) {
			ports.forEach(port => {
				port.reportPosition();
				port.reportedPosition = null;
				port.getOptions().updatecounter = port.getOptions().updatecounter + 1;
			})
		}
	})
	engine.repaintCanvas();
}

function show_hide_values() {
	var nodes = model.getNodes();
	nodes.forEach(node => {
		var ports = Object.values(node.getPorts());
		if(!Array.isArray(ports)) {
			ports = [ports];
		}
		ports.forEach(port => {
			port.getOptions().showvalue = !port.getOptions().showvalue
		})
	})
	engine.repaintCanvas();
}

function hide_unused_Nodes() {
	var nodes = model.getNodes();
	nodes.forEach(node => {
		var used = false;
		var ports = Object.values(node.getPorts());
		if(!Array.isArray(ports)) {
			ports = [ports];
		}
		ports.forEach(port => {
			if(Object.keys(port.getLinks()).length > 0) {
				used = true;
			}
		})
		if(!used) {
			//node.isvisible = false;
			node.getOptions().isvisible = false;
			//node.setvisibility(false);
		}
	})
	engine.repaintCanvas();
}
function save(){
	var str = JSON.stringify(model.serialize());
	savemodelonserver(str);
}

document.addEventListener('DOMContentLoaded', () => {
	//const rootElement = document.getElementById("editor3_window");
	//ReactDOM.render(<BodyWidget engine={engine} />, rootElement);
	ReactDOM.render(<S.Content><S.Editordiv
						onDrop={(event) => {
							var data = JSON.parse(event.dataTransfer.getData('storm-diagram-node'));
							HAL_add_Component(data.type.value);					
						}}
						onDragOver={(event) => {
							event.preventDefault();
						}}>
							<Menu id="Node_Contextmenu">
								<Item onClick={({ event, props }) => HAL_get_Manual(props.comp)}>Show Manual</Item>
								<Item onClick={({event, props}) => hide_Node(props.node, false)}>Hide Node</Item>
							</Menu>
							<Menu id="Port_Contextmenu">
								<Item onClick={({ event, props}) => hide_Port(props.port, false)}>Hide Port</Item>
								<Item >Set Port Value</Item>
							</Menu>
							<S.Editormenubar>
								<S.Editormenubutton onClick={() => save()}>
									Save
								</S.Editormenubutton>
								<S.Editormenubutton onClick={() => loadmodelfromserver()}>
									Load
								</S.Editormenubutton>
								<S.Editormenubutton onClick={() => autoDistribute()}>
									Dist
								</S.Editormenubutton>
								<S.Editormenubutton onClick={() => hide_unused_Ports()}>
									Ports
								</S.Editormenubutton>
							
								<S.Editormenubutton onClick={() => hide_unused_Nodes()}>
									Nodes
								</S.Editormenubutton>
								<S.Editormenubutton onClick={() => show_hide_values()}>
									Values
								</S.Editormenubutton>
								<S.Editormenubutton onClick={() => refreshvalues()}>
									<FiRefreshCw/>
								</S.Editormenubutton>
							</S.Editormenubar>
							<S.Editorcontainer>
								<BodyWidget engine={engine}/>
							</S.Editorcontainer>
					</S.Editordiv>
					<S.Tablediv id="haltablediv">
					</S.Tablediv>
					</S.Content>, document.querySelector('#editor3_window'));
	/*ReactDOM.render(<TrayWidget id="signaltray">
					</TrayWidget>, document.querySelector('#solution_window'));*/
	ReactDOM.render(
			<BiHelpCircle id="helpicon" onClick={({event}) => HAL_get_Manual("Help")} />, document.querySelector('#helpbutton'));
});

