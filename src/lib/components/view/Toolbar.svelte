<script lang="ts">
    import { EditorMode } from "$lib/utils";
    import Zoom from "./Zoom.svelte";
    import { exportJSON, exportSVG, importJSON } from "$lib/utils";
    import {
        Menu,
        Hand,
        SquareDashedMousePointer,
        Rows2,
        Spline,
        MoveDown,
        StickyNote,
        Undo,
        Redo,
    } from "@lucide/svelte";

    let {
        editorMode = $bindable(EditorMode.Selection),
    }: {
        editorMode: EditorMode;
    } = $props();

    const tools = [
        {
            icon: Hand,
            tooltip: "Panning",
            mode: EditorMode.Panning,
        },
        {
            icon: SquareDashedMousePointer,
            tooltip: "Selection",
            mode: EditorMode.Selection,
        },
        {
            icon: Rows2,
            tooltip: "Class",
            mode: EditorMode.Class,
        },
        {
            icon: Spline,
            tooltip: "Association",
            mode: EditorMode.Association,
        },
        {
            icon: MoveDown,
            tooltip: "Generalization",
            mode: EditorMode.Generalization,
        },
        {
            icon: StickyNote,
            tooltip: "Sticky note",
            mode: EditorMode.Note,
        },
    ];

    let isMenuOpen = $state(false);

    const items = [
        {
            label: "Import project JSON",
            func: importJSON,
        },
        {
            label: "Save project JSON",
            func: exportJSON,
        },
        {
            label: "Export SVG",
            func: exportSVG,
        },
        // TODO: config options (font size)
        // TODO: GitHub repository link
    ];
</script>

<div
    class="absolute top-0 left-0 w-full flex items-center gap-2 bg-white p-2 border-b border-gray-300"
>
    <button
        title="Menu"
        class="w-7 h-7 grid place-items-center rounded-md hover:bg-gray-200"
        class:bg-gray-300={isMenuOpen}
        onclick={() => (isMenuOpen = !isMenuOpen)}
    >
        <Menu size={16} />
    </button>
    <hr class="h-5 w-0 border-l border-gray-300" />
    {#each tools as tool}
        <button
            class:bg-gray-300={editorMode == tool.mode}
            class="w-7 h-7 grid place-items-center rounded-md hover:bg-gray-200"
            title={tool.tooltip}
            onclick={() => {
                editorMode = tool.mode;
            }}
        >
            <tool.icon size={16} />
        </button>
    {/each}
    <hr class="h-5 w-0 border-l border-gray-300" />
    <Zoom />
    <hr class="h-5 w-0 border-l border-gray-300" />
    <button
        title="Undo"
        class="w-7 h-7 grid place-items-center rounded-md hover:bg-gray-200"
    >
        <Undo size={16} />
    </button>
    <button
        disabled
        title="Redo"
        class="w-7 h-7 grid place-items-center rounded-md hover:bg-gray-200"
    >
        <Redo size={16} />
    </button>
</div>

{#if isMenuOpen}
    <div class="absolute left-0 top-20 bg-white rounded-md border">
        {#each items as item}
            <div>
                <button onclick={item.func}>
                    {item.label}
                </button>
            </div>
        {/each}
    </div>
{/if}
