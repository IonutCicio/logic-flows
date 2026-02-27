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
    import Selection from "./view/Selection.svelte";
    import Panning from "./view/Panning.svelte";

    let selectedCellViews: joint.dia.CellView[] = $state([]);

    let editorMode: EditorMode = $state(EditorMode.Panning);
    let copiedViews: joint.dia.CellView[] = [];
    let mouseButton: number = $state(0);
    let mousePointToPaper: joint.g.Point = new joint.g.Point(0, 0);
    let paperElement: HTMLElement;

    function initializeTools(cell: any) {
        const cellView = paper.findViewByModel(cell);

        if (cell.isLink()) {
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
    }

    $effect(() => {
        paper.setElement(paperElement);

        paper.setDimensions(
            paperElement.clientWidth,
            paperElement.clientHeight,
        );
        paper.render();

        const diagramJSON = localStorage.getItem("diagram");
        if (diagramJSON) {
            graph.fromJSON(JSON.parse(diagramJSON));
            for (const cell of graph.getCells()) {
                initializeTools(cell);
            }
        }

        graph.on("add", initializeTools);
    });

    function handleKeydown(event: KeyboardEvent) {
        if (event.ctrlKey || event.metaKey) {
            if (event.key.toLowerCase() === "s") {
                event.preventDefault();
                exportJSON();
            }

            if (event.key.toLowerCase() === "e") {
                event.preventDefault();
                exportSVG();
            }

            if (event.key.toLowerCase() === "i") {
                event.preventDefault();
                importJSON();
            }

            // Copy
            if (event.key.toLowerCase() === "c") {
                copiedViews = selectedCellViews;
            }

            // Paste
            if (event.key.toLowerCase() === "v" && copiedViews.length > 0) {
                let leftmostUppermostPosition: joint.g.Point =
                    copiedViews[0].model.position();

                for (const cellView of copiedViews) {
                    const position = cellView.model.position();
                    if (position.x <= leftmostUppermostPosition.x) {
                        leftmostUppermostPosition.x = position.x;
                    }

                    if (position.y <= leftmostUppermostPosition.y) {
                        leftmostUppermostPosition.y = position.y;
                    }
                }

                for (const cellView of copiedViews) {
                    const oldPosition = cellView.model.position();
                    const newModel = cellView.model.clone();
                    newModel.addTo(graph);
                    const newCellView = paper.findViewByModel(newModel);
                    newCellView.model.position(
                        oldPosition.x +
                            mousePointToPaper.x -
                            leftmostUppermostPosition.x,
                        oldPosition.y +
                            mousePointToPaper.y -
                            leftmostUppermostPosition.y,
                    );
                }
            }
        }

        if (event.key == "Escape") {
            selectedCellViews = [];
        }

        if (
            event.target instanceof HTMLElement &&
            event.target.tagName.toLowerCase() == "input"
        ) {
            return;
        }

        if (event.key == "Backspace" || event.key == "Delete") {
            for (const cellView of selectedCellViews) {
                cellView.model.remove();
            }
            selectedCellViews = [];

            return;
        }

        if (event.key === "1") {
            editorMode = EditorMode.Panning;
        }

        if (event.key === "2") {
            editorMode = EditorMode.Selection;
        }

        if (event.key === "3") {
            editorMode = EditorMode.Class;
        }

        if (event.key === "4") {
            editorMode = EditorMode.Generalization;
        }

        if (event.key === "5") {
            editorMode = EditorMode.Note;
        }
    }

    paper.options.interactive = function () {
        return {
            labelMove: true,
            linkMove: true,
        };
    };

    paper.options.defaultLink = function (
        _cellView: joint.dia.CellView,
        _magnet: SVGElement,
    ) {
        if (editorMode === EditorMode.Generalization) {
            return new JointJSGeneralization();
        }

        return new JointJSAssociation();
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

    paper.on(
        "cell:pointerdown",
        function (cellView: joint.dia.CellView, _event: joint.dia.Event) {
            selectedCellViews = [cellView];
            editorMode = EditorMode.Panning;
        },
    );

    paper.on(
        "blank:pointerdown",
        function (event: joint.dia.Event, x: number, y: number) {
            if (editorMode === EditorMode.Class) {
                event.preventDefault();
                const obj = new JointJSClass();
                obj.position(x, y);
                obj.addTo(graph);
                selectedCellViews = [paper.findViewByModel(obj)];
                return;
            }

            if (editorMode === EditorMode.Note) {
                event.preventDefault();
                const obj = new JointJSNote();
                obj.position(x, y);
                obj.addTo(graph);
                selectedCellViews = [paper.findViewByModel(obj)];
                return;
            }

            selectedCellViews = [];
        },
    );

    paper.on(
        "cell:pointermove",
        function (cellView: joint.dia.CellView, event: joint.dia.Event) {
            if (
                selectedCellViews.some(
                    (selectedCellView) => selectedCellView === cellView,
                )
            ) {
                // TODO: move all
                return;
            }

            selectedCellViews = [cellView];
        },
    );
</script>

<svelte:window
    onresize={() => paper.setDimensions(window.innerWidth, window.innerHeight)}
    onkeydown={handleKeydown}
    onpointermove={(event: MouseEvent) => {
        mousePointToPaper = paper.clientToLocalPoint(
            event.clientX,
            event.clientY,
        );
    }}
/>

<Selection bind:selectedCellViews bind:editorMode bind:mouseButton />
<Panning bind:editorMode bind:mouseButton />

<div class="relative flex flex-col w-full h-screen">
    <Toolbar bind:editorMode />

    <div class="relative w-full h-full">
        <div id="paper" class="w-full h-full" bind:this={paperElement}></div>
        <div
            class="absolute top-0 left-0 w-min h-full bg-white border-r border-gray-300"
        >
            <PropertyInspector cellViews={selectedCellViews} />
        </div>
    </div>
</div>

<!-- // graph.getElements().forEach((cell) => { -->
<!-- //     if (cell instanceof JointJSClass) { -->
<!-- //         cell.update(); -->
<!-- //     } -->
<!-- // }); -->
<!-- // paper.options.validateMagnet = function ( -->
<!-- //     _cellView: joint.dia.CellView, -->
<!-- //     _magnet: SVGElement, -->
<!-- // ) { -->
<!-- //     return ( -->
<!-- //         editorMode !== EditorMode.Class && editorMode !== EditorMode.Note -->
<!-- //     ); -->
<!-- // }; -->
