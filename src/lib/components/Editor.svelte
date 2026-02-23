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

    $effect(() => {
        window.addEventListener("keydown", handleKeydown);
    });

    let editorMode: EditorMode = $state(EditorMode.Panning);
    let selectedViews = $state.raw<joint.dia.CellView[]>([]);
    let isTypesMenuOpen: boolean = false;
    let selectionRectangle: joint.shapes.standard.Rectangle =
        new joint.shapes.standard.Rectangle();

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
            }

            if (e.key.toLowerCase() === "v") {
                // selectedCellView.clone()
                // TODO: get current mouse position, convert to paper position and place copy here
            }
        }

        if (
            e.target instanceof HTMLElement &&
            e.target.tagName.toLowerCase() == "input"
        ) {
            return;
        }

        if (e.key == "Backspace" || e.key == "Delete") {
            for (const cellView of selectedViews) {
                cellView.remove();
            }
            selectedViews = [];

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
        if (selectedViews) {
            for (const cellView of selectedViews) {
                cellView.hideTools();
                joint.highlighters.stroke.remove(
                    cellView,
                    "highlight-selected",
                );
            }
        }

        selectedViews = cellViews;

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

    $effect(() => {
        paper.setElement(paperEl);
        paper.setDimensions(paperEl.clientWidth, paperEl.clientHeight);

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
            if (!magnetT || !magnetS) {
                return false;
            }

            const portT = magnetT.getAttribute("port");
            const portS = magnetS.getAttribute("port");

            const isBad = graph.getLinks().some((link) => {
                if (link.id == linkView.model.id) {
                    return false;
                }

                return (
                    link.get("source").port == portT ||
                    link.get("target").port == portT ||
                    link.get("source").port == portS ||
                    link.get("target").port == portS
                );
            });

            if (isBad) {
                return false;
            }

            return (
                cellViewS.model instanceof JointJSClass &&
                cellViewT.model instanceof JointJSClass &&
                magnetT?.getAttribute("port") != null &&
                ((editorMode == EditorMode.Association &&
                    linkView.model instanceof JointJSAssociation) ||
                    (editorMode == EditorMode.Generalization &&
                        linkView.model instanceof JointJSGeneralization))
            );
        };

        paper.render();

        graph.on("add", function (cell) {
            const cellView = paper.findViewByModel(cell);

            if (cell.isLink()) {
                cellView.addTools(
                    new joint.dia.ToolsView({
                        tools: [
                            new joint.linkTools.Vertices({
                                redundancyRemoval: true,
                                vertexAdding: true,
                                snapRadius: 30,
                                scale: 2,
                            }),
                            new joint.linkTools.Remove(),
                            new joint.linkTools.Boundary(),
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

        paper.on("blank:pointerclick", (_event, x, y) => {
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

        paper.on("cell:pointerclick", (cellView: joint.dia.CellView) => {
            select([cellView]);
            editorMode = EditorMode.Panning;
        });

        paper.on({
            "blank:pointerdown": (evt, x, y) => {
                evt.data = { x, y };
                selectionRectangle.position(x, y);
                selectionRectangle.attr({
                    body: {
                        width: 0,
                        height: 0,
                        fill: "rgba(0, 162, 255, 0.1)",
                        stroke: "#00A2FF",
                    },
                });
                selectionRectangle.addTo(graph);
            },
            "blank:pointermove cell:pointermove": (evt) => {
                const currentPoint = paper.clientToLocalPoint(
                    evt.clientX ?? 0,
                    evt.clientY ?? 0,
                );

                if (editorMode == EditorMode.Panning) {
                    if (!evt.data) {
                        return;
                    }
                    const dx = (currentPoint.x ?? 0) - evt.data.x;
                    const dy = (currentPoint.y ?? 0) - evt.data.y;

                    const translate = paper.translate();
                    paper.translate(translate.tx + dx, translate.ty + dy);
                }

                if (editorMode == EditorMode.Selection) {
                    const width = Math.max(
                        currentPoint.x - selectionRectangle.position().x,
                        0,
                    );
                    const height = Math.max(
                        currentPoint.y - selectionRectangle.position().y,
                        0,
                    );
                    selectionRectangle.size(width, height);
                    selectionRectangle.attr({
                        body: {
                            width,
                            height,
                        },
                    });
                }
            },
            "blank:pointerup cell:pointerup": (_evt) => {
                if (
                    editorMode == EditorMode.Selection &&
                    selectionRectangle.graph != null
                ) {
                    select(
                        paper
                            .findCellViewsInArea(selectionRectangle.getBBox())
                            .filter(
                                (cellView) =>
                                    cellView.model != selectionRectangle,
                            ),
                    );
                    selectionRectangle.remove();
                }
            },
        });
    });
</script>

<svelte:window
    on:resize={() => paper.setDimensions(window.innerWidth, window.innerHeight)}
/>

<div class="relative flex flex-col w-full h-screen">
    <Toolbar bind:editorMode />

    <div class="relative w-full h-full">
        <div id="paper" class="w-full h-full" bind:this={paperEl}></div>

        {#if selectedViews.length > 0}
            <div
                class="absolute top-0 left-0 h-full bg-white border-r w-72 border-gray-300"
            >
                <PropertyInspector cellViews={selectedViews} />
            </div>
        {/if}
    </div>

    {#if isTypesMenuOpen}
        <div class="absolute right-0 top-0 w-72 bg-white h-full">types</div>
    {/if}
</div>
