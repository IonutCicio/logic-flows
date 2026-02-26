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
        { color: "hsl(0,0%,100%)" },
        { color: "hsl(280,27%,87%)" },
        { color: "hsl(215,85%,92%)" },
        { color: "hsl(117,30%,87%)" },
        { color: "hsl(31,100%,90%)" },
        { color: "hsl(45,100%,90%)" },
        { color: "hsl(3,76%,89%)" },
    ];

    // const strokes = strokeFills;

    const fillStyles = [{ value: "default" }];

    const strokeStyles = [
        { name: "Solid Thick", value: "0" },
        { name: "Dashed", value: "8 8" },
        { name: "Long Dashed", value: "15 5" },
        { name: "Dense Dashed", value: "20 2" },
        { name: "Dotted", value: "2 5" },
        { name: "Sparse Dotted", value: "2 10" },
    ];

    const strokeWidths = [
        { value: 1 },
        { value: 3 },
        { value: 5 },
        { value: 7 },
    ];

    // const changeFillColor = (
    //     e: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement },
    //     color: string,
    // ) => {
    //     e.preventDefault();
    //
    //     component.attr("body/fill", color);
    // };
    //
    // const changeStrokeColor = (
    //     e: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement },
    //     color: string,
    // ) => {
    //     e.preventDefault();
    //
    //     if (componentIsElement) component.attr("body/stroke", darkenHSL(color));
    //     else component.attr("line/stroke", color);
    // };
    //
    // const changeFillStyle = (
    //     e: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement },
    //     style: string,
    // ) => {
    //     e.preventDefault();
    //
    //     return;
    // };
    //
    // const changeStrokeStyle = (
    //     e: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement },
    //     style: string,
    // ) => {
    //     e.preventDefault();
    //
    //     if (componentIsElement) component.attr("body/strokeDasharray", style);
    //     else component.attr("line/strokeDasharray", style);
    // };
    //
    // const changeStrokeWidth = (
    //     e: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement },
    //     strokeWidth: number,
    // ) => {
    //     e.preventDefault();
    //
    //     if (componentIsElement) component.attr("body/strokeWidth", strokeWidth);
    //     else component.attr("line/strokeWidth", strokeWidth + 1);
    // };
</script>

<div class="flex flex-col gap-2 p-4">
    {#if cellViews.length > 0}
        <p class="text-sm font-medium! mb-1">Properties</p>
    {/if}

    {#if false}
        <div class="flex flex-col gap-1">
            <p class="text-sm font-medium! mb-1">Fill</p>
            <div class="flex">
                {#each fillColors as fillColor, i}
                    <button
                        class={`min-w-4 min-h-4 mx-1 first:ml-0 last:mr-0 cursor-pointer`}
                        style={`background-color: ${fillColor.color}; border: solid 2px ${getBorderColor(fillColor.color)};`}
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

            <p class="text-sm font-medium! mb-1">Stroke</p>
            <div class="flex">
                {#each fillColors as strokeFill, i}
                    <button
                        class={`min-w-4 min-h-4 mx-1 first:ml-0 last:mr-0 cursor-pointer`}
                        style={`background-color: ${strokeFill.color}; border: solid 2px ${getBorderColor(strokeFill.color)};`}
                        aria-label={`stroke-${i}`}
                        onclick={() => {}}
                    >
                    </button>
                {/each}
            </div>

            <!-- <p class="text-sm font-medium! mb-1">Fill style</p> -->
            <!-- <div class="flex"> -->
            <!--     {#each fillStyles as fillStyle, i} -->
            <!--         <button -->
            <!--             class={`min-w-4 min-h-4 mx-1 first:ml-0 last:mr-0 bg-white cursor-pointer`} -->
            <!--             aria-label={`fillStyle-${i}`} -->
            <!--             onclick={() => {}} -->
            <!--         > -->
            <!--         </button> -->
            <!--     {/each} -->
            <!-- </div> -->

            <!-- <p class="text-sm font-medium! mb-1">Stroke style</p> -->
            <!-- <div class="flex"> -->
            <!--     {#each strokeStyles as strokeStyle, i} -->
            <!--         <button -->
            <!--             class="max-w-4 max-h-4 mx-1 first:ml-0 last:mr-0 bg-white cursor-pointer" -->
            <!--             aria-label={`strokeStyle-${i}`} -->
            <!--             onclick={() => {}} -->
            <!--         > -->
            <!--             <svg -->
            <!--                 width="100%" -->
            <!--                 height="100%" -->
            <!--                 viewBox="0 0 24 24" -->
            <!--                 preserveAspectRatio="none" -->
            <!--             > -->
            <!--                 <rect -->
            <!--                     x="1" -->
            <!--                     y="1" -->
            <!--                     width="22" -->
            <!--                     height="22" -->
            <!--                     fill="none" -->
            <!--                     stroke="black" -->
            <!--                     stroke-width="2" -->
            <!--                     stroke-dasharray={strokeStyle.value} -->
            <!--                     stroke-linecap={strokeStyle.name -->
            <!--                         .toLowerCase() -->
            <!--                         .includes("dotted") -->
            <!--                         ? "round" -->
            <!--                         : "butt"} -->
            <!--                 /> -->
            <!--             </svg> -->
            <!--         </button> -->
            <!--     {/each} -->
            <!-- </div> -->

            <p class="text-sm font-medium! mb-1">Stroke width</p>
            <div class="flex">
                {#each strokeWidths as strokeWidth, i}
                    <button
                        class={`min-w-4 min-h-4 mx-1 first:ml-0 last:mr-0 bg-white cursor-pointer`}
                        style={`outline: ${strokeWidth.value / 1.5}px solid black; outline-offset: -${strokeWidth.value / 2}px;`}
                        aria-label={`strokeWidth-${i}`}
                        onclick={() => {}}
                    >
                    </button>
                {/each}
            </div>
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

<!-- // const component = cellViews.length == 1 ? cellViews[0].model : null; -->
<!-- // let componentIsElement = $derived(component instanceof joint.dia.Element); -->
