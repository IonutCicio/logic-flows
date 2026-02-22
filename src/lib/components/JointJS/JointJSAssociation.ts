import type { IUMLLink } from "$lib/types/uml";
import { conf } from "$lib";
import { get } from 'svelte/store';
import * as joint from "@joint/core";

const RECT = {
    fill: 'white',
    stroke: 'white',
    strokeWidth: get(conf).gridSize / 2
}

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
                position: get(conf).gridSize * 1.5,
                attrs: {
                    text: { 'font-size': get(conf).fontSize },
                    rect: RECT,
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
                    rect: RECT,
                    wdith: get(conf).gridSize * 5
                }
            },
            // 2: Target Multiplicity
            {
                position: -get(conf).gridSize * 1.5,
                attrs: {
                    text: { 'font-size': get(conf).fontSize },
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
