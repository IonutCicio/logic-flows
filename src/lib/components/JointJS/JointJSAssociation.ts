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
            this.on('change:sourceMultiplicity change:name change:targetMultiplicity', this.update);
            // this.on('all', this.update);
            this.update();
        },

        update: function(this: IUMLLink) {
            const sourceLabelLength = lengthToGridEven(textLength(this.get('sourceMultiplicity') || ''))
            let sourceLabelPosition = sourceLabelLength / 2 + get(conf).gridSize / 2;
            if (
                this.get("source")?.port?.includes("port-b-") ||
                this.get("source")?.port?.includes("port-t-")
            ) {
                sourceLabelPosition = get(conf).gridSize;
            }


            this.label(0, {
                attrs: {
                    text: {
                        text: this.get('sourceMultiplicity') || '',
                    },
                    rect: {
                        width: sourceLabelLength
                    }
                },
                position: sourceLabelPosition,
            });

            // ----

            const targetLabelLength = lengthToGridEven(textLength(this.get('targetMultiplicity') || ''))
            let targetPosition = (targetLabelLength / 2 + get(conf).gridSize / 2)
            if (
                this.get("target")?.port?.includes("port-b-") ||
                this.get("target")?.port?.includes("port-t-")
            ) {
                targetPosition = get(conf).gridSize;
            }

            this.label(2, {
                attrs: {
                    text: {
                        text: this.get('targetMultiplicity') || ''
                    },
                    rect: {
                        x: - targetLabelLength / 2,
                        width: targetLabelLength
                    }
                },
                position: -1 * targetPosition
            });

            // ----

            const nameLabelLength = lengthToGridEven(textLength(this.get('name') || ''))

            this.label(1, {
                attrs: {
                    text: {
                        text: this.get('name') || ''
                    },
                    rect: {
                        x: - nameLabelLength / 2,
                        width: nameLabelLength
                    }
                }
            });

        }
    }
);
