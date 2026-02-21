<script lang="ts">
import * as joint from "@joint/core";
import { JointJSGeneralization } from "../JointJS/JointJSGeneralization";
const {
	classes,
	onCreate,
}: { classes: joint.dia.Element[]; onCreate: (link: joint.dia.Link) => void } =
	$props();

let sourceId: string = $state("");
let targetId: string = $state("");
let name: string = $state("");

let error: string = $state("");

function handleSubmit() {
	if (!sourceId || !targetId) {
		error = "Select both source and destination.";
		return;
	}
	if (sourceId === targetId) {
		error = "Source and destination cannot be the same class.";
		return;
	}

	const source = classes.find((c) => c.id === sourceId);
	const target = classes.find((c) => c.id === targetId);

	if (!source || !target) {
		error = "Class not found.";
		return;
	}

	const link = new JointJSGeneralization({ name });
	link.source(source);
	link.target(target);

	error = "";
	onCreate(link);

	sourceId = "";
	targetId = "";
	name = "";
}
</script>

<div class="align-middle flex flex-col my-12 px-8">
    <h3 class="text-xl text-center">Create Generalization</h3>

    Source Class

    <select bind:value={sourceId} class="w-full rounded-md bg-white text-gray-900 p-1 border border-gray-300 focus:outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500 transition">
        <option value="">Select source...</option>
        {#each classes as cls}
            <option value={cls.id}>{cls.get('name') || 'Unnamed Class'}</option>
        {/each}
    </select>

    Destination Class

    <select bind:value={targetId} class="w-full rounded-md bg-white text-gray-900 p-1 border border-gray-300 focus:outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500 transition">
        <option value="">Select destination...</option>
        {#each classes as cls}
            <option value={cls.id}>{cls.get('name') || 'Unnamed Class'}</option>
        {/each}
    </select>

    Name

    <input
        type="text"
        bind:value={name}
        class="w-full rounded-md bg-white text-gray-900 p-1 border border-gray-300 focus:outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500 transition"
    />

    {#if error}
        <p class="text-red-500 text-sm">{error}</p>
    {/if}

    <button
        class="cursor-pointer mt-4 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition"
        onclick={handleSubmit}
    >
        Create
    </button>
</div>