import { UMLAttributeData, type IUMLClass, type UMLOperation } from '$lib/types/uml';
import { lengthToGridEven, textWidth } from '$lib/utils';
import { conf } from '$lib';
import { get } from 'svelte/store';
import * as joint from '@joint/core';
import { ManuallyOrderedMap } from '$lib/collections.svelte';

function operationToString(operation: UMLOperation): string {
    const paramsStr = operation.parameters
        ?.map((param) => `${param.name}: ${param.type} `)
        .join(", ");

    const paramsPart = paramsStr ? `(${paramsStr})` : "()";

    let result = `${operation.name}${paramsPart} `;

    if (operation.type) {
        result += `: ${operation.type} `;
    }

    return result.trim();
}

function getPerimeterPorts(width: number, height: number, id: joint.dia.Cell.ID) {
    let ports = []

    let portSerialId = 0
    for (let x = 0; x <= width; x += (get(conf).gridSize * 2)) {
        portSerialId++;
        ports.push({ id: `${id}-port-t-${portSerialId} `, args: { x, y: 0 } })
        ports.push({ id: `${id}-port-b-${portSerialId} `, args: { x, y: height } })
    }

    portSerialId = 0;
    for (let y = get(conf).gridSize; y < height; y += get(conf).gridSize) {
        portSerialId++;
        ports.push({ id: `${id}-port-l-${portSerialId} `, args: { x: 0, y } })
        ports.push({ id: `${id}-port-r-${portSerialId} `, args: { x: width, y } })
    }

    return ports;
}

export const JointJSClass = joint.dia.Element.define(
    'custom.JointJSClass',
    {
        name: 'Class',
        attributes: new ManuallyOrderedMap(),
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
                y: get(conf).gridSize,
                textAnchor: 'middle',
                textVerticalAnchor: 'middle',
                style: 'font-weight: 400 !important',
                fontSize: get(conf).fontSize,
            },
            divider1: {
                x1: 0, x2: 'calc(w)', y1: get(conf).gridSize * 2, y2: get(conf).gridSize * 2,
                stroke: 'black',
                strokeWidth: 1,
            },
            divider2: {
                x1: 0,
                x2: 'calc(w)',
                stroke: 'black',
                strokeWidth: 1,
            }
        },
        ports: {
            items: []
        }
    },
    {
        markup: [],

        initialize: function(this: IUMLClass) {
            joint.dia.Element.prototype.initialize.apply(this, arguments as any);
            this.on(
                "change:size change:attrs change:name change:attributes change:operations",
                this.update,
            );
            this.update();
        },

        update: function(this: IUMLClass) {
            const name = this.get("name");
            const attributes: ManuallyOrderedMap<string, UMLAttributeData> = this.get("attributes");
            const operations = this.get("operations");

            const attrs: Record<string, any> = {};
            const markup: string | joint.dia.MarkupJSON = [
                { tagName: "rect", selector: "body" },
                { tagName: "text", selector: `name` },
                { tagName: "line", selector: `divider1` },
                { tagName: "line", selector: `divider2` },
            ];

            attrs["name"] = { text: name };

            attrs["divider1"] = {
                visibility:
                    attributes.size > 0 || operations.length > 0 ? "visible" : "hidden",
            };

            let width = lengthToGridEven(textWidth(name) + get(conf).gridSize)
            let y = get(conf).gridSize * 2; // divider1

            attributes.entries().forEach(([name, attr], index) => {
                width = Math.max(width, lengthToGridEven(textWidth(`${name}: ${attr.toString()}`) + get(conf).gridSize));

                const text = {
                    y: y + get(conf).gridSize,
                    fontSize: get(conf).fontSize,
                    textVerticalAnchor: "middle",
                    fill: 'black'
                }

                attrs[`attribute-${index}`] = { x: get(conf).gridSize / 2, ...text };
                attrs[`attribute-name-${index}`] = { text: `${name}: `, ...text };
                attrs[`attribute-type-${index}`] = { text: attr.type.toString(), fontWeight: "normal", ...text };
                attrs[`attribute-multiplicity-${index}`] = { text: attr.multiplicity.toString(), ...text }
                attrs[`attribute-id-${index}`] = { text: attr.identifier.toString(), fontStyle: "italic", ...text }
                markup.push({
                    tagName: "text",
                    selector: `attribute-${index}`,
                    children: [
                        { tagName: "tspan", selector: `attribute-name-${index}` },
                        { tagName: "tspan", selector: `attribute-type-${index}` },
                        { tagName: "tspan", selector: `attribute-multiplicity-${index}` },
                        { tagName: "tspan", selector: `attribute-id-${index}` }
                    ]
                });

                y += get(conf).gridSize * 2;

            });

            attrs["divider2"] = {
                y1: y,
                y2: y,
                visibility:
                    attributes.size > 0 && operations.length > 0 ? "visible" : "hidden",
            };

            operations.forEach((op, index) => {
                const text = operationToString(op);
                width = Math.max(width, lengthToGridEven(textWidth(text) + get(conf).gridSize));

                attrs[`operation${index} `] = {
                    text: text,
                    x: get(conf).gridSize / 2,
                    y: y + get(conf).gridSize,
                    textAnchor: "left",
                    textVerticalAnchor: "middle",
                    fontSize: get(conf).fontSize,
                };
                markup.push({ tagName: "text", selector: `operation${index} ` });

                y += get(conf).gridSize * 2;
            });

            width = Math.max(lengthToGridEven(this.size().width), width);
            const height = Math.max(
                lengthToGridEven(this.size().height),
                lengthToGridEven(y),
            );

            this.resize(width, height);
            this.attr(attrs);
            this.set('ports', {
                items: getPerimeterPorts(width, height, this.id).map(port => {
                    return {
                        attrs: {
                            body: {
                                magnet: true,
                                r: get(conf).gridSize / 2,
                                fill: 'transparent',
                                strokeWidth: 2,
                            }
                        },
                        markup: [
                            {
                                tagName: 'circle',
                                selector: 'body'
                            },
                        ],
                        ...port
                    }
                })
            })
            this.set('markup', markup)
        }
    }
);
