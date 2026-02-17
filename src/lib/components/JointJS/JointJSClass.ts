import { isStringArray } from '$lib/types/typeSafety';
import type { IUMLClass } from '$lib/types/uml';
import * as joint from '@joint/core';


export const JointJSClass = joint.dia.Element.define('custom.UMLClass', {
    size: { width: 200, height: 50 },
    name: 'Class',
    attributesList: [],
    operationsList: [],
    attrs: {
        body: {
            refWidth: '100%',
            refHeight: '100%',
            stroke: '#000000',
            strokeWidth: 1,
            fill: '#FFFFFF',
        },
        headerDivider: {
            stroke: '#000000',
            strokeWidth: 1,
            x1: 0,
            x2: 'calc(w)',
            visibility: 'visible'
        },
        attributesDivider: {
            stroke: '#000000',
            strokeWidth: 1,
            x1: 0,
            x2: 'calc(w)',
            visibility: 'hidden' // initially hidden, visible after there are operations
        },
        nameText: {
            text: 'Class',
            fontWeight: 'bold',
            fontSize: 14,
            fill: '#000000',
            textAnchor: 'middle',
            textVerticalAnchor: 'middle',
            refX: '50%',
            refY: 0,
        },
        attributesText: {
            text: '',
            fontSize: 12,
            fill: '#000000',
            textAnchor: 'left',
            refX: 5,
            refY: 0,
            textVerticalAnchor: 'top',
        },
        operationsText: {
            text: '',
            fontSize: 12,
            fill: '#000000',
            textAnchor: 'left',
            refX: 5,
            refY: 0,
            textVerticalAnchor: 'top',
        }
    }
}, {
    markup: [
        {
            tagName: 'rect',
            selector: 'body'
        },
        {
            tagName: 'line',
            selector: 'headerDivider'
        },
        {
            tagName: 'line',
            selector: 'attributesDivider'
        },
        {
            tagName: 'text',
            selector: 'nameText'
        },
        {
            tagName: 'text',
            selector: 'attributesText'
        },
        {
            tagName: 'text',
            selector: 'operationsText'
        }
    ],

    initialize: function(this: IUMLClass) {
        joint.dia.Element.prototype.initialize.apply(this, arguments as any);
        this.on('change:size change:attrs change:name change:attributesList change:operationsList', this.updateLayout);
        this.updateLayout();
    },

    updateLayout: function(this: IUMLClass) {
        const GRID_SIZE = 16;

        const headerHeight = GRID_SIZE * 2;
        const fontSize = 12;
        const lineHeight = GRID_SIZE;
        const padding = GRID_SIZE / 2;
        const leftPadding = GRID_SIZE / 4;

        const width = this.size().width;
        const name = this.get('name') || 'ClassName'; // TODO: default name
        const attributes = isStringArray(this.get('attributesList')) ? this.get('attributesList') : [];
        const operations = isStringArray(this.get('operationsList')) ? this.get('operationsList') : [];

        const markup = [
            { tagName: 'rect', selector: 'body' },
            { tagName: 'line', selector: 'headerDivider' },
            { tagName: 'line', selector: 'attributesDivider' },
            { tagName: 'text', selector: 'nameText' }
        ];
        attributes.forEach((_, index) => markup.push({ tagName: 'text', selector: `attribute-${index}` }));
        operations.forEach((_, index) => markup.push({ tagName: 'text', selector: `operation-${index}` }));
        this.set('markup', markup);

        const attrs: Record<string, any> = {};

        attrs['nameText'] = {
            text: name,
            x: 0,
            y: headerHeight / 2,
            textAnchor: 'middle',
            textVerticalAnchor: 'middle',
            fontWeight: 'bold',
            fontSize: 14,
            fill: '#000'
        };

        attrs['headerDivider'] = {
            x1: 0, x2: width, y1: headerHeight, y2: headerHeight,
            stroke: this.attr('body/stroke') || '#000',
            strokeWidth: 1,
            visibility: attributes.length > 0 ? 'visible' : 'hidden'
        };

        let cursorY = headerHeight + padding;

        for (let attribute = 0; attribute < attributes.length; attribute++) {
            attrs[`attribute-${attribute}`] = {
                text: attributes[attribute],
                x: leftPadding,
                y: cursorY,
                textAnchor: 'start',
                textVerticalAnchor: 'top',
                fontSize,
                fill: '#000',
                textWrap: {
                    width: `calc(w - ${leftPadding})`,
                    height: lineHeight,
                    ellipsis: true
                }
            };


            cursorY += lineHeight;
        }

        const attrDividerY = cursorY + (attributes.length > 0 ? padding : 0);
        attrs['attributesDivider'] = {
            x1: 0, x2: width, y1: attrDividerY, y2: attrDividerY,
            stroke: this.attr('body/stroke') || '#000',
            strokeWidth: 1,
            visibility: operations.length > 0 ? 'visible' : 'hidden'
        };

        cursorY = attrDividerY + padding;

        for (let operation = 0; operation < operations.length; operation++) {
            const txt = String(operations[operation] ?? '');

            attrs[`operation-${operation}`] = {
                text: txt,
                x: leftPadding,
                y: cursorY,
                textAnchor: 'start',
                textVerticalAnchor: 'top',
                fontSize,
                fill: '#000',
                textWrap: {
                    width: `calc(w - ${leftPadding})`,
                    height: lineHeight,
                    ellipsis: true
                }
            };

            cursorY += lineHeight;
        }

        const totalHeight = Math.max(Math.max(50, cursorY + padding), this.size().height);
        this.attr(attrs);
        this.resize(width, totalHeight);
    }
});
