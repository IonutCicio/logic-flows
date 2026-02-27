import * as joint from "@joint/core";
import { get } from 'svelte/store';
import { JointJSClass } from "./components/JointJS/JointJSClass";
import { JointJSAssociation } from "./components/JointJS/JointJSAssociation";
import { conf } from ".";
import { JointJSNote } from "./components/JointJS/JointJSNote";
import { JointJSGeneralization } from "./components/JointJS/JointJSGeneralization";

export enum EditorMode {
    Panning,
    Selection,
    Class,
    Generalization,
    Note
}


const cellNamespace = {
    ...joint.shapes,
    custom: {
        JointJSClass,
        JointJSAssociation,
        JointJSGeneralization,
        JointJSNote,
    },
};

export const graph: joint.dia.Graph = new joint.dia.Graph(
    {},
    { cellNamespace },
);


graph.on("add remove change", function(cell: any) {
    if (
        !(
            cell instanceof JointJSClass ||
            cell instanceof JointJSAssociation ||
            cell instanceof JointJSGeneralization ||
            cell instanceof JointJSNote
        )
    ) {
        return;
    }

    localStorage.setItem("diagram", JSON.stringify(graph.toJSON()));
});

export const paper: joint.dia.Paper = new joint.dia.Paper({
    model: graph,
    background: { color: "white" },
    cellViewNamespace: cellNamespace,
    gridSize: get(conf).gridSize,
    drawGrid: {
        name: "fixedDot",
    },
    defaultRouter: {
        name: "manhattan",
        args: {},
    },
    snapLinks: true,
    defaultConnectionPoint: { name: 'anchor' },
    markAvailable: true,
    snapLabels: true,
    linkPinning: false,
});

export function darkenHSL(hslString: string, amount = 20): string {
    // hsl(h, s%, l%)
    const match = hslString.match(/hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/);

    if (!match) {
        return hslString;
    }

    let h = parseFloat(match[1]);
    const s = parseFloat(match[2]);
    let l = parseFloat(match[3]);

    l = Math.max(0, l - amount);

    if (h == 0) {
        return 'hsl(0, 0%, 30%)';
    }

    return `hsl(${h}, ${s}%, ${l}%)`;
}

export function getBorderColor(color: string): string {
    // check: white HSL (0% saturation, 100% lightness)
    if (/hsl\(\d+,\s*0%?,\s*100%?\)/.test(color)) {
        return "hsl(0, 100%, 0%)";
    }

    return darkenHSL(color, 20);
}


export function lengthToGridEven(length: number): number {
    return Math.ceil(length / (get(conf).gridSize * 2)) * get(conf).gridSize * 2
}


export function textWidth(text: string) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');

    textElement.setAttribute('font-size', `${get(conf).fontSize}px`);
    // TODO: if this is called before Cascadia Code font is loaded, it chooses some other font, which is smaller,
    textElement.setAttribute('font-family', 'Cascadia Code');
    textElement.textContent = text;

    svg.appendChild(textElement);
    document.body.appendChild(svg);
    const bbox = textElement.getBBox();

    document.body.removeChild(svg);
    return bbox.width;
}

export function exportSVG() {
    const bbox = paper.getContentBBox();
    const svg = paper.el.querySelector("svg")?.cloneNode(true);
    if (!svg || !bbox || !(svg instanceof Element)) {
        return
    }

    svg.setAttribute('width', `${bbox.width}`);
    svg.setAttribute('height', `${bbox.height}`);
    svg.setAttribute('viewBox', `
    ${bbox.x} 
    ${bbox.y} 
    ${bbox.width} 
    ${bbox.height}
`);


    svg.querySelector('.joint-grid-layer')?.remove();
    svg.querySelector('.joint-tools-layer')?.remove();

    const url = URL.createObjectURL(
        new Blob([new XMLSerializer().serializeToString(svg)], {
            type: "image/svg+xml;charset=utf-8",
        }),
    );

    const a = document.createElement("a");
    a.href = url;
    a.download = "diagram.svg";
    a.click();

    URL.revokeObjectURL(url);
}

// function svgToPNG(svgString, width, height) {
//     return new Promise((resolve) => {
//         const img = new Image();
//         const blob = new Blob([svgString], { type: "image/svg+xml" });
//         const url = URL.createObjectURL(blob);
//
//         img.onload = function() {
//             const canvas = document.createElement("canvas");
//             canvas.width = width;
//             canvas.height = height;
//
//             const ctx = canvas.getContext("2d");
//             ctx.drawImage(img, 0, 0);
//
//             URL.revokeObjectURL(url);
//             resolve(canvas);
//         };
//
//         img.src = url;
//     });
// }
//
// const canvas = await svgToPNG(svgString, 1000, 800);
// const pngDataUrl = canvas.toDataURL("image/png");
//
// async function copyCanvasToClipboard(canvas) {
//     return new Promise((resolve) => {
//         canvas.toBlob(async (blob) => {
//             await navigator.clipboard.write([
//                 new ClipboardItem({
//                     "image/png": blob
//                 })
//             ]);
//             resolve();
//         });
//     });
// }

export function exportJSON() {
    const url = URL.createObjectURL(
        new Blob([JSON.stringify(graph.toJSON())], {
            type: "application/json",
        }),
    );

    const a = document.createElement("a");
    a.href = url;
    // TODO: handle filename
    a.download = "diagram.json";
    a.click();
}

export function importJSON() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.addEventListener("change", async (event: Event) => {
        const file = (event.target as HTMLInputElement).files?.item(0);
        if (!file) {
            return;
        }

        try {
            const text = await file?.text();
            const json = JSON.parse(text);

            graph.fromJSON(json);
        } catch (err) {
            alert("Invalid JSON file.");
            console.error(err);
        }
    });

    input.click(); // Must happen inside user event
}
