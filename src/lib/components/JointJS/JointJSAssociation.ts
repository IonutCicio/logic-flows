import type { IUMLLink } from "$lib/types/uml";
import { FONT_SIZE, GRID_SIZE } from "$lib/utils";
import * as joint from "@joint/core";

const RECT = {
    fill: 'white',
    stroke: 'white',
    strokeWidth: GRID_SIZE / 2
}

export const JointJSAssociation = joint.dia.Link.define(
    'custom.UMLAssociation',
    {
        ...joint.dia.Link.prototype.defaults,
        sourceMultiplicity: '0..*',
        name: 'Association',
        targetMultiplicity: '0..*',
        attrs: {
            line: {
                connection: true,
                stroke: 'hsl(0, 0%, 0%)',
                strokeWidth: 2,
                fill: 'none'
            },
            wrapper: {
                connection: true,
                strokeWidth: 10
            }
        },
        labels: [
            // 0: Source Multiplicity
            {
                position: GRID_SIZE,
                attrs: {
                    text: { 'font-size': FONT_SIZE },
                    rect: RECT,
                }
            },
            // 1: Association Name
            {
                position: 0.5,
                attrs: {
                    text: {
                        'font-size': FONT_SIZE,
                        'font-style': 'italic'
                    },
                    rect: RECT,
                }
            },
            // 2: Target Multiplicity
            {
                position: -GRID_SIZE,
                attrs: {
                    text: { 'font-size': FONT_SIZE },
                    rect: RECT,
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
            }
        ],

        initialize: function(this: IUMLLink) {
            joint.dia.Link.prototype.initialize.apply(this, arguments as any);
            this.on('change:sourceMultiplicity change:name change:targetMultiplicity', this.update);
            this.update();
        },

        update: function(this: IUMLLink) {
            this.label(0, { attrs: { text: { text: this.get('sourceMultiplicity') || '' } } });
            this.label(1, { attrs: { text: { text: this.get('name') || '' } } });
            this.label(2, { attrs: { text: { text: this.get('targetMultiplicity') || '' } } });
        }
    });
