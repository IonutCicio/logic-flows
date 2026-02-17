<script lang="ts">
    // TODO: reset view button or something
    // TODO: create a global "config" with GRID_SIZE and stuff like that
    const GRID_SIZE = 16;

    import * as joint from "@joint/core";
    import { darkenHSL } from "$lib/utils/color";
    import { ResizeTool } from "./JointJS/Resize";
    import { JointJSClass } from "./JointJS/JointJSClass";
    import { JointJSAssociation } from "./JointJS/JointJSAssociation";
    import PropertyInspector from "$lib/components/view/PropertyInspector.svelte";

    let paperRef: HTMLElement;
    let paper: joint.dia.Paper | null = null;
    let graph: joint.dia.Graph | null = null;
    let selectedComponent = $state.raw<
        joint.dia.ElementView | joint.dia.LinkView | null
    >(null);
    let isTypesMenuOpen: boolean = false;

    const EditMode = {
        None: "None",
        AddClass: "AddClass",
        AddAssociation: "AddAssociation",
        AddGeneralization: "AddGeneralization",
        AddNote: "AddNote",
    };

    let editMode = EditMode.None;

    function exportSvgImage() {
        if (!paper) {
            return;
        }

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

    const tools = [
        {
            icon: "select_all",
            function: () => (editMode = EditMode.None),
        },
        {
            icon: "serif",
            function: () => (editMode = EditMode.AddClass),
        },
        {
            icon: "shape_line",
            function: () => (editMode = EditMode.AddAssociation),
        },
        {
            icon: "arrow_and_edge",
            function: () => (editMode = EditMode.AddGeneralization),
        },
        {
            icon: "sticky_note_2",
            function: () => (editMode = EditMode.AddNote),
        },
        { icon: "save", function: exportSvgImage },
    ];

    let selectedTool = $state.raw(tools[0]);
    let zoomLevel: number = $state(100);
    let zoomX: number = 0;
    let zoomY: number = 0;

    $effect(() => {
        graph = new joint.dia.Graph();
        paper = new joint.dia.Paper({
            el: paperRef,
            model: graph,
            width: paperRef.clientWidth,
            height: window.innerHeight,
            background: { color: "white" },
            cellViewNamespace: joint.shapes,
            gridSize: GRID_SIZE,
            drawGrid: true,
        });

        paper.on(
            "blank:mousewheel",
            (event: joint.dia.Event, x: number, y: number, delta: number) => {
                event.preventDefault();
                zoomLevel = Math.max(zoomLevel + delta * 10, 20);
                zoomX = x;
                zoomY = y;
            },
        );

        paper.on("blank:pointerclick", (_event, x, y) => {
            if (!graph) {
                return;
            }

            if (selectedComponent) {
                selectedComponent.removeTools();
                joint.highlighters.stroke.remove(
                    selectedComponent,
                    "highlight-selected",
                );
                selectedComponent = null;
                return;
            }

            if (editMode == EditMode.AddClass) {
                const obj = new JointJSClass();
                obj.position(x, y);
                obj.resize(GRID_SIZE * 6, GRID_SIZE * 2);
                obj.attr({
                    body: {
                        fill: "#FFFFFF",
                        stroke: "#000000",
                        strokeWidth: 1,
                    },
                });
                obj.addTo(graph);
            }
        });

        paper.on("cell:pointerclick", (cellView: joint.dia.CellView) => {
            // prevents highliting multiple components
            if (selectedComponent) {
                joint.highlighters.stroke.remove(
                    selectedComponent,
                    "highlight-selected",
                );
            }

            // for some reasons, cellView.mode.isElement() does not type restrict, so typescript needs this
            const cellViewIsElementView =
                cellView instanceof joint.dia.ElementView;

            if (
                cellViewIsElementView ||
                cellView instanceof joint.dia.LinkView
            ) {
                selectedComponent = cellView;
                if (cellViewIsElementView) {
                    cellView.addTools(
                        new joint.dia.ToolsView({
                            tools: [
                                new ResizeTool({
                                    selector: "body",
                                }),
                            ],
                        }),
                    );
                }
            } else {
                return;
            }

            joint.highlighters.stroke.add(
                cellView,
                cellViewIsElementView
                    ? { selector: "body" }
                    : { selector: "line" },
                "highlight-selected",
                {
                    padding: cellViewIsElementView ? 6 : 0,
                    layer: cellViewIsElementView ? null : "back", // "back" prevents the highlighter to cover the link
                    attrs: {
                        stroke: cellViewIsElementView
                            ? darkenHSL(cellView.model.attr("body/stroke"))
                            : darkenHSL(cellView.model.attr("line/stroke")),
                        "stroke-width": cellViewIsElementView ? 3 : 12,
                    },
                },
            );
        });

        let isPanning = $state.raw(false);

        paper.on({
            "blank:pointerdown": (evt, x, y) => {
                evt.preventDefault();
                evt.stopPropagation();
                isPanning = true;
                evt.data = { x, y };
            },
            "blank:pointermove cell:pointermove": (evt) => {
                if (!isPanning) return;
                // this is a joint.dia.Event as long as isPanning = true
                evt.preventDefault();
                evt.stopPropagation();
                if (!paper) return;
                const currentPoint = paper.clientToLocalPoint(
                    evt.clientX ?? 0,
                    evt.clientY ?? 0,
                );
                const dx = (currentPoint.x ?? 0) - evt.data.x;
                const dy = (currentPoint.y ?? 0) - evt.data.y;

                const translate = paper.translate();
                paper.translate(translate.tx + dx, translate.ty + dy);
            },
            "blank:pointerup cell:pointerup": (evt) => {
                // this is a joint.dia.Event as long as isPanning = true
                if (!isPanning) return;
                evt.preventDefault();
                isPanning = false;
            },
        });

        // create elements
        const class1 = new JointJSClass();
        class1.position(GRID_SIZE * 4, GRID_SIZE * 8);
        class1.set("name", "Hello");
        class1.set("attributesList", [
            "attr1: Data",
            "attr2: DataOra",
            "attr3: DataOra",
        ]);
        class1.set("operationsList", ["-op1(args): void"]);
        class1.addTo(graph);

        const class2 = new JointJSClass();
        class2.position(GRID_SIZE * 4, GRID_SIZE * 24);
        class2.set("name", "World");
        class2.set("attributesList", [
            "attr1: Periodo",
            "attr2: FasciaOraria",
            "attr3: GiornoSettimana",
        ]);
        class2.addTo(graph);

        // class1.attr("body", { stroke: "hsl(2, 55%, 53%)", rx: 0, ry: 0 });
        // class2.attr("body", { stroke: "hsl(2, 55%, 53%)", rx: 0, ry: 0 });

        // class1.attr("label", { fill: "hsl(0, 0%, 21%)" });
        // class2.attr("label", { fill: "hsl(0, 0%, 21%)" });

        const assoc = new JointJSAssociation();
        assoc.source(class1);
        assoc.target(class2);

        assoc.set({
            sourceMultiplicity: "1..1",
            name: "to the",
            targetMultiplicity: "0..*",
        });

        assoc.router("manhattan");
        assoc.addTo(graph);

        return () => {
            if (paper) {
                paper.remove();
                paper = null;
            }
        };
    });

    $effect(() => {
        if (!paper) {
            return;
        }

        const x = zoomX;
        const y = zoomY;

        const localPoint = paper.clientToLocalPoint({ x, y });

        paper.scale(zoomLevel * 0.01);

        const newLocalPoint = paper.clientToLocalPoint({ x, y });
        const dx = Math.min(
            100,
            Math.max(-100, newLocalPoint.x - localPoint.x),
        );
        const dy = Math.min(
            100,
            Math.max(-100, newLocalPoint.y - localPoint.y),
        );

        const translate = paper.translate();
        paper.translate(translate.tx + dx, translate.ty + dy);
    });
</script>

<div>
    <div class="relative">
        <div bind:this={paperRef}></div>

        {#if selectedComponent}
            <div class="absolute top-5 left-5 bg-white border w-50 h-4/5">
                <PropertyInspector component={selectedComponent.model} />
            </div>
        {/if}

        <div class="absolute bottom-10 left-10 flex gap-5 items-center">
            <div class="flex items-center gap-3 bg-white px-3 py-2 card">
                <button
                    class="material-symbols-outlined"
                    onclick={(e) => {
                        e.preventDefault();
                        zoomLevel -= 10;
                    }}
                >
                    zoom_out
                </button>
                <input type="number" bind:value={zoomLevel} class="w-20" />
                <button
                    class="material-symbols-outlined"
                    onclick={(e) => {
                        e.preventDefault();
                        zoomLevel += 10;
                    }}
                >
                    zoom_in
                </button>
            </div>
            <div class="flex items-center gap-3 bg-white px-3 py-2 card">
                <button class="material-symbols-outlined"> undo </button>
                <button disabled class="material-symbols-outlined">
                    redo
                </button>
            </div>
        </div>

        <div
            class="absolute right-10 bottom-10 bg-white w-10 h-10 grid place-items-center card"
        >
            <span class="material-symbols-outlined"> help </span>
        </div>

        <div
            class="absolute top-10 left-1/2 -translate-x-1/2 flex gap-5 bg-white px-4 py-3 card"
        >
            {#each tools as tool}
                <button
                    class="material-symbols-outlined"
                    class:bg-stone-300={selectedTool == tool}
                    onclick={() => {
                        selectedTool = tool;
                        if (tool.function != null) {
                            tool.function();
                        }
                    }}
                >
                    {tool.icon}
                </button>
            {/each}
        </div>
    </div>

    {#if isTypesMenuOpen}
        <div class="absolute right-0 top-0 w-72 bg-white h-full">types</div>
    {/if}
</div>
