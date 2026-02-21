<script lang="ts">
    import { exportSvgImage } from "$lib/utils";
    import * as joint from "@joint/core";

    const { paper, graph }: { paper: joint.dia.Paper; graph: joint.dia.Graph } =
        $props();

    let isMenuOpen = $state(false);

    const stuff = [
        {
            label: "Import project JSON",
            func: () => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = ".json";

                input.addEventListener("change", async (event: Event) => {
                    const file = event.target.files[0];
                    if (!file) {
                        return;
                    }

                    try {
                        const text = await file.text();
                        const json = JSON.parse(text);

                        graph.fromJSON(json);
                    } catch (err) {
                        alert("Invalid JSON file.");
                        console.error(err);
                    }
                });

                input.click(); // Must happen inside user event
            },
        },
        {
            label: "Save project JSON",
            func: () => {
                const url = URL.createObjectURL(
                    new Blob([JSON.stringify(graph.toJSON())], {
                        type: "application/json",
                    }),
                );

                const a = document.createElement("a");
                a.href = url;
                // TODO: handle filename
                a.download = "diagram.json";
                a.click();
            },
        },
        // {
        //     label: "Save to...",
        //     func: () => {},
        // },
        {
            label: "Export SVG",
            func: () => {
                exportSvgImage(paper);
                // TODO: export svg without grid
            },
        },
        // {
        //     label: "Help",
        //     func: () => {},
        // },
        // {
        //     label: "Theme",
        //     func: () => {},
        // },
    ];
</script>

<div
    class="absolute left-0 top-0 grid place-items-center rounded-br-md bg-white p-2 border-r border-b border-gray-300"
>
    <button
        class="grid items-center w-8 h-8"
        onclick={() => (isMenuOpen = !isMenuOpen)}
    >
        <span class="material-symbols-outlined text-center"> menu </span>
    </button>
</div>

{#if isMenuOpen}
    <div class="absolute left-0 top-20 bg-white rounded-md border">
        {#each stuff as obj}
            <div>
                <button onclick={obj.func}>
                    {obj.label}
                </button>
            </div>
            <!-- <button onclick={obj.function}>{obj.label}</button> -->
        {/each}
    </div>
{/if}
