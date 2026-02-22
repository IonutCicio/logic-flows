import * as joint from "@joint/core";

// Note: this is only for autocomplete, jointjs handles them internally

export interface IUMLClass extends joint.dia.Element {
	update: () => void;

	get(key: "name"): string;
	get(key: "attributes"): UMLAttribute[];
	get(key: "operations"): UMLOperation[];
}

export interface IUMLLink extends joint.dia.Link {
	update: () => void;

	get(key: "sourceMultiplicity"): string;
	get(key: "name"): string;
	get(key: "targetMultiplicity"): string;
}

export interface UMLAttribute {
	name: string;
	type: string;
	multiplicity?: string;
	isIdentifier: boolean;
}

export interface UMLParameter {
	name: string;
	type: string;
}

export interface UMLOperation {
	name: string;
	parameters?: UMLParameter[];
	type: string;
}
