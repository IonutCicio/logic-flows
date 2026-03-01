<script lang="ts">
    import { EditorMode, graph, paper } from "$lib/utils";
    import * as joint from "@joint/core";
    import { ClassResizeTool } from "../JointJS/ClassResizeTool";

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
        // graph.startBatch("update");
        for (const cellView of previousSelectedCellViews) {
            cellView.removeTools();
        }

        previousSelectedCellViews = selectedCellViews;

        for (const cellView of selectedCellViews) {
            if (selectedCellViews.length > 1) {
                cellView.addTools(
                    new joint.dia.ToolsView({
                        tools: [
                            cellView.model instanceof joint.dia.Element
                                ? new joint.elementTools.Boundary()
                                : new joint.linkTools.Boundary(),
                        ],
                    }),
                );

                continue;
            }

            if (cellView.model instanceof joint.dia.Link) {
                cellView.addTools(
                    new joint.dia.ToolsView({
                        tools: [
                            new joint.linkTools.Vertices({
                                redundancyRemoval: true,
                                vertexAdding: true,
                                snapRadius: 10,
                                scale: 1,
                            }),
                            new joint.linkTools.Remove(),
                            new joint.linkTools.Boundary(),
                            new joint.linkTools.Segments(),
                            new joint.linkTools.SourceArrowhead(),
                            new joint.linkTools.TargetArrowhead(),
                        ],
                    }),
                );
            }

            if (cellView.model instanceof joint.dia.Element) {
                cellView.addTools(
                    new joint.dia.ToolsView({
                        tools: [
                            new joint.elementTools.Boundary(),
                            new joint.elementTools.Remove(),
                            new ClassResizeTool({ selector: "body" }),
                        ],
                    }),
                );
            }
        }
        // graph.stopBatch("update");
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
            .findCellViewsInArea(selectionRectangle.getBBox())
            .filter((cellView) => cellView.model != selectionRectangle);
        selectionRectangle.remove();
    });
</script>

<!-- // import { JointJSClass } from "../JointJS/JointJSClass"; -->
<!-- // import { JointJSNote } from "../JointJS/JointJSNote"; -->
<!-- // for (const cell of graph.getCells()) { -->
<!-- //     initializeTools(cell); -->
<!-- // } -->
<!-- // graph.on("add", initializeTools); -->
<!---->
<!-- // function initializeTools(cell: any) { -->
<!-- //     // const cellView = paper.findViewByModel(cell); -->
<!-- //     // cellView.hideTools(); -->
<!-- // } -->
<!---->
