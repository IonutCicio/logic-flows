<script lang="ts">
    import { EditorMode, paper } from "$lib/utils";
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
        Scan,
        Folder,
        Download,
        Image,
    } from "@lucide/svelte";

    let {
        editorMode = $bindable(EditorMode.Selection),
    }: {
        editorMode: EditorMode;
    } = $props();

    let zoom: number = $state(100);

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
            icon: Folder,
            label: "Import project JSON",
            shortcut: "Ctrl + I",
            func: importJSON,
        },
        {
            icon: Download,
            label: "Save project JSON",
            shortcut: "Ctrl + S",
            func: exportJSON,
        },
        {
            icon: Image,
            label: "Export SVG",
            shortcut: "Ctrl + E",
            func: exportSVG,
        },
        // TODO: config options (font size)
        // TODO: GitHub repository link
    ];
</script>

<svelte:window
    onclick={(event: Event) => {
        if (isMenuOpen) {
            isMenuOpen = false;
            event.stopPropagation();
        }
    }}
/>

<div
    class="w-full flex items-center gap-2 bg-white p-2 border-b border-gray-300"
>
    <button
        title="Menu"
        class="icon"
        class:selected={isMenuOpen}
        onclick={(event: Event) => {
            event.stopPropagation();
            isMenuOpen = !isMenuOpen;
        }}
    >
        <Menu size={16} />
    </button>
    <hr class="h-5 w-0 border-l" />
    {#each tools as tool}
        <button
            title={tool.tooltip}
            class:selected={editorMode == tool.mode}
            class="icon"
            onclick={() => (editorMode = tool.mode)}
        >
            <tool.icon size={16} />
        </button>
    {/each}
    <hr class="h-5 w-0 border-l" />
    <Zoom bind:zoom />
    <button
        title="Reset view"
        class="icon"
        onclick={() => {
            paper.translate(0, 0);
            zoom = 100;
        }}
    >
        <Scan size={16} />
    </button>
    <hr class="h-5 w-0 border-l" />
    <button disabled title="Undo" class="icon">
        <Undo size={16} />
    </button>
    <button disabled title="Redo" class="icon">
        <Redo size={16} />
    </button>
</div>

{#if isMenuOpen}
    <div
        class="absolute left-4 top-19 bg-white rounded-md border border-gray-300 z-10 p-2"
    >
        {#each items as item}
            <div>
                <button
                    onclick={item.func}
                    class="w-full flex! items-center gap-3 px-3 py-2"
                >
                    <item.icon size={16} />
                    {item.label}
                    {#if item.shortcut}
                        <code class="self-end ml-auto pl-4">
                            {item.shortcut}
                        </code>
                    {/if}
                </button>
            </div>
        {/each}
    </div>
{/if}
