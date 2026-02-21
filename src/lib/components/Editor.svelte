<script lang="ts">
    // TODO: reset view button or something
    import * as joint from "@joint/core";
    import { darkenHSL, EditorMode, GRID_SIZE } from "$lib/utils";
    import { exampleDiagram as example } from "$lib/example";
    import { ResizeTool } from "./JointJS/Resize";
    import { JointJSClass } from "./JointJS/JointJSClass";
    import PropertyInspector from "$lib/components/view/PropertyInspector.svelte";
    import Toolbar from "./Toolbar.svelte";
    import { JointJSAssociation } from "./JointJS/JointJSAssociation";
    import GeneralizationInstantiator from "./view/GeneralizationInstantiator.svelte";

    let editorMode: EditorMode = $state(EditorMode.Selection);
    let selectedComponent = $state.raw<
        joint.dia.ElementView | joint.dia.LinkView | null
    >(null);
    let isTypesMenuOpen: boolean = false;
    let isPanning = $state.raw(false);

    const cellNamespace = {
        ...joint.shapes,
        custom: {
            JointJSClass,
            JointJSAssociation,
        },
    };

    let paperEl: HTMLElement;
    let graph: joint.dia.Graph = new joint.dia.Graph(
        {},
        {
            cellNamespace: cellNamespace,
        },
    );
    let paper: joint.dia.Paper = new joint.dia.Paper({
        model: graph,
        background: { color: "white" },
        cellViewNamespace: cellNamespace,
        gridSize: GRID_SIZE,
        drawGrid: {
            name: "fixedDot",
        },
        defaultRouter: {
            name: "manhattan",
            args: {},
        },
        linkPinning: false,
        defaultLink: function (_cellView: any, _magnet: any) {
            if (editorMode == EditorMode.Association) {
                return new JointJSAssociation();
            }

            return new joint.shapes.standard.Link();
            // return nothing; (no association possibile if in other modes
        },
        validateConnection: function (
            cellViewS,
            _magnetS,
            cellViewT,
            magnetT,
            _end,
            linkView,
        ) {
            // TODO: validate link type too! take linkView.model and check its an association or a assoc. class

            return (
                cellViewS.model instanceof JointJSClass &&
                cellViewT.model instanceof JointJSClass &&
                magnetT?.getAttribute("port") != null &&
                linkView.model instanceof JointJSAssociation
            );
        },
        validateMagnet: function (_cellView, magnet) {
            if (
                editorMode != EditorMode.Association &&
                editorMode != EditorMode.Generalization
            ) {
                return false;
            }
            return magnet.getAttribute("port") != null;
        },
    });

    function addGeneralizationToGraph(gen: joint.dia.Link) {
        gen.router("manhattan");
        gen.addTo(graph);
        editorMode = EditorMode.Selection;
    }

    $effect(() => {
        paper.setElement(paperEl);
        paper.setDimensions(paperEl.clientWidth, window.innerHeight);
        paper.render();

        paper.on("blank:pointerclick", (_event, x, y) => {
            if (selectedComponent) {
                selectedComponent.removeTools();
                joint.highlighters.stroke.remove(
                    selectedComponent,
                    "highlight-selected",
                );
                selectedComponent = null;
                return;
            }

            if (editorMode == EditorMode.Class) {
                const obj = new JointJSClass();
                obj.position(x, y);
                obj.addTo(graph);
            }
        });
        // });

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

        paper.on({
            "blank:pointerdown": (evt, x, y) => {
                evt.preventDefault();
                evt.stopPropagation();
                // TODO: maybe with enum?
                isPanning = true;
                evt.data = { x, y };
            },
            "blank:pointermove cell:pointermove": (evt) => {
                if (!isPanning) {
                    return;
                }
                // this is a joint.dia.Event as long as isPanning = true
                evt.preventDefault();
                evt.stopPropagation();

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
                if (!isPanning) {
                    return;
                }

                evt.preventDefault();
                isPanning = false;
            },
        });

        example(graph);
    });
</script>

<svelte:window
    on:resize={() => {
        paper.setDimensions(window.innerWidth, window.innerHeight);
        paper.render();
    }}
/>

