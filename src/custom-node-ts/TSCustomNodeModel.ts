import * as _ from 'lodash';
import React, {useState } from 'react';
import { NodeModel, NodeModelGenerics, PortModelAlignment } from '@projectstorm/react-diagrams-core';
import { CustomPortModel } from './CustomPortModel';
import { BasePositionModelOptions, DeserializeEvent } from '@projectstorm/react-canvas-core';
import { handleselectionchanged } from '../main';

export interface TSCustomNodeModelOptions extends BasePositionModelOptions {
	name?: string;
	HAL_ID?: number;
	Comp?: object;
	color?: string;
	isvisible?: boolean;
}

export interface TSCustomNodeModelGenerics extends NodeModelGenerics {
	OPTIONS: TSCustomNodeModelOptions;
}

export class TSCustomNodeModel extends NodeModel<TSCustomNodeModelGenerics> {
	protected portsIn: CustomPortModel[];
	protected portsOut: CustomPortModel[];
	constructor(name: string, color: string);
	constructor(options?: TSCustomNodeModelOptions);
	constructor(options: any = {}, color?: string) {
		if (typeof options === 'string') {
			options = {
				name: options,
				color: color
			};
		}
		super({
			type: 'ts-custom-node',
			name: 'Untitled',
			HAL_ID: null,
			Comp: null,
			color: 'rgb(0,192,255)',
			isvisible: true,
			...options
		});
		this.portsOut = [];
		this.portsIn = [];
		this.registerListener({
			selectionChanged: e => {
				handleselectionchanged(e);
			}
		});

	}


	doClone(lookupTable: {}, clone: any): void {
		clone.portsIn = [];
		clone.portsOut = [];
		super.doClone(lookupTable, clone);
	}

	removePort(port: CustomPortModel): void {
		super.removePort(port);
		if (port.direction === 'in') {
			this.portsIn.splice(this.portsIn.indexOf(port), 1);
		} else {
			this.portsOut.splice(this.portsOut.indexOf(port), 1);
		}
	}

	addPort<T extends CustomPortModel>(port: T): T {
		super.addPort(port);
		if (port.direction === 'in') {
			if (this.portsIn.indexOf(port) === -1) {
				this.portsIn.push(port);
			}
		} else {
			if (this.portsOut.indexOf(port) === -1) {
				this.portsOut.push(port);
			}
		}
		return port;
	}

	deserialize(event: DeserializeEvent<this>) {
		super.deserialize(event);
		this.options.name = event.data.name;
		this.options.HAL_ID = event.data.HAL_ID;
		this.options.Comp = event.data.Comp;
		this.options.color = event.data.color;
		this.options.isvisible = event.data.isvisible;
		this.portsIn = _.map(event.data.portsInOrder, (id) => {
			return this.getPortFromID(id);
		}) as CustomPortModel[];
		this.portsOut = _.map(event.data.portsOutOrder, (id) => {
			return this.getPortFromID(id);
		}) as CustomPortModel[];
	}

	serialize(): any {
		return {
			...super.serialize(),
			name: this.options.name,
			HAL_ID: this.options.HAL_ID,
			Comp: this.options.Comp,
			color: this.options.color,
			isvisible: this.options.isvisible,
			portsInOrder: _.map(this.portsIn, (port) => {
				return port.getID();
			}),
			portsOutOrder: _.map(this.portsOut, (port) => {
				return port.getID();
			})
		};
	}

	getInPorts(): CustomPortModel[] {
		return this.portsIn;
	}

	getOutPorts(): CustomPortModel[] {
		return this.portsOut;
	}
}