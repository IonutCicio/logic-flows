import * as joint from "@joint/core";

// Note: this is only for autocomplete, jointjs handles them internally

export interface IUMLClass extends joint.dia.Element {
    update: () => void;

    get(key: 'name'): string;
    get(key: 'attributes'): string[];
    get(key: 'operations'): string[];
}

export interface IUMLLink extends joint.dia.Link {
    update: () => void;

    get(key: 'sourceMultiplicity'): string;
    get(key: 'name'): string;
    get(key: 'targetMultiplicity'): string;
}
