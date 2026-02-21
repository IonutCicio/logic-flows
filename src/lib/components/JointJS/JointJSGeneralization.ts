import * as joint from "@joint/core";
import type { IUMLLink } from "$lib/types/uml";
import { FONT_SIZE, GRID_SIZE } from "$lib/utils";

const RECT = {
	fill: "white",
	stroke: "white",
	strokeWidth: GRID_SIZE / 2,
};

export const JointJSGeneralization = joint.dia.Link.define(
	"custom.UMLGeneralization",
	{
		...joint.dia.Link.prototype.defaults,
		name: "Generalization",
		attrs: {
			line: {
				connection: true,
				stroke: "hsl(0, 0%, 0%)",
				strokeWidth: 2,
				fill: "none",
				targetMarker: {
					type: "path",
					d: "M 10 -5 0 0 10 5 Z",
					fill: "none",
					stroke: "hsl(0, 0%, 0%)",
					strokeWidth: 2,
				},
			},
			wrapper: {
				connection: true,
				strokeWidth: 10,
			},
		},
		labels: [
			{
				position: 0.5,
				attrs: {
					text: {
						"font-size": FONT_SIZE,
						"font-style": "italic",
					},
					rect: RECT,
				},
			},
		],
	},
	{
		markup: [
			{
				tagName: "path",
				selector: "wrapper",
				attributes: {
					fill: "none",
					cursor: "pointer",
					stroke: "transparent",
				},
			},
			{
				tagName: "path",
				selector: "line",
				attributes: {
					fill: "none",
					"pointer-events": "none",
				},
			},
		],

		initialize: function (this: IUMLLink) {
			joint.dia.Link.prototype.initialize.apply(this, arguments as any);
			this.on("change:name", this.update);
			this.update();
		},

		update: function (this: IUMLLink) {
			this.label(0, { attrs: { text: { text: this.get("name") || "" } } });
		},
	},
);