<div>
    <div class="relative">
        <div id="paper" bind:this={paperEl}></div>

        {#if selectedComponent}
            <div class="absolute top-5 left-5 bg-white border w-50 h-4/5">
                <PropertyInspector
                    component={selectedComponent.model}
                    {graph}
                />
            </div>
        {/if}
    </div>

    <Toolbar {paper} {graph} bind:editorMode />

    {#if isTypesMenuOpen}
        <div class="absolute right-0 top-0 w-72 bg-white h-full">types</div>
    {/if}
    {#if editorMode === EditorMode.Generalization}
        <div class="absolute right-0 top-0 w-72 bg-white h-full">
            <GeneralizationInstantiator
                classes={graph
                    ?.getCells()
                    .filter((c) => c instanceof JointJSClass) ?? []}
                onCreate={addGeneralizationToGraph}
            />
        </div>
    {/if}
</div>

<!-- // <<<<<<< HEAD -->
<!-- // // TODO: reset view button or something -->
<!-- // -->
<!-- // import * as joint from "@joint/core"; -->
<!-- // import { darkenHSL, GRID_SIZE } from "$lib/utils"; -->
<!-- // import { ResizeTool } from "./JointJS/Resize"; -->
<!-- // import { JointJSClass } from "./JointJS/JointJSClass"; -->
<!-- // import { JointJSAssociation } from "./JointJS/JointJSAssociation"; -->
<!-- // import PropertyInspector from "$lib/components/view/PropertyInspector.svelte"; -->
<!-- // import GeneralizationInstantiator from "./view/GeneralizationInstantiator.svelte"; -->
<!-- // -->
<!-- // let paperRef: HTMLElement; -->
<!-- // let paper: joint.dia.Paper | null = null; -->
<!-- // let graph: joint.dia.Graph | null = null; -->
<!-- // let selectedComponent = $state.raw< -->
<!-- // 	joint.dia.ElementView | joint.dia.LinkView | null -->
<!-- // >(null); -->
<!-- // let isTypesMenuOpen: boolean = false; -->
<!-- // -->
<!-- // const EditMode = { -->
<!-- // 	None: "None", -->
<!-- // 	AddClass: "AddClass", -->
<!-- // 	AddAssociation: "AddAssociation", -->
<!-- // 	AddGeneralization: "AddGeneralization", -->
<!-- // 	AddNote: "AddNote", -->
<!-- // }; -->
<!-- // -->
<!-- // let editMode = $state(EditMode.None); -->
<!-- // -->
<!-- // function addGeneralizationToGraph(gen: joint.dia.Link) { -->
<!-- // 	if (graph) { -->
<!-- // 		gen.router("manhattan"); -->
<!-- // 		gen.addTo(graph); -->
<!-- // 		editMode = EditMode.None; -->
<!-- // 		selectedTool = tools[0]; -->
<!-- // 	} -->
<!-- // } -->
<!-- // -->
<!-- // function exportSvgImage() { -->
<!-- // 	if (!paper) { -->
<!-- // 		return; -->
<!-- // 	} -->
<!-- // -->
<!-- // 	const url = URL.createObjectURL( -->
<!-- // 		new Blob([new XMLSerializer().serializeToString(paper.svg)], { -->
<!-- // 			type: "image/svg+xml;charset=utf-8", -->
<!-- // 		}), -->
<!-- // 	); -->
<!-- // -->
<!-- // 	const a = document.createElement("a"); -->
<!-- // 	a.href = url; -->
<!-- // 	a.download = "diagram.svg"; -->
<!-- // 	a.click(); -->
<!-- // -->
<!-- // 	URL.revokeObjectURL(url); -->
<!-- // } -->
<!-- // -->
<!-- // const tools = [ -->
<!-- // 	{ -->
<!-- // 		icon: "select_all", -->
<!-- // 		function: () => (editMode = EditMode.None), -->
<!-- // 	}, -->
<!-- // 	{ -->
<!-- // 		icon: "serif", -->
<!-- // 		function: () => (editMode = EditMode.AddClass), -->
<!-- // 	}, -->
<!-- // 	{ -->
<!-- // 		icon: "shape_line", -->
<!-- // 		function: () => (editMode = EditMode.AddAssociation), -->
<!-- // 	}, -->
<!-- // 	{ -->
<!-- // 		icon: "arrow_and_edge", -->
<!-- // 		function: () => (editMode = EditMode.AddGeneralization), -->
<!-- // 	}, -->
<!-- // 	{ -->
<!-- // 		icon: "sticky_note_2", -->
<!-- // 		function: () => (editMode = EditMode.AddNote), -->
<!-- // 	}, -->
<!-- // 	{ icon: "save", function: exportSvgImage }, -->
<!-- // ]; -->
<!-- // -->
<!-- // let selectedTool = $state.raw(tools[0]); -->
<!-- // let zoomLevel: number = $state(100); -->
<!-- // let zoomX: number = 0; -->
<!-- // let zoomY: number = 0; -->
<!-- // -->
<!-- // $effect(() => { -->
<!-- // 	graph = new joint.dia.Graph(); -->
<!-- // 	paper = new joint.dia.Paper({ -->
<!-- // 		el: paperRef, -->
<!-- // 		model: graph, -->
<!-- // 		width: paperRef.clientWidth, -->
<!-- // 		height: window.innerHeight, -->
<!-- // 		background: { color: "white" }, -->
<!-- // 		cellViewNamespace: joint.shapes, -->
<!-- // 		gridSize: GRID_SIZE, -->
<!-- // 		drawGrid: true, -->
<!-- // 	}); -->
<!-- // -->
<!-- // 	paper.on( -->
<!-- // 		"blank:mousewheel", -->
<!-- // 		(event: joint.dia.Event, x: number, y: number, delta: number) => { -->
<!-- // 			event.preventDefault(); -->
<!-- // 			zoomLevel = Math.max(zoomLevel + delta * 10, 20); -->
<!-- // 			zoomX = x; -->
<!-- // 			zoomY = y; -->
<!-- // 		}, -->
<!-- // 	); -->
<!-- // -->
<!-- // 	paper.on("blank:pointerclick", (_event, x, y) => { -->
<!-- // 		if (!graph) { -->
<!-- // 			return; -->
<!-- // 		} -->
<!-- // -->
<!-- // 		if (selectedComponent) { -->
<!-- // 			selectedComponent.removeTools(); -->
<!-- // 			joint.highlighters.stroke.remove(selectedComponent, "highlight-selected"); -->
<!-- // 			selectedComponent = null; -->
<!-- // 			return; -->
<!-- // 		} -->
<!-- // ======= -->
<!-- // >>>>>>> 740703b (feat: class ports, UI changes, JSON import & export, associations creation) -->
<!---->
<!-- // if (editMode === EditMode.AddClass) { -->
<!-- //     const obj = new JointJSClass(); -->
<!-- //     obj.position(x, y); -->
<!-- //     obj.addTo(graph); -->
<!-- // } -->

<!--     // <<<<<<< HEAD -->
<!--     // 	}); -->
<!--     // -->
<!--     // 	let isPanning = $state.raw(false); -->
<!--     // -->
<!--     // 	paper.on({ -->
<!--     // 		"blank:pointerdown": (evt, x, y) => { -->
<!--     // 			evt.preventDefault(); -->
<!--     // 			evt.stopPropagation(); -->
<!--     // 			isPanning = true; -->
<!--     // 			evt.data = { x, y }; -->
<!--     // 		}, -->
<!--     // 		"blank:pointermove cell:pointermove": (evt) => { -->
<!--     // 			if (!isPanning) return; -->
<!--     // 			// this is a joint.dia.Event as long as isPanning = true -->
<!--     // 			evt.preventDefault(); -->
<!--     // 			evt.stopPropagation(); -->
<!--     // 			if (!paper) return; -->
<!--     // 			const currentPoint = paper.clientToLocalPoint( -->
<!--     // 				evt.clientX ?? 0, -->
<!--     // 				evt.clientY ?? 0, -->
<!--     // 			); -->
<!--     // 			const dx = (currentPoint.x ?? 0) - evt.data.x; -->
<!--     // 			const dy = (currentPoint.y ?? 0) - evt.data.y; -->
<!--     // -->
<!--     // 			const translate = paper.translate(); -->
<!--     // 			paper.translate(translate.tx + dx, translate.ty + dy); -->
<!--     // 		}, -->
<!--     // 		"blank:pointerup cell:pointerup": (evt) => { -->
<!--     // 			// this is a joint.dia.Event as long as isPanning = true -->
<!--     // 			if (!isPanning) return; -->
<!--     // 			evt.preventDefault(); -->
<!--     // 			isPanning = false; -->
<!--     // 		}, -->
<!--     // 	}); -->
<!--     // -->
<!--     // 	// create elements -->
<!--     // 	const class1 = new JointJSClass(); -->
<!--     // 	class1.position(GRID_SIZE * 4, GRID_SIZE * 8); -->
<!--     // 	class1.set("name", "Hello"); -->
<!--     // 	class1.set("attributes", ["attr1: Data", "attr2: DataOra", "attr3: Magik"]); -->
<!--     // 	class1.set("operations", ["op1(arg: Type): void"]); -->
<!--     // 	class1.addTo(graph); -->
<!--     // -->
<!--     // 	const class2 = new JointJSClass(); -->
<!--     // 	class2.position(GRID_SIZE * 4, GRID_SIZE * 30); -->
<!--     // 	class2.set("name", "World"); -->
<!--     // 	class2.set("attributes", [ -->
<!--     // 		"attr1: Periodo", -->
<!--     // 		"attr2: FasciaOraria", -->
<!--     // 		"attr3: GiornoSettimana", -->
<!--     // 	]); -->
<!--     // 	class2.addTo(graph); -->
<!--     // -->
<!--     // 	// class1.attr("body", { stroke: "hsl(2, 55%, 53%)", rx: 0, ry: 0 }); -->
<!--     // 	// class2.attr("body", { stroke: "hsl(2, 55%, 53%)", rx: 0, ry: 0 }); -->
<!--     // -->
<!--     // 	// class1.attr("label", { fill: "hsl(0, 0%, 21%)" }); -->
<!--     // 	// class2.attr("label", { fill: "hsl(0, 0%, 21%)" }); -->
<!--     // -->
<!--     // 	const assoc1 = new JointJSAssociation(); -->
<!--     // 	assoc1.source(class1); -->
<!--     // 	assoc1.target(class2); -->
<!--     // 	assoc1.set({ -->
<!--     // 		sourceMultiplicity: "1..1", -->
<!--     // 		name: "to the", -->
<!--     // 		targetMultiplicity: "0..*", -->
<!--     // 	}); -->
<!--     // 	assoc1.router("manhattan"); -->
<!--     // 	assoc1.addTo(graph); -->
<!--     // -->
<!--     // 	// const assoc2 = new JointJSAssociation(); -->
<!--     // 	// assoc2.source(class1); -->
<!--     // 	// assoc2.target(class2); -->
<!--     // 	// assoc2.set({ -->
<!--     // 	//     sourceMultiplicity: "2..1", -->
<!--     // 	//     name: "male", -->
<!--     // 	//     targetMultiplicity: "0..*", -->
<!--     // 	// }); -->
<!--     // 	// assoc2.router("manhattan"); -->
<!--     // 	// assoc2.addTo(graph); -->
<!--     // -->
<!--     // 	return () => { -->
<!--     // 		if (paper) { -->
<!--     // 			paper.remove(); -->
<!--     // 			paper = null; -->
<!--     // 		} -->
<!--     // 	}; -->
<!--     // }); -->
<!--     // -->
<!--     // $effect(() => { -->
<!--     // 	if (!paper) { -->
<!--     // 		return; -->
<!--     // 	} -->
<!--     // -->
<!--     // 	const x = zoomX; -->
<!--     // 	const y = zoomY; -->
<!--     // -->
<!--     // 	const localPoint = paper.clientToLocalPoint({ x, y }); -->
<!--     // -->
<!--     // 	paper.scale(zoomLevel * 0.01); -->
<!--     // -->
<!--     // 	const newLocalPoint = paper.clientToLocalPoint({ x, y }); -->
<!--     // 	const dx = Math.min(100, Math.max(-100, newLocalPoint.x - localPoint.x)); -->
<!--     // 	const dy = Math.min(100, Math.max(-100, newLocalPoint.y - localPoint.y)); -->
<!--     // -->
<!--     // 	const translate = paper.translate(); -->
<!--     // 	paper.translate(translate.tx + dx, translate.ty + dy); -->
<!--     // }); -->
<!--     // ======= -->
<!-- // >>>>>>> 740703b (feat: class ports, UI changes, JSON import & export, associations creation) -->
