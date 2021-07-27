import {
	PortModelAlignment
} from '@projectstorm/react-diagrams-core';
import { DefaultLinkModel, DefaultPortModel } from '@projectstorm/react-diagrams';
import { engine } from '../main';
import { BasePositionModelOptions, DeserializeEvent } from '@projectstorm/react-canvas-core';
import { PortModel, PortModelGenerics } from '@projectstorm/react-diagrams-core';

export interface TSCustomPortModelOptions extends BasePositionModelOptions {
	name: string;
	label: string;
	portType: any;
	Comp?: object;
	color?: string;
	isvisible?: boolean;
	updatecounter?: number;
	showvalue?: boolean;
	value?: any;
}

export interface TSCustomPortModelGenerics extends PortModelGenerics {
	OPTIONS: TSCustomPortModelOptions;
}
export class CustomPortModel extends PortModel<TSCustomPortModelGenerics> {
    direction: any;
    allowConnection: boolean;
	constructor(options?: TSCustomPortModelOptions);
	constructor(options: any = {}, color?: string) {
		if (typeof options === 'string') {
			options = {
				name: options,
				color: color
			};
		}
		super({
			type: 'customport',
			name: 'Untitled',
			HAL_ID: null,
			Comp: null,
			value: null,
			alignment: options.direction === 'in' ? PortModelAlignment.LEFT : PortModelAlignment.RIGHT,
			allowConnection: null,
			color: 'rgb(0,192,255)',
			isvisible: true,
			showvalue: true,
			...options
		});
		this.direction = options.direction;
		/*this.portType = portType;
		this.direction = direction;
		this.value = value;
		this.allowConnection = allowConnection;
		this.isvisible = true;*/
	}
	/*
    constructor({ label, direction, portType, name, value, allowConnection }) {
		super({
			label,
			alignment: direction === 'in' ? PortModelAlignment.LEFT : PortModelAlignment.RIGHT,
			type: 'customport',
			name,
		});

		this.portType = portType;
		this.direction = direction;
		this.value = value;
		this.allowConnection = allowConnection;
		this.isvisible = true;
	}*/

	deserialize(event) {
		super.deserialize(event);
		this.options.label = event.data.label;
		this.options.portType = event.data.portType;
		this.direction = event.data.direction;
		this.allowConnection = event.data.allowConnection;
		this.options.isvisible = event.data.isvisible;
		this.options.updatecounter = event.data.updatecounter;
		this.options.showvalue = event.data.showvalue;
		this.options.value = event.data.value;
	}

	serialize() {
		return {
			...super.serialize(),
			label: this.options.label,
			portType: this.options.portType,
			direction: this.direction,
			allowConnection: this.allowConnection,
			isvisible: this.options.isvisible,
			updatecounter: this.options.updatecounter,
			showvalue: this.options.showvalue,
			value: this.options.value,
		};
	}
	link(port, factory?) {
		let link = this.createLinkModel(factory);
		link.setSourcePort(this);
		link.setTargetPort(port);
		return link;
	}


	canLinkToPort(port) {
		if (port instanceof CustomPortModel) {
			const sameDirection = this.direction === port.direction;
			const samePortType = this.options.portType.type === port.options.portType.type;
			const portTypeAny = this.options.portType.type === 'any' || port.options.portType.type === 'any'; 
			if (!sameDirection && (samePortType || portTypeAny)) return true;
		}
		return false;
	}

	createLinkModel(factory) {
		let link = super.createLinkModel();
		if (!link && factory) {
			return factory.generateModel({});
		}
		return link || new DefaultLinkModel();
	}
}