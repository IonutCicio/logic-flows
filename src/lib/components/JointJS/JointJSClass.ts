import type { IUMLClass } from '$lib/types/uml';
import { FONT_SIZE, GRID_SIZE, textWidth } from '$lib/utils';
import * as joint from '@joint/core';

function lengthToGridEven(length: number): number {
    return Math.ceil(length / (GRID_SIZE * 2)) * GRID_SIZE * 2
}

export const JointJSClass = joint.dia.Element.define(
    'custom.UMLClass',
    {
        name: 'Class',
        attributes: [],
        operations: [],
        attrs: {
            body: {
                refWidth: '100%',
                refHeight: '100%',
                strokeWidth: 2,
                stroke: 'black',
                fill: 'white',
            },
            name: {
                refX: '50%',
                y: GRID_SIZE,
                textAnchor: 'middle',
                textVerticalAnchor: 'middle',
                style: 'font-weight: 400 !important',
                fontSize: FONT_SIZE,
            },
            divider1: {
                x1: 0, x2: '100%', y1: GRID_SIZE * 2, y2: GRID_SIZE * 2,
                stroke: 'black',
                strokeWidth: .5,
            },
            divider2: {
                x1: 0,
                x2: '100%',
                stroke: 'black',
                strokeWidth: .5,
            }
        }
    },
    {
        markup: [],

        initialize: function(this: IUMLClass) {
            joint.dia.Element.prototype.initialize.apply(this, arguments as any);
            this.on('change:size change:attrs change:name change:attributes change:operations', this.update);
            this.update();
        },

        update: function(this: IUMLClass) {
            const name = this.get('name') || 'Class';
            const attributes = this.get('attributes') || [];
            const operations = this.get('operations') || [];

            const attrs: Record<string, any> = {};
            const markup: string | joint.dia.MarkupJSON = [];

            let width = lengthToGridEven(this.size().width);
            let height = lengthToGridEven(this.size().height);

            width = Math.max(
                width,
                Math.ceil((textWidth(name) + GRID_SIZE) / (GRID_SIZE * 2)) * GRID_SIZE * 2
            )

            attrs['name'] = { text: name };

            attrs['divider1'] = {
                x2: width,
                visibility: (attributes.length > 0 || operations.length > 0) ? 'visible' : 'hidden'
            };

            let y = GRID_SIZE * 2; // divider1

            attributes.forEach((text, index) => {
                width = Math.max(width, lengthToGridEven(textWidth(text) + GRID_SIZE))

                attrs[`attribute${index}`] = {
                    text: text,
                    x: GRID_SIZE / 2,
                    y: y + GRID_SIZE,
                    textAnchor: 'left',
                    textVerticalAnchor: 'middle',
                    fontSize: FONT_SIZE,
                    fill: '#000',
                };
                markup.push({ tagName: 'text', selector: `attribute${index}` })

                y += GRID_SIZE * 2;
            })

            attrs['divider2'] = {
                x2: width,
                y1: y,
                y2: y,
                visibility: (attributes.length > 0 && operations.length > 0) ? 'visible' : 'hidden'
            };

            operations.forEach((text, index) => {
                width = Math.max(width, lengthToGridEven(textWidth(text) + GRID_SIZE))

                attrs[`operation${index}`] = {
                    text: text,
                    x: GRID_SIZE / 2,
                    y: y + GRID_SIZE,
                    textAnchor: 'left',
                    textVerticalAnchor: 'middle',
                    fontSize: FONT_SIZE,
                };
                markup.push({ tagName: 'text', selector: `operation${index}` })

                y += GRID_SIZE * 2;
            })


            height = Math.max(height, lengthToGridEven(y))

            this.resize(width, height);
            this.attr(attrs);
            this.set('markup', [
                { tagName: 'rect', selector: 'body' },
                { tagName: 'text', selector: `name` },
                { tagName: 'line', selector: `divider1` },
                { tagName: 'line', selector: `divider2` },
                ...markup
            ])
        }
    }
);
