import * as React from 'react';
import { TSCustomNodeModel } from './TSCustomNodeModel';
import * as _ from 'lodash';
import { DiagramEngine } from '@projectstorm/react-diagrams-core';
import { DefaultNodeModel } from '@projectstorm/react-diagrams-defaults';
//import { DefaultPortLabel } from '@projectstorm/react-diagrams-defaults';
import styled from '@emotion/styled';
import { SimPortLabel, TSCustomPortWidget } from './CustomPortWidget';
import { contextMenu, Menu, Item, Separator, Submenu, useContextMenu  } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.css';

namespace S {
	export const Node = styled.div<{ background: string; selected: boolean; onclick: string}>`
		background-color: ${(p) => p.background};
		border-radius: 5px;
		font-family: sans-serif;
		color: white;
		border: solid 2px black;
		overflow: visible;
		font-size: 11px;
		border: solid 2px ${(p) => (p.selected ? 'rgb(0,192,255)' : 'black')};
		onclick: ${(p) => p.onclick}
	`;

	export const Title = styled.div`
		background: rgba(0, 0, 0, 0.3);
		display: block;
		white-space: nowrap;
		justify-items: center;
	`;

	export const TitleName = styled.div`
		text-align: center;
	`;
	export const TitleType = styled.div`
		text-align: center;
	`;

	export const Ports = styled.div`
		display: flex;
		background-image: linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2));
	`;

	export const PortsContainer = styled.div`
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		&:first-of-type {
			margin-right: 10px;
		}
		&:only-child {
			margin-right: 0px;
		}
	`;
}

export interface TSCustomNodeProps {
	node: TSCustomNodeModel;
	engine: DiagramEngine;
}

/**
 * Default node that models the DefaultNodeModel. It creates two columns
 * for both all the input ports on the left, and the output ports on the right.
 */
function handleContextMenu(event, compname, node){
	event.preventDefault();
	contextMenu.show({
	  id: "Node_Contextmenu",
	  event: event,
	  props: {
		  comp: compname,
		  node: node
	  }
	})
}

export class TSCustomNodeWidget extends React.Component<TSCustomNodeProps> {
	//generatePort = (port) => {
	//	return <DefaultPortLabel engine={this.props.engine} port={port} key={port.getID()} />;
	//};


	render() {
		if(this.props.node.getOptions().isvisible) {
		return (
			
			<S.Node
				data-default-node-name={this.props.node.getOptions().name}
				selected={this.props.node.isSelected()}
				background={this.props.node.getOptions().color}
				onContextMenu={(event) => handleContextMenu(event, this.props.node.getOptions().Comp.Name, this.props.node)}>
				<S.Title>
					<S.TitleName>{this.props.node.getOptions().name}</S.TitleName>
					<S.TitleType>{this.props.node.getOptions().Comp.Name + " (" + this.props.node.getOptions().Comp.Type + ")"}</S.TitleType>
				</S.Title>
				<S.Ports>
					<S.PortsContainer>{
						//_.map(this.props.node.getInPorts(), this.generatePort)
						renderPorts(this.props.node.getInPorts(), true, this.props.engine, true)
					}</S.PortsContainer>
					<S.PortsContainer>{
						//_.map(this.props.node.getOutPorts(), this.generatePort)
						renderPorts(this.props.node.getOutPorts(), true, this.props.engine, true)
					}</S.PortsContainer>
				</S.Ports>
			</S.Node>
		);
		} else {
			return null;
		}
	}
}

function renderPorts(ports, inActive, engine, isLeft = true) : JSX.Element {
	//var visibleports = ports.filter(e => e.isvisible == true);
	return ports.map((inputPort) => 
			(<SimPortLabel
			roundedLeft={isLeft}
			roundedRight={!isLeft}
			inactivePort={inActive}
			engine={engine}
			port={inputPort}
			key={inputPort.getID()}
			disableLabel={false}
		  />)
	)
	/*return ports.map((inputPort) => (
		<TSCustomPortWidget 
			port={inputPort}
			engine={engine}
			key={inputPort.getID()}
		></TSCustomPortWidget>
	))*/
  }