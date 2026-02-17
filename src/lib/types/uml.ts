import * as joint from "@joint/core";

// Note: this is only for autocomplete, jointjs handles them internally

export interface IUMLClass extends joint.dia.Element {
    updateLayout: () => void;

    get(key: 'name'): string;
    get(key: 'attributesList'): string[];
    get(key: 'operationsList'): string[];
}

export interface IUMLLink extends joint.dia.Link {
    updateLabels: () => void;

    get(key: 'sourceMultiplicity'): string;
    get(key: 'name'): string;
    get(key: 'targetMultiplicity'): string;
}
