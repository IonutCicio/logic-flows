<script lang="ts">
import * as joint from "@joint/core";
import { JointJSClass } from "../JointJS/JointJSClass";

const {
	component,
	graph,
}: { component: joint.dia.Link; graph: joint.dia.Graph } = $props();

let sourceClass: string = $state(
	component.getSourceElement()?.get("name") || "None",
);
let destinationClass: string = $state(
	component.getTargetElement()?.get("name") || "None",
);

const classes = graph.getCells().filter((c) => c instanceof JointJSClass);

const handleSubmit = () => {
	alert("Not implemented!");
};
</script>

<div class="align-middle flex flex-col">
    <h3 class="text-xl text-center">Generalization</h3>

    Source Class

    <select bind:value={sourceClass} class="w-full rounded-md bg-white text-gray-900 p-1 border border-gray-300 focus:outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500 transition">
        {#each classes as cls}
            <option value={cls.id}>{cls.get('name') || 'Unnamed Class'}</option>
        {/each}
    </select>

    Destination Class

    <select bind:value={destinationClass} class="w-full rounded-md bg-white text-gray-900 p-1 border border-gray-300 focus:outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500 transition">
        {#each classes as cls}
            <option value={cls.id}>{cls.get('name') || 'Unnamed Class'}</option>
        {/each}
    </select>

    <button
        class="cursor-pointer mt-4 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition"
        onclick={handleSubmit}
    >
        Submit
    </button>
</div>