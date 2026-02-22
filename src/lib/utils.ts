import * as joint from "@joint/core";
import { get } from 'svelte/store';
import { JointJSClass } from "./components/JointJS/JointJSClass";
import { JointJSAssociation } from "./components/JointJS/JointJSAssociation";
import { conf } from ".";

export enum EditorMode {
    Panning,
    Selection,
    Class,
    Association,
    Generalization,
    Note
}

const cellNamespace = {
    ...joint.shapes,
    custom: {
        JointJSClass,
        JointJSAssociation,
    },
};

export const graph: joint.dia.Graph = new joint.dia.Graph(
    {},
    { cellNamespace: cellNamespace },
);

const editorMode = EditorMode.Association;

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
        args: {
            padding: get(conf).gridSize * 2
        },
    },
    snapLinks: true,
    labelsLayer: true,
    defaultConnectionPoint: { name: 'anchor' },
    markAvailable: true,
    interactive: {
        labelMove: true,
        linkMove: true,

    },
    snapLabels: true,
    linkPinning: false,
    defaultLink:
        function(_cellView: any, _magnet: any) {
            if (editorMode == EditorMode.Association) {
                return new JointJSAssociation();
            }

            return new joint.shapes.standard.Link();
        },
    validateConnection: function(
        cellViewS,
        magnetS,
        cellViewT,
        magnetT,
        _end,
        linkView,
    ) {
        if (!magnetT || !magnetS) {
            return false;
        }

        const portT = magnetT.getAttribute('port');
        const portS = magnetS.getAttribute('port');

        const isBad = graph.getLinks().some(link => {
            if (link.id == linkView.model.id) {
                return false;
            }

            return link.get('source').port == portT || link.get('target').port == portT || link.get('source').port == portS || link.get('target').port == portS;
        })

        if (isBad) {
            return false;
        }

        return (
            cellViewS.model instanceof JointJSClass &&
            cellViewT.model instanceof JointJSClass &&
            magnetT?.getAttribute("port") != null &&
            linkView.model instanceof JointJSAssociation
        );
    },
    validateMagnet: function(cellView, magnet) {
        if (
            editorMode != EditorMode.Association &&
            editorMode != EditorMode.Generalization
        ) {

            return false;
        }

        return true;
    },
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

// TODO: export svg without grid
export function exportSVG() {
    const url = URL.createObjectURL(
        new Blob([new XMLSerializer().serializeToString(paper.svg)], {
            type: "image/svg+xml;charset=utf-8",
        }),
    );

    const a = document.createElement("a");
    a.href = url;
    a.download = "diagram.svg";
    a.click();

    URL.revokeObjectURL(url);
}

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
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        try {
            const text = await file.text();
            const json = JSON.parse(text);

            graph.fromJSON(json);
        } catch (err) {
            alert("Invalid JSON file.");
            console.error(err);
        }
    });

    input.click(); // Must happen inside user event
}
