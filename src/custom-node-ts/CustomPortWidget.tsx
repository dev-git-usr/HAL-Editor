import * as React from 'react';
import { PortWidget } from '@projectstorm/react-diagrams-core';
import PortTextField from './PortTextField';
//import Switch from 'components/Switch';
import styled from '@emotion/styled';
import { contextMenu, Menu, Item, Separator, Submenu, useContextMenu  } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.css';

import './CustomPortStyle.scss';
import { colors } from '@material-ui/core';
const portcolors = {bit: "#FFFFFF", float: "#FF0000", s32: "#00FF00", u32: "#0000FF"}
namespace S {
	export const Portitem = styled.div<{ background: string ,direction: string}>`
		border-top-left-radius: ${(p) => p.direction != "in" ? "3.75rem" : "0"};
		border-bottom-left-radius: ${(p) => p.direction != "in" ? "3.75rem" : "0"};
		border-top-right-radius: ${(p) => p.direction != "in" ? "0" : "3.75rem"};
		border-bottom-right-radius: ${(p) => p.direction != "in" ? "0" : "3.75rem"};
		min-width: 15px;
		height: 15px;
		border: 1px solid #012880;
		padding-top: 0px;
		background-image: linear-gradient(-180deg, ${(p) => p.background} 0%, #303030 100%);
		color: white;
		padding-left: 2px;
		padding-right: 2px;
		cursor: crosshair;
	`;
	export const Valueitem = styled.div<{direction: string}>`
	position: absolute;
	text-align: ${(p) => p.direction == "in" ? "right" : "left"};
	background-color: orange;
	opacity: 0.9;
	${(p) => p.direction == "in" ? "left: -40px" : "right: -40px"};
	width: 40px;
	`;
}


	function renderElement(Element, port, isConnected) {
		return (
			<Element
				disabled={isConnected}
				defaultValue={port.getOptions().portType.value}
				onChange={(value) => port.getOptions().portType.value = value}
				onFocus={() => port.parent.setLocked(true)}
				onBlur={() => port.parent.setLocked(false)}
			/>
		) 
	}
	
	function renderInputElement(port, isConnected) {
		return renderElement(PortTextField, port, isConnected);
	}
	
	//function renderBoolenElement(port, isConnected) {
	//    return renderElement(Switch, port, isConnected);
	//}
	
	function renderLabel({ isEditable, port, isConnected, isDisabled }) {
		let inputElement = null;
		
		if (isEditable && port.direction === 'in') {
			switch(port.portType.type) {
				case 'number':
					inputElement = renderInputElement(port, isConnected);
					break;
				//case 'boolean':
				//    inputElement = renderBoolenElement(port, isConnected);
				//    break;
				default:
					inputElement = renderInputElement(port, isConnected);
			}
		} else {
			inputElement = renderInputElement(port, isConnected);
		}
		
		return(
			<div className="simPortLabel__label">
				{ !isDisabled && port.options.label }
			</div>
		)
	}
	function handleContextMenu(event, port){
		event.preventDefault();
		contextMenu.show({
		  id: "Port_Contextmenu",
		  event: event,
		  props: {
			  port: port
		  }
		})
	}

	export function SimPortLabel({ port,
		engine,
		roundedLeft,
		roundedRight,
		inactivePort,
		disableLabel,
	}) {
		const isConnected = !!Object.keys(port.links).length;
		const { isEditable } = port.getOptions().portType;
		const labelElem = renderLabel({ isEditable, port, isConnected, isDisabled: disableLabel });
		if(!port.options.isvisible) {
			return null;
		} else {
			//this.reportPosition();
			return (
				<div className="simPortLabel">
					{port.direction != "in" ? <div className="simPortSpacer"></div> : ""}
					{port.direction == "in" && port.getOptions().showvalue ? <S.Valueitem direction={port.direction}>{port.getOptions().value}</S.Valueitem> : ""}
					{port.direction == "in" ? <PortWidget engine={engine} port={port}><S.Portitem
						background={portcolors[port.getOptions().portType]} direction={port.direction} onContextMenu={(event) => handleContextMenu(event, port)}>
							{port.getOptions().portType}
					</S.Portitem></PortWidget> : labelElem}
					{port.direction == "in" ? labelElem : <PortWidget engine={engine} port={port}><S.Portitem
						background={portcolors[port.getOptions().portType]} direction={port.direction} onContextMenu={(event) => handleContextMenu(event, port)}>
							{port.getOptions().portType}
					</S.Portitem></PortWidget>}
					{port.direction != "in" && port.getOptions().showvalue ? <S.Valueitem direction={port.direction}>{port.getOptions().value}</S.Valueitem> : ""}
				</div>
			);
		}
	}

/*export class TSCustomPortWidget extends PortWidget {

	render() {
		var port = this.props.port;
		var engine = this.props.engine;
		const isConnected = !!Object.keys(port.links).length;
		const { isEditable } = port.getOptions().portType;
		const labelElem = renderLabel({ isEditable, port, isConnected, isDisabled: null });
		if(!port.options.isvisible) {
			return null;
		} else {
			//this.reportPosition();
			//<PortWidget engine={engine} port={port}>
			return (
				<div className="simPortLabel"
				ref={this.ref}
				data-name={this.props.port.getName()}
				data-nodeid={this.props.port.getNode().getID()}
				{...this.getExtraProps}>
					{port.direction != "in" ? <div className="simPortSpacer"></div> : ""}
					{port.direction == "in" ? <S.Portitem
						background={portcolors[port.getOptions().portType]} direction={port.direction}>
							{port.getOptions().portType}
					</S.Portitem> : labelElem}
					{port.direction == "in" ? labelElem : <S.Portitem
						background={portcolors[port.getOptions().portType]} direction={port.direction}>
							{port.getOptions().portType}
					</S.Portitem>}
				</div>
			);
		}
	}
}
*/