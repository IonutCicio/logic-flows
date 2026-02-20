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

function adjustVertices(graph: joint.dia.Graph, cell: joint.dia.Cell) {
    // // if `cell` is a view, find its model
    // cell = cell.model || cell;
    //
    // if (cell instanceof joint.dia.Element) {
    //     // `cell` is an element
    //
    //     _.chain(graph.getConnectedLinks(cell))
    //         .groupBy(function(link) {
    //             // the key of the group is the model id of the link's source or target
    //             // cell id is omitted
    //             return _.omit(
    //                 [link.source().id, link.target().id],
    //                 cell.id,
    //             )[0];
    //         })
    //         .each(function(group, key) {
    //             // if the member of the group has both source and target model
    //             // then adjust vertices
    //             if (key !== "undefined")
    //                 adjustVertices(graph, _.first(group));
    //         })
    //         .value();
    //
    //     return;
    // }
    //
    // // `cell` is a link
    // // get its source and target model IDs
    // var sourceId = cell.get("source").id || cell.previous("source").id;
    // var targetId = cell.get("target").id || cell.previous("target").id;
    //
    // // if one of the ends is not a model
    // // (if the link is pinned to paper at a point)
    // // the link is interpreted as having no siblings
    // if (!sourceId || !targetId) return;
    //
    // // identify link siblings
    // var siblings = _.filter(graph.getLinks(), function(sibling) {
    //     var siblingSourceId = sibling.source().id;
    //     var siblingTargetId = sibling.target().id;
    //
    //     // if source and target are the same
    //     // or if source and target are reversed
    //     return (
    //         (siblingSourceId === sourceId &&
    //             siblingTargetId === targetId) ||
    //         (siblingSourceId === targetId && siblingTargetId === sourceId)
    //     );
    // });
    //
    // var numSiblings = siblings.length;
    // switch (numSiblings) {
    //     case 0: {
    //         // the link has no siblings
    //         break;
    //     }
    //     case 1: {
    //         // there is only one link
    //         // no vertices needed
    //         cell.unset("vertices");
    //         break;
    //     }
    //     default: {
    //         // there are multiple siblings
    //         // we need to create vertices
    //
    //         // find the middle point of the link
    //         var sourceCenter = graph.getCell(sourceId).getBBox().center();
    //         var targetCenter = graph.getCell(targetId).getBBox().center();
    //         var midPoint = g.Line(sourceCenter, targetCenter).midpoint();
    //
    //         // find the angle of the link
    //         var theta = sourceCenter.theta(targetCenter);
    //
    //         // constant
    //         // the maximum distance between two sibling links
    //         var GAP = 20;
    //
    //         _.each(siblings, function(sibling, index) {
    //             // we want offset values to be calculated as 0, 20, 20, 40, 40, 60, 60 ...
    //             var offset = GAP * Math.ceil(index / 2);
    //
    //             // place the vertices at points which are `offset` pixels perpendicularly away
    //             // from the first link
    //             //
    //             // as index goes up, alternate left and right
    //             //
    //             //  ^  odd indices
    //             //  |
    //             //  |---->  index 0 sibling - centerline (between source and target centers)
    //             //  |
    //             //  v  even indices
    //             var sign = index % 2 ? 1 : -1;
    //
    //             // to assure symmetry, if there is an even number of siblings
    //             // shift all vertices leftward perpendicularly away from the centerline
    //             if (numSiblings % 2 === 0) {
    //                 offset -= (GAP / 2) * sign;
    //             }
    //
    //             // make reverse links count the same as non-reverse
    //             var reverse = theta < 180 ? 1 : -1;
    //
    //             // we found the vertex
    //             var angle = g.toRad(theta + sign * reverse * 90);
    //             var vertex = g.Point.fromPolar(offset, angle, midPoint);
    //
    //             // replace vertices array with `vertex`
    //             sibling.vertices([vertex]);
    //         });
    //     }
    // }
}
