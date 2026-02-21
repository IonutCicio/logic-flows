<script lang="ts">
    import * as joint from "@joint/core";
    import { EditorMode } from "$lib/utils";
    import Zoom from "./Zoom.svelte";
    import Menu from "./Menu.svelte";

    let {
        paper,
        graph,
        editorMode = $bindable(EditorMode.Selection),
    }: {
        paper: joint.dia.Paper;
        graph: joint.dia.Graph;
        editorMode: EditorMode;
    } = $props();

    const tools = [
        {
            icon: "back_hand",
            tooltip: "Panning",
            mode: EditorMode.Panning,
        },
        {
            icon: "arrow_selector_tool",
            tooltip: "Selection",
            mode: EditorMode.Selection,
        },
        {
            icon: "serif",
            tooltip: "Class",
            mode: EditorMode.Class,
        },
        {
            icon: "diagonal_line",
            tooltip: "Association",
            mode: EditorMode.Association,
        },
        {
            icon: "arrow_and_edge",
            tooltip: "Generalization",
            mode: EditorMode.Generalization,
        },
        {
            icon: "sticky_note_2",
            tooltip: "Note",
            mode: EditorMode.Note,
        },
    ];

    // paper.on('link:dragstart', () => {
    //     paper.el.classList.add('show-ports');
    // });
    //
    // paper.on('link:dragend', () => {
    //     paper.el.classList.remove('show-ports');
    // });

    // .joint-port circle {
    //     opacity: 0;
    //     transition: opacity 0.1s;
    // }
    //
    // .show-ports .joint-port circle {
    //     opacity: 1;
    // }
</script>

<Menu {paper} {graph} />

<div
    class="absolute top-0 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white p-2 border-l border-r border-b border-gray-300 rounded-b-md"
>
    {#each tools as tool}
        <button
            class:bg-gray-300={editorMode == tool.mode}
            class="rounded-md w-8 h-8 material-symbols-outlined"
            title={tool.tooltip}
            onclick={() => {
                editorMode = tool.mode;
            }}
        >
            {tool.icon}
        </button>
    {/each}
    <hr class="h-5 w-0 border-l border-gray-300" />
    <Zoom {paper} />
    <hr class="h-5 w-0 border-l border-gray-300" />
    <button class="material-symbols-outlined" title="Undo"> undo </button>
    <button disabled class="material-symbols-outlined" title="Redo">
        redo
    </button>
    <hr class="h-5 w-0 border-l border-gray-300" />
    <span class="material-symbols-outlined w-8 text-center" title="Help">
        help
    </span>
    <!-- TODO: just linke to github README; maybe just do GitHub icon -->
</div>

<!---->
<!-- /* .card { */ -->
<!-- /*     @apply rounded-md shadow-sm/50 shadow-gray-400; */ -->
<!-- /* } */ -->
<!-- // let selectedTool = $state.raw(tools[0]); -->
<!-- if (tool.tooltip != "export") { -->
<!--     selectedTool = tool; -->
<!-- } -->
<!-- if (tool.function != null) { -->
<!--     tool.function(); -->
<!-- } -->

<!-- class="absolute top-10 left-1/2 -translate-x-1/2 flex gap-2 bg-white px-1 py-1 card" -->
<!-- <span class="text-xs" class:font-bold!={selectedTool == tool}> -->
<!--     {tool.name} -->
<!-- </span> -->

<!-- class:bg-stone-300={selectedTool == tool} -->
<!-- // const EditMode = { -->
<!-- //     None: "None", -->
<!-- //     AddClass: "AddClass", -->
<!-- //     AddAssociation: "AddAssociation", -->
<!-- //     AddGeneralization: "AddGeneralization", -->
<!-- //     AddNote: "AddNote", -->
<!-- // }; -->
<!---->
<!-- // let editMode = EditMode.None; -->
<!-- // -->
<!-- // let mode = ModeX.A; -->
<!---->

<!-- // TODO: enum for toolbar -->
<!-- // { -->
<!-- //     icon: "save", -->
<!-- //     tooltip: "Export SVG", -->
<!-- //     function: () => exportSvgImage(paper), -->
<!-- // }, -->
<!-- // { -->
<!-- //     icon: "save", -->
<!-- //     tooltip: "Export SVG", -->
<!-- //     function: () => exportSvgImage(paper), -->
<!-- // }, -->
<!---->
