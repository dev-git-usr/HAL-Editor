import * as React from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
//import { ContextMenu, MenuItem, ContextMenuTrigger, connectMenu} from "react-contextmenu";
import {ContextMenu} from './ContextMenu';
import {FiHelpCircle} from 'react-icons/fi'
import { HAL_get_Manual } from './haldata/connector';
import { Menu, Item, Separator, Submenu } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.css';
 
const MENU_ID = 'HAL_Component_Tray';

namespace S {

export const Container = styled.div`
	width: 100%;
	height:100%;
	overflow: scroll;
	overflow-x: hidden;
	`;
	export const Tray = styled.div`
		background: rgb(20, 20, 20);
		flex-grow: 0;
		flex-shrink: 0;
	`;
}

const handleItemClick = ({ event, props }) => HAL_get_Manual(props.comp);


export class TrayWidget extends React.Component {
	render() {
		return (<S.Container>
			<Menu id={MENU_ID}>
				<Item onClick={handleItemClick}>Show Manual</Item>
			</Menu>
            <S.Tray>{this.props.children}</S.Tray>
      	</S.Container>
		);
	}
}