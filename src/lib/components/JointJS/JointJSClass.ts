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
            stroke: 'hsl(0, 0%, 30%)',
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

        const attrs: Record<string, any> = {};

        attrs['body'] = {
            stroke: 'hsl(0, 0%, 30%)',
            strokeWidth: 1,
            fill: '#FFFFFF',
        };

        attrs['nameText'] = {
            text: name,
            refX: '50%',
            y: headerHeight / 2,
            textAnchor: 'middle',
            textVerticalAnchor: 'middle',
            fontWeight: 'bold',
            fontSize: 14,
            fill: '#000'
        };

        attrs['headerDivider'] = {
            x1: 0, x2: width, y1: headerHeight, y2: headerHeight,
            stroke: '#000000',
            strokeWidth: 1,
            visibility: (attributes.length > 0 || operations.length > 0) ? 'visible' : 'hidden'
        };

        let attributesY = headerHeight + padding;
        let attributesHeight = attributes.length * lineHeight;
        let afterAttributesY = attributesY + attributesHeight;

        attrs['attributesText'] = {
            text: attributes.length > 0 ? attributes.join('\n') : '',
            refX: null,
            x: leftPadding,
            y: attributesY,
            textAnchor: 'start',
            textVerticalAnchor: 'top',
            fontSize,
            fill: '#000',
            lineHeight: lineHeight,
            visibility: attributes.length > 0 ? 'visible' : 'hidden'
        };

        let attributesDividerY: number;
        let operationsY: number;

        if (attributes.length > 0) {
            attributesDividerY = afterAttributesY + padding;
            operationsY = attributesDividerY + padding;
        } else {
            attributesDividerY = headerHeight; // not used if hidden
            operationsY = headerHeight + padding;
        }

        attrs['attributesDivider'] = {
            x1: 0, x2: width, y1: attributesDividerY, y2: attributesDividerY,
            stroke: '#000000',
            strokeWidth: 1,
            visibility: (attributes.length > 0 && operations.length > 0) ? 'visible' : 'hidden'
        };

        let operationsHeight = operations.length * lineHeight;
        let afterOperationsY = operationsY + operationsHeight;

        attrs['operationsText'] = {
            text: operations.length > 0 ? operations.join('\n') : '',
            refX: null,
            x: leftPadding,
            y: operationsY,
            textAnchor: 'start',
            textVerticalAnchor: 'top',
            fontSize,
            fill: '#000',
            lineHeight: lineHeight,
            visibility: operations.length > 0 ? 'visible' : 'hidden'
        };

        let cursorY = (operations.length > 0 ? afterOperationsY : (attributes.length > 0 ? afterAttributesY : headerHeight)) + padding;

        const totalHeight = Math.max(50, cursorY);
        this.resize(width, totalHeight);
        this.attr(attrs);
    }
});