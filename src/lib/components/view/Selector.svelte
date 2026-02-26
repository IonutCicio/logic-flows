<script lang="ts">
    import { EditorMode, graph, paper } from "$lib/utils";
    import * as joint from "@joint/core";

    let {
        selectedCellViews = $bindable([]),
        editorMode = $bindable(),
    }: { selectedCellViews: joint.dia.CellView[]; editorMode: EditorMode } =
        $props();

    const selectionRectangle: joint.shapes.standard.Rectangle =
        new joint.shapes.standard.Rectangle();
    selectionRectangle.attr({
        body: {
            fill: "rgba(0, 162, 255, 0.1)",
            stroke: "#00A2FF",
        },
    });

    let button: number = 0;

    function select(cellViews: joint.dia.CellView[]) {
        console.log(cellViews.length());
        for (const cellView of selectedCellViews) {
            cellView.hideTools();
        }

        selectedCellViews = cellViews;

        for (const cellView of selectedCellViews) {
            cellView.showTools();
        }
    }

    paper.on(
        "blank:pointerdown",
        function (_event: joint.dia.Event, x: number, y: number) {
            if (editorMode !== EditorMode.Selection || button !== 0) {
                return;
            }

            selectionRectangle.addTo(graph);
            selectionRectangle.position(x, y);
            selectionRectangle.attr({
                body: {
                    width: 0,
                    height: 0,
                },
            });
            selectionRectangle.toFront();
        },
    );

    paper.on("blank:pointermove ", function (event: joint.dia.Event) {
        if (editorMode !== EditorMode.Selection || button !== 0) {
            return;
        }

        const paperPoint = paper.clientToLocalPoint(
            event.clientX ?? 0,
            event.clientY ?? 0,
        );

        const width = Math.max(
            paperPoint.x - selectionRectangle.position().x,
            0,
        );
        const height = Math.max(
            paperPoint.y - selectionRectangle.position().y,
            0,
        );
        selectionRectangle.size(width, height);
        selectionRectangle.attr({ body: { width, height } });
    });

    paper.on("blank:pointerup", function () {
        if (selectionRectangle.graph === null) {
            return;
        }
        select(
            paper
                .findCellViewsInArea(selectionRectangle.getBBox(), {
                    strict: true,
                })
                .filter((cellView) => cellView.model != selectionRectangle),
        );
        selectionRectangle.remove();
    });

    // paper.on({
    //     "cell:pointermove": (evt) => {
    //         // if (
    //         //     evt.data &&
    //         //     (editorMode == EditorMode.Panning || evt.data.button === 1)
    //         // ) {
    //         //     const dx = (currentPoint.x ?? 0) - evt.data.x;
    //         //     const dy = (currentPoint.y ?? 0) - evt.data.y;
    //         //
    //         //     const translate = paper.translate();
    //         //     paper.translate(translate.tx + dx, translate.ty + dy);
    //         // }
    //     },
    //     "blank:pointerup cell:pointerup": (_evt) => {
    //         if (
    //             editorMode == EditorMode.Selection &&
    //             selectionRectangle.graph != null
    //         ) {
    //             select(
    //                 paper
    //                     .findCellViewsInArea(selectionRectangle.getBBox(), {
    //                         strict: true,
    //                     })
    //                     .filter(
    //                         (cellView) => cellView.model != selectionRectangle,
    //                     ),
    //             );
    //             selectionRectangle.remove();
    //         }
    //     },
    // });
    // if (
    //     editorMode == EditorMode.Selection &&
    //     selectionRectangle.graph != null
    // ) {
    //     select(
    //         paper
    //             .findCellViewsInArea(selectionRectangle.getBBox(), {
    //                 strict: true,
    //             })
    //             .filter(
    //                 (cellView) => cellView.model != selectionRectangle,
    //             ),
    //     );
    //     selectionRectangle.remove();
    // }

    // evt.data = { x, y, button: evt.button };
    // event.data &&
    // event.data.button == 0

    // if (cellViews.length === 1) {
    //     cellViews[0].showTools();
    // }

    // const isClass = cellView.model instanceof JointJSClass;
    // joint.highlighters.stroke.add(
    //     cellView,
    //     isClass ? { selector: "body" } : { selector: "line" },
    //     "highlight-selected",
    //     {
    //         padding: isClass ? 6 : 0,
    //         // layer: isClass && cellViews.length > 1 ? null : "back", // "back" prevents the highlighter to cover the link
    //         attrs: {
    //             stroke: "black",
    //             // stroke: isClass
    //             //    ? darkenHSL(cellView.model.attr("body/stroke"))
    //             //    : darkenHSL(cellView.model.attr("line/stroke")),
    //             // "stroke-width": isClass ? 3 : 12,
    //         },
    //     },
    // );
    // joint.highlighters.stroke.remove(cellView, "highlight-selected");
    // if (cellViews.length > 0) {
    // }
    // let selectedCellViews = $state<joint.dia.CellView[]>([]);
</script>
