<script lang="ts">
    import * as joint from "@joint/core";
    import { darkenHSL, getBorderColor } from "$lib/utils";
    import ClassInspector from "./ClassInspector.svelte";
    import AssociationInspector from "./AssociationInspector.svelte";
    import { JointJSClass } from "../JointJS/JointJSClass";
    import { JointJSAssociation } from "../JointJS/JointJSAssociation";
    import { JointJSGeneralization } from "../JointJS/JointJSGeneralization";
    import GeneralizationInspector from "./GeneralizationInspector.svelte";

    const { cellViews }: { cellViews: joint.dia.CellView[] } = $props();

    const fillColors = [
        "hsl(0,0%,100%)",
        "hsl(280,27%,87%)",
        "hsl(215,85%,92%)",
        "hsl(117,30%,87%)",
        "hsl(31,100%,90%)",
        "hsl(45,100%,90%)",
        "hsl(3,76%,89%)",
    ];

    const fillStyles = ["default"];

    const strokeStyles = [
        { name: "Solid Thick", value: "0" },
        { name: "Dashed", value: "8 8" },
        { name: "Long Dashed", value: "15 5" },
        { name: "Dense Dashed", value: "20 2" },
        { name: "Dotted", value: "2 5" },
        { name: "Sparse Dotted", value: "2 10" },
    ];

    const strokeWidths = [1, 2, 3, 4, 5, 6, 7];
    let showFill = $derived(
        cellViews.length > 0 &&
            cellViews.every(
                (cellView) => cellView.model instanceof JointJSClass,
            ),
    );

    let showStroke = $derived(
        cellViews.length > 0 &&
            cellViews.every(
                (cellView) =>
                    cellView.model instanceof JointJSClass ||
                    cellView.model instanceof JointJSAssociation ||
                    cellView.model instanceof JointJSGeneralization,
            ),
    );
</script>

<div class="flex flex-col gap-2 p-4">
    {#if cellViews.length > 0}
        <p class="text-sm font-medium! mb-1">Properties</p>
    {/if}

    {#if showFill}
        <p class="text-sm font-medium! mb-1">Fill</p>
        <div class="flex">
            {#each fillColors as fillColor, i}
                <button
                    class="min-w-4 min-h-4 mx-1 first:ml-0 last:mr-0 cursor-pointer"
                    style={`background-color: ${fillColor}; border: solid 2px ${getBorderColor(fillColor)};`}
                    aria-label={`stroke-${i}`}
                    onclick={() => {
                        for (const cellView of cellViews) {
                            cellView.model.attr("body/fill", fillColor);
                        }
                    }}
                >
                </button>
            {/each}
        </div>
        <p class="text-sm font-medium! mb-1">Fill style</p>
        <div class="flex">
            {#each fillStyles as fillStyle, i}
                <button
                    class={`min-w-4 min-h-4 mx-1 first:ml-0 last:mr-0 bg-white cursor-pointer`}
                    aria-label={`fillStyle-${i}`}
                    onclick={() => {}}
                >
                </button>
            {/each}
        </div>
    {/if}

    {#if showStroke}
        <p class="text-sm font-medium! mb-1">Stroke</p>
        <div class="flex">
            {#each fillColors as fillColor, i}
                <button
                    class={`min-w-4 min-h-4 mx-1 first:ml-0 last:mr-0 cursor-pointer`}
                    style={`background-color: ${fillColor}; border: solid 2px ${getBorderColor(fillColor)};`}
                    aria-label={`stroke-${i}`}
                    onclick={() => {
                        for (const cellView of cellViews) {
                            const color = getBorderColor(fillColor);

                            if (cellView.model instanceof JointJSClass) {
                                cellView.model.attr("body/stroke", color);
                            } else {
                                cellView.model.attr("line/stroke", color);
                            }
                        }
                    }}
                >
                </button>
            {/each}
        </div>

        <p class="text-sm font-medium! mb-1">Stroke style</p>
        <div class="flex">
            {#each strokeStyles as strokeStyle, i}
                <button
                    class="max-w-4 max-h-4 mx-1 first:ml-0 last:mr-0 bg-white cursor-pointer"
                    aria-label={`strokeStyle-${i}`}
                    onclick={() => {
                        //     if (componentIsElement) component.attr("body/strokeDasharray", style);
                        //     else component.attr("line/strokeDasharray", style);
                    }}
                >
                    <svg
                        width="100%"
                        height="100%"
                        viewBox="0 0 24 24"
                        preserveAspectRatio="none"
                    >
                        <rect
                            x="1"
                            y="1"
                            width="22"
                            height="22"
                            fill="none"
                            stroke="black"
                            stroke-width="2"
                            stroke-dasharray={strokeStyle.value}
                            stroke-linecap={strokeStyle.name
                                .toLowerCase()
                                .includes("dotted")
                                ? "round"
                                : "butt"}
                        />
                    </svg>
                </button>
            {/each}
        </div>

        <p class="text-sm font-medium! mb-1">Stroke width</p>
        <div class="flex">
            {#each strokeWidths as strokeWidth, i}
                <button
                    class={`min-w-4 min-h-4 mx-1 first:ml-0 last:mr-0 bg-white cursor-pointer`}
                    style={`outline: ${strokeWidth / 1.5}px solid black; outline-offset: -${strokeWidth / 2}px;`}
                    aria-label={`strokeWidth-${i}`}
                    onclick={() => {
                        for (const cellView of cellViews) {
                            if (cellView.model instanceof JointJSClass) {
                                cellView.model.attr(
                                    "body/strokeWidth",
                                    strokeWidth,
                                );
                            } else {
                                cellView.model.attr(
                                    "line/strokeWidth",
                                    strokeWidth,
                                );
                            }
                        }
                    }}
                >
                </button>
            {/each}
        </div>
    {/if}

    {#if cellViews.length === 1}
        <hr class="m-4" />
        {#if cellViews[0].model instanceof JointJSClass}
            <ClassInspector component={cellViews[0].model} />
        {:else if cellViews[0].model instanceof JointJSAssociation}
            <AssociationInspector component={cellViews[0].model} />
        {:else if cellViews[0].model instanceof JointJSGeneralization}
            <GeneralizationInspector component={cellViews[0].model} />
        {/if}
    {/if}
</div>
