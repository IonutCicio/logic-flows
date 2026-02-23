import { lengthToGridEven } from '$lib/utils';
import * as joint from '@joint/core';

export const JointJSNote = joint.dia.Element.define(
    'custom.JointJSNote',
    {
        attrs: {
            body: {
                refWidth: '100%',
                refHeight: '100%',
                strokeWidth: 2,
                stroke: 'black',
                fill: 'white'
            },
            foreignObject: {
                width: 'calc(w)',
                height: 'calc(h)',
                x: 0,
                y: 0,
            }
        }
    },
    {
        markup: joint.util.svg`
            <rect @selector="body"/>
            <foreignObject @selector="foreignObject">
                <div xmlns="http://www.w3.org/1999/xhtml" class="px-2 py-1" >
                    <b>ciao</b> come <i>stai</i>?
                </div>
            </foreignObject>
        `,
        // markup: [
        //     {
        //         tagName: 'rect',
        //         selector: 'body'
        //     },
        //     {
        //         tagName: 'foreignObject',
        //         selector: 'foreignObject',
        //         // TODO: add body
        //     }
        // ],

        initialize: function(this) {
            joint.dia.Element.prototype.initialize.apply(this, arguments as any);
            this.on(
                "change:size change:attrs change:name change:content",
                this.update
            )
            this.update();
        },

        update: function(this) {
            this.resize(
                lengthToGridEven(this.size().width),
                lengthToGridEven(this.size().height)
            );
        }
    }
)
