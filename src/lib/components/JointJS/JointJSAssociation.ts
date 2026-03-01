import type { IUMLLink } from "$lib/types/uml";
import { conf } from "$lib";
import { get } from 'svelte/store';
import * as joint from "@joint/core";
import { lengthToGridEven, textLength } from "$lib/utils";

export const JointJSAssociation = joint.dia.Link.define(
    'custom.JointJSAssociation',
    {
        ...joint.dia.Link.prototype.defaults,
        sourceMultiplicity: '0..*',
        name: 'association',
        targetMultiplicity: '0..*',
        attrs: {
            line: {
                connection: true,
                stroke: 'black',
                strokeWidth: 2,
                fill: 'none'
            },
            wrapper: {
                connection: true,
                strokeWidth: 20
            }
        },
        labels: [
            // 0: Source Multiplicity
            {
                attrs: {
                    text: { 'font-size': get(conf).fontSize },
                    rect: {
                        fill: 'white',
                        stroke: 'white',
                        strokeWidth: get(conf).gridSize / 3
                    },
                }
            },
            // 1: Association Name
            {
                position: 0.5,
                attrs: {
                    text: {
                        'font-size': get(conf).fontSize,
                        'font-style': 'italic'
                    },
                    rect: {
                        fill: 'white',
                        stroke: 'white',
                    }
                }
            },
            // 2: Target Multiplicity
            {
                attrs: {
                    text: { 'font-size': get(conf).fontSize },
                    rect: {
                        fill: 'white',
                        stroke: 'white',
                        strokeWidth: get(conf).gridSize / 3
                    },
                }
            }
        ]
    },
    {
        markup: [
            {
                tagName: 'path',
                selector: 'wrapper',
                attributes: {
                    'fill': 'none',
                    'cursor': 'pointer',
                    'stroke': 'transparent'
                }
            },
            {
                tagName: 'path',
                selector: 'line',
                attributes: {
                    'fill': 'none',
                    'pointer-events': 'none'
                }
            },
        ],

        initialize: function(this: IUMLLink) {
            joint.dia.Link.prototype.initialize.apply(this, arguments as any);
            // this.on('change:sourceMultiplicity change:name change:targetMultiplicity all', this.update);
            this.on('all', this.update);
            this.update();
        },

        update: function(this: IUMLLink) {
            let sourcePosition = get(conf).gridSize * 1.5;
            if (
                this.get("source")?.port?.includes("port-b-") ||
                this.get("source")?.port?.includes("port-t-")
            ) {
                sourcePosition = get(conf).gridSize * 1
            }

            this.label(0, {
                attrs: {
                    text: {
                        text: this.get('sourceMultiplicity') || '',
                    },
                    rect: {
                        width: lengthToGridEven(textLength(this.get('sourceMultiplicity') || ''))
                    }
                },
                position: sourcePosition * 3,
            });
            this.label(1, {
                attrs: {
                    text: {
                        text: this.get('name') || ''
                    },
                    rect: {
                        x: -lengthToGridEven(textLength(this.get('name') || '')) / 2,
                        width: lengthToGridEven(textLength(this.get('name') || ''))
                    }
                }
            });

            let targetPosition = get(conf).gridSize * 1.5;
            if (
                this.get("target")?.port?.includes("port-b-") ||
                this.get("target")?.port?.includes("port-t-")
            ) {
                targetPosition = get(conf).gridSize * 1
            }

            this.label(2, {
                attrs: {
                    text: {
                        text: this.get('targetMultiplicity') || ''
                    },
                    rect: {
                        width: lengthToGridEven(textLength(this.get('targetMultiplicity') || ''))
                    }
                },
                position: -1 * targetPosition * 3
            });
        }
    }
);
