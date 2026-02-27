<script lang="ts">
    import { EditorMode, graph, paper } from "$lib/utils";
    import * as joint from "@joint/core";

    let {
        selectedCellViews = $bindable([]),
        editorMode = $bindable(),
        mouseButton = $bindable(),
    }: {
        selectedCellViews: joint.dia.CellView[];
        editorMode: EditorMode;
        mouseButton: number;
    } = $props();

    const selectionRectangle: joint.shapes.standard.Rectangle =
        new joint.shapes.standard.Rectangle();
    selectionRectangle.attr({
        body: {
            fill: "rgba(0, 162, 255, 0.1)",
            stroke: "#00A2FF",
        },
    });

    let previousSelectedCellViews: joint.dia.CellView[] = [];

    $effect(() => {
        for (const cellView of previousSelectedCellViews) {
            cellView.hideTools();
        }

        previousSelectedCellViews = selectedCellViews;

        for (const cellView of selectedCellViews) {
            cellView.showTools();
        }
    });

    paper.on(
        "blank:pointerdown",
        function (event: joint.dia.Event, x: number, y: number) {
            mouseButton = event.button || 0;

            if (editorMode !== EditorMode.Selection || mouseButton !== 0) {
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

    paper.on(
        "blank:pointermove",
        function (_event: joint.dia.Event, x: number, y: number) {
            if (editorMode !== EditorMode.Selection || mouseButton !== 0) {
                return;
            }

            const width = Math.max(x - selectionRectangle.position().x, 0);
            const height = Math.max(y - selectionRectangle.position().y, 0);

            selectionRectangle.size(width, height);
            selectionRectangle.attr({ body: { width, height } });
        },
    );

    paper.on("blank:pointerup", function () {
        if (selectionRectangle.graph === null) {
            return;
        }

        selectedCellViews = paper
            .findCellViewsInArea(selectionRectangle.getBBox(), { strict: true })
            .filter((cellView) => cellView.model != selectionRectangle);
        selectionRectangle.remove();
    });
</script>
