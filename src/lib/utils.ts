import * as joint from "@joint/core";

export function darkenHSL(hslString: string, amount = 20): string {
    // Match hsl(h, s%, l%)
    const match = hslString.match(/hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/);

    if (!match) return hslString;

    let h = parseFloat(match[1]);
    const s = parseFloat(match[2]);
    let l = parseFloat(match[3]);

    l = Math.max(0, l - amount);

    if (h == 0) {
        return 'hsl(0, 0%, 30%)';
    }

    return `hsl(${h}, ${s}%, ${l}%)`;
}

export function lengthToGridEven(length: number): number {
    return Math.ceil(length / (GRID_SIZE * 2)) * GRID_SIZE * 2
}

export function getBorderColor(color: string): string {
    // check: white HSL (0% saturation, 100% lightness)
    if (/hsl\(\d+,\s*0%?,\s*100%?\)/.test(color)) {
        return "hsl(0, 100%, 0%)";
    }
    return darkenHSL(color, 20);
}


export const GRID_SIZE = 16;
export const FONT_SIZE = 13;


export function textWidth(text: string) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');

    textElement.setAttribute('font-size', `${FONT_SIZE}px`);
    // TODO: if this is called before Cascadia Code font is loaded, it chooses some other font, which is smaller,
    textElement.setAttribute('font-family', 'Cascadia Code');
    textElement.textContent = text;

    svg.appendChild(textElement);
    document.body.appendChild(svg);
    const bbox = textElement.getBBox();

    document.body.removeChild(svg);
    return bbox.width;
}

export function exportSvgImage(paper: joint.dia.Paper) {
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

export enum EditorMode {
    Panning,
    Selection,
    Class,
    Association,
    Generalization,
    Note
}
