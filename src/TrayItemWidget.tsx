import * as React from 'react';
import styled from '@emotion/styled';
import { contextMenu, Menu, Item, Separator, Submenu, useContextMenu  } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.css';

import {HAL_get_Manual} from './haldata/connector'
export interface TrayItemWidgetProps {
	model: any;
	color?: string;
	name: string;
}

namespace S {
	export const Tray = styled.div<{ color: string }>`
		color: white;
		font-family: Helvetica, Arial;
		padding: 5px;
		margin: 0px 10px;
		border: solid 1px ${(p) => p.color};
		border-radius: 5px;
		margin-bottom: 2px;
		cursor: pointer;
	`;
}

const MENU_ID = 'HAL_Component_Tray';

function handleContextMenu(event, compname){
	event.preventDefault();
	contextMenu.show({
	  id: MENU_ID,
	  event: event,
	  props: {
		  comp: compname
	  }
	})
}

export class TrayItemWidget extends React.Component<TrayItemWidgetProps> {
	render() {
		return (

			<S.Tray
				color={this.props.color}
				draggable={true}
				onDragStart={(event) => {
					event.dataTransfer.setData('storm-diagram-node', JSON.stringify(this.props.model));
				}}
				onContextMenu={(event) => {handleContextMenu(event, this.props.name)}}
				//onContextMenu={(event) => {HAL_get_Manual(this.props.name);}}
				className="tray-item">
				{this.props.name}
			</S.Tray>

		);
	}
}