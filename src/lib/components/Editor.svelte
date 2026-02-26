<script lang="ts">
    import * as joint from "@joint/core";
    import {
        EditorMode,
        paper,
        graph,
        exportJSON,
        exportSVG,
        importJSON,
    } from "$lib/utils";
    import { JointJSClass } from "./JointJS/JointJSClass";
    import PropertyInspector from "$lib/components/view/PropertyInspector.svelte";
    import Toolbar from "./view/Toolbar.svelte";
    import { ClassResizeTool } from "./JointJS/ClassResizeTool";
    import { JointJSNote } from "./JointJS/JointJSNote";
    import { JointJSAssociation } from "./JointJS/JointJSAssociation";
    import { JointJSGeneralization } from "./JointJS/JointJSGeneralization";

    let editorMode: EditorMode = $state(EditorMode.Panning);
    let selectedCellViews = $state<joint.dia.CellView[]>([]);
    const selectionRectangle: joint.shapes.standard.Rectangle =
        new joint.shapes.standard.Rectangle();

    let copiedViews: joint.dia.CellView[];

    let paperEl: HTMLElement;

    export function handleKeydown(e: KeyboardEvent) {
        if (e.ctrlKey || e.metaKey) {
            if (e.key.toLowerCase() === "s") {
                e.preventDefault();
                exportJSON();
            }

            if (e.key.toLowerCase() === "e") {
                e.preventDefault();
                exportSVG();
            }

            if (e.key.toLowerCase() === "i") {
                e.preventDefault();
                importJSON();
            }

            if (e.key.toLowerCase() === "c") {
                copiedViews = selectedCellViews;
            }

            if (e.key.toLowerCase() === "v") {
                for (const cellView of copiedViews) {
                    const newModel = cellView.model.clone();
                    const pos = newModel.position();
                    newModel.addTo(graph);
                    const newCellView = paper.findViewByModel(newModel);
                    newCellView.model.position(pos.x + 20, pos.y + 20);
                }
            }
        }

        if (e.key == "Escape") {
            select([]);
        }

        if (
            e.target instanceof HTMLElement &&
            e.target.tagName.toLowerCase() == "input"
        ) {
            return;
        }

        if (e.key == "Backspace" || e.key == "Delete") {
            for (const cellView of selectedCellViews) {
                cellView.model.remove();
            }
            selectedCellViews = [];

            return;
        }

        if (e.key === "1") {
            editorMode = EditorMode.Panning;
        }

        if (e.key === "2") {
            editorMode = EditorMode.Selection;
        }

        if (e.key === "3") {
            editorMode = EditorMode.Class;
        }

        if (e.key === "4") {
            editorMode = EditorMode.Association;
        }

        if (e.key === "5") {
            editorMode = EditorMode.Generalization;
        }

        if (e.key === "6") {
            editorMode = EditorMode.Note;
        }
    }

    function select(cellViews: joint.dia.CellView[]) {
        for (const cellView of selectedCellViews) {
            cellView.hideTools();
            joint.highlighters.stroke.remove(cellView, "highlight-selected");
        }

        selectedCellViews = cellViews;

        if (cellViews.length > 0) {
            if (cellViews.length == 1) {
                cellViews[0].showTools();
            }
            for (const cellView of cellViews) {
                const isClass = cellView.model instanceof JointJSClass;
                joint.highlighters.stroke.add(
                    cellView,
                    isClass ? { selector: "body" } : { selector: "line" },
                    "highlight-selected",
                    {
                        padding: isClass ? 6 : 0,
                        // layer: isClass && cellViews.length > 1 ? null : "back", // "back" prevents the highlighter to cover the link
                        attrs: {
                            stroke: "black",
                            // stroke: isClass
                            //    ? darkenHSL(cellView.model.attr("body/stroke"))
                            //    : darkenHSL(cellView.model.attr("line/stroke")),
                            // "stroke-width": isClass ? 3 : 12,
                        },
                    },
                );
            }
        }
    }

    graph.on("add remove change", function (cell: any) {
        if (
            !(
                cell instanceof JointJSClass ||
                cell instanceof JointJSAssociation ||
                cell instanceof JointJSGeneralization ||
                cell instanceof JointJSNote
            )
        )
            return;

        localStorage.setItem("diagram", JSON.stringify(graph.toJSON()));
    });

    graph.on("add", function (cell) {
        const cellView = paper.findViewByModel(cell);

        if (cell.isLink()) {
            cellView.addTools(
                new joint.dia.ToolsView({
                    tools: [
                        new joint.linkTools.Vertices({
                            redundancyRemoval: true,
                            vertexAdding: true,
                            snapRadius: 20,
                            scale: 2,
                        }),
                        new joint.linkTools.Remove(),
                        new joint.linkTools.Boundary(),
                        new joint.linkTools.Segments(),
                        new joint.linkTools.SourceArrowhead({}),
                        new joint.linkTools.TargetArrowhead(),
                    ],
                }),
            );
        }

        if (cell instanceof JointJSClass || cell instanceof JointJSNote) {
            cellView.addTools(
                new joint.dia.ToolsView({
                    tools: [
                        new joint.elementTools.Boundary(),
                        new joint.elementTools.Remove(),
                        new ClassResizeTool({
                            selector: "body",
                        }),
                    ],
                }),
            );
        }

        cellView.hideTools();
    });

    paper.options.defaultLink = function (_cellView: any, _magnet: any) {
        if (editorMode == EditorMode.Association) {
            return new JointJSAssociation();
        }

        if (editorMode == EditorMode.Generalization) {
            return new JointJSGeneralization();
        }

        return new joint.shapes.standard.Link();
    };

    paper.options.validateMagnet = function (cellView, magnet) {
        if (
            editorMode != EditorMode.Association &&
            editorMode != EditorMode.Generalization
        ) {
            return false;
        }

        return true;
    };

    paper.options.validateConnection = function (
        cellViewS,
        magnetS,
        cellViewT,
        magnetT,
        _end,
        linkView,
    ) {
        if (
            !(
                linkView.model instanceof JointJSGeneralization ||
                linkView.model instanceof JointJSAssociation
            )
        ) {
            return false;
        }

        if (!magnetT || !magnetS) {
            return false;
        }

        const portT = magnetT.getAttribute("port");
        const portS = magnetS.getAttribute("port");

        const arePortsOccupied = graph.getLinks().some((link) => {
            if (link.id == linkView.model.id) {
                return false;
            }

            return (
                (link instanceof JointJSAssociation &&
                    (link.get("target").port == portT ||
                        link.get("target").port == portS)) ||
                link.get("source").port == portT ||
                link.get("source").port == portS
            );
        });

        if (arePortsOccupied) {
            return false;
        }

        return (
            cellViewS.model instanceof JointJSClass &&
            cellViewT.model instanceof JointJSClass &&
            magnetT?.getAttribute("port") != null
        );
    };

    paper.on("blank:pointerclick", (event, x, y) => {
        event.preventDefault();

        if (editorMode == EditorMode.Class) {
            const obj = new JointJSClass();
            obj.position(x, y);
            obj.addTo(graph);
            select([paper.findViewByModel(obj)]);
            return;
        }

        if (editorMode == EditorMode.Note) {
            const obj = new JointJSNote();
            obj.position(x, y);
            obj.addTo(graph);
            select([paper.findViewByModel(obj)]);
            return;
        }

        select([]);
    });

    paper.on(
        "cell:pointerclick",
        function (cellView: joint.dia.CellView, evt: joint.dia.Event) {
            evt.stopPropagation();
            select([cellView]);
            editorMode = EditorMode.Panning;
        },
    );

    paper.on({
        "blank:pointerdown": (evt, x, y) => {
            evt.data = { x, y, button: evt.button };

            if (EditorMode.Selection && evt.data && evt.data.button == 0) {
                selectionRectangle.addTo(graph);
                selectionRectangle.position(x, y);
                selectionRectangle.attr({
                    body: {
                        width: 0,
                        height: 0,
                        fill: "rgba(0, 162, 255, 0.1)",
                        stroke: "#00A2FF",
                    },
                });
            }
        },
        "blank:pointermove cell:pointermove": (evt) => {
            const currentPoint = paper.clientToLocalPoint(
                evt.clientX ?? 0,
                evt.clientY ?? 0,
            );

            if (
                evt.data &&
                (editorMode == EditorMode.Panning || evt.data.button === 1)
            ) {
                const dx = (currentPoint.x ?? 0) - evt.data.x;
                const dy = (currentPoint.y ?? 0) - evt.data.y;

                const translate = paper.translate();
                paper.translate(translate.tx + dx, translate.ty + dy);
            }

            if (
                editorMode == EditorMode.Selection &&
                evt.data &&
                evt.data.button == 0
            ) {
                const width = Math.max(
                    currentPoint.x - selectionRectangle.position().x,
                    0,
                );
                const height = Math.max(
                    currentPoint.y - selectionRectangle.position().y,
                    0,
                );
                selectionRectangle.size(width, height);
                selectionRectangle.attr({ body: { width, height } });
            }
        },
        "blank:pointerup cell:pointerup": (_evt) => {
            if (
                editorMode == EditorMode.Selection &&
                selectionRectangle.graph != null
            ) {
                select(
                    paper
                        .findCellViewsInArea(selectionRectangle.getBBox(), {
                            strict: true,
                        })
                        .filter(
                            (cellView) => cellView.model != selectionRectangle,
                        ),
                );
                selectionRectangle.remove();
            }
        },
    });

    $effect(() => {
        paper.setElement(paperEl);
        paper.setDimensions(paperEl.clientWidth, paperEl.clientHeight);
        paper.render();

        const diagramJSON = localStorage.getItem("diagram");
        if (diagramJSON) {
            graph.fromJSON(JSON.parse(diagramJSON));
        }
    });
</script>

<svelte:window
    onresize={() => paper.setDimensions(window.innerWidth, window.innerHeight)}
    onkeydown={handleKeydown}
/>

<div class="relative flex flex-col w-full h-screen">
    <Toolbar bind:editorMode />

    <div class="flex w-full h-full">
        <div class="w-72 h-full bg-white border-r border-gray-300">
            <PropertyInspector cellViews={selectedCellViews} />
        </div>
        <div id="paper" class="w-full h-full" bind:this={paperEl}></div>
    </div>
</div>

<!-- onclick={() => { -->
<!--     select([]); -->
<!-- }} -->

<!-- {#if selectedCellViews.length > 0} -->
<!-- {/if} -->
<!-- <div class="relative w-full h-full"> -->
<!--     <div id="paper" class="w-full h-full" bind:this={paperEl}></div> -->
<!---->
<!--     {#if selectedCellViews.length > 0} -->
<!--         <div -->
<!--             class="absolute top-0 left-0 h-full bg-white border-r w-100 border-gray-300" -->
<!--         > -->
<!--             <PropertyInspector cellViews={selectedCellViews} /> -->
<!--         </div> -->
<!--     {/if} -->
<!-- </div> -->
