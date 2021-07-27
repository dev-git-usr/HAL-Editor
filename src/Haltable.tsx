import * as React from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
//import { ContextMenu, MenuItem, ContextMenuTrigger, connectMenu} from "react-contextmenu";
import {ContextMenu} from './ContextMenu';
import { Checkbox } from '@material-ui/core';
import { hide_Port } from './main';

/*
Table showing HAL Pins of a Node
*/

export interface HaltableProps {
	node: object;
}
export class  Haltable extends React.Component<HaltableProps> {
	render() {
        const css = `
		table {
			font-family: arial, sans-serif;
			border-collapse: collapse;
			width: 100%;
		  }
		  
		  td, th {
			border: 1px solid #dddddd;
			text-align: left;
			padding-left: 8px;
		  }
		  
		  tr:nth-child(even) {
			background-color: #dddddd;
		  }
		`;
	return (
        <div>
                <style>
                    {css}
                </style>
        <table>
            <thead>
            <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Datatype</th>
                <th>Direction</th>
                <th>Visible</th>
                <th>Value</th>
                <th>Connections</th>
            </tr>
            </thead>
            <tbody>
                {
                Object.keys(this.props.node.ports).map(function(keyName, obj) {
                    return(
                    <tr key={keyName}>
                        <th>
                            {keyName}
                        </th>
                        <th>
                            Pin
                        </th>
                        <th>
                            {this.props.node.ports[keyName].getOptions().portType}
                        </th>
                        <th>
                            {this.props.node.ports[keyName].getOptions().direction}
                        </th>
                        <th>
                            <Checkbox
                                style={{
                                    padding: 0,
                                }}
                                defaultChecked={this.props.node.ports[keyName].getOptions().isvisible}
                                onClick={(event) => hide_Port(this.props.node.ports[keyName], event.target.checked)}
                            />
                        </th>
                        <th>
                            {this.props.node.ports[keyName].getOptions().value}
                        </th>
                        <th>
                            {Object.keys(this.props.node.ports[keyName].links).length.toString()}
                        </th>
                    </tr>
                    )
            }, this)}
            </tbody>
        </table>
        </div>

	);
	}
}