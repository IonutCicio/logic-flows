import type { IUMLLink } from "$lib/types/uml";
import * as joint from "@joint/core";

export const JointJSAssociation = joint.dia.Link.define('custom.UMLAssociation', {
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
            position: 16,
            attrs: {
                text: { text: '', 'font-size': 12 },
                rect: { fill: 'white' }
            }
        },
        // 1: Association Name
        {
            position: 0.5,
            attrs: {
                text: { text: '', 'font-size': 12, 'font-style': 'italic' },
                rect: { fill: 'white' }
            }
        },
        // 2: Target Multiplicity
        {
            position: -16,
            attrs: {
                text: { text: '', 'font-size': 12 },
                rect: { fill: 'white' }
            }
        }
    ]
}, {
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
        this.on('change:sourceMultiplicity change:name change:targetMultiplicity', this.updateLabels);
        this.updateLabels();
    },

    updateLabels: function(this: IUMLLink) {
        this.label(0, { attrs: { text: { text: this.get('sourceMultiplicity') || '' } } });
        this.label(1, { attrs: { text: { text: this.get('name') || '' } } });
        this.label(2, { attrs: { text: { text: this.get('targetMultiplicity') || '' } } });
    }
});
