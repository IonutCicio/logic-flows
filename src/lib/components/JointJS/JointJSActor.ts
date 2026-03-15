import { lengthToGridEven } from '$lib/utils';
import * as joint from '@joint/core';

export const JointJSActor = joint.dia.Element.define(
    'custom.JointJSActor',
    {
        name: "",
        size: { width: 90, height: 120 },
        attrs: {
            circle: {
                refCx: '50%',
                refCy: 20,
                r: 15,
                stroke: 'black',
                fill: 'none',
                'stroke-width': 2
            },
            body: {
                x1: '50%',
                y1: 35,
                x2: '50%',
                y2: 80,
                stroke: 'black',
                'stroke-width': 2
            },
            arms: {
                x1: 10,
                y1: 55,
                x2: 80,
                y2: 55,
                stroke: 'black',
                'stroke-width': 2
            },
            leftLeg: {
                x1: '50%',
                y1: 80,
                x2: 10,
                y2: 110,
                stroke: 'black',
                'stroke-width': 2
            },
            rightLeg: {
                x1: '50%',
                y1: 80,
                x2: 80,
                y2: 110,
                stroke: 'black',
                'stroke-width': 2
            }
        }
    },
    {
        markup: [
            { tagName: 'circle', selector: 'circle' },
            { tagName: 'line', selector: 'body' },
            { tagName: 'line', selector: 'arms' },
            { tagName: 'line', selector: 'leftLeg' },
            { tagName: 'line', selector: 'rightLeg' }
        ],

        initialize: function(this) {
            joint.dia.Element.prototype.initialize.apply(this, arguments as any);
            this.on(
                "change:size change:attrs change:name change:content",
                this.update
            )
            this.update();
        },

        update: function(this) {
            this.resize(70, 110)
        }
    }
)

