<script lang="ts">
    import * as joint from "@joint/core";

    const { component }: { component: joint.dia.Link } = $props();
    let name: string = $derived(component.get("name") || "");
</script>

<div class="align-middle flex flex-col">
    <h3 class="text-xl text-center">Association</h3>

    Name

    <input
        type="text"
        bind:value={name}
        class="w-full rounded-md bg-white text-gray-900 p-1 border border-gray-300 focus:outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500 transition"
        oninput={() => component.set("name", name)}
    />
</div>
