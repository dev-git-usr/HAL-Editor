import { CustomPortModel } from './CustomPortModel';
import { AbstractModelFactory } from '@projectstorm/react-canvas-core';

export class CustomPortFactory extends AbstractModelFactory {
	constructor() {
		super('customport');
	}

	generateModel() {
		return new CustomPortModel({
			name: 'unknown'
		});
	}
}