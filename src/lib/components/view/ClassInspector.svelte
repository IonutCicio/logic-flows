<script lang="ts">
    import * as joint from "@joint/core";

    const { component }: { component: joint.dia.Element } = $props();

    let name: string = $derived(component.get("name") || "");
    let attributes: string[] = $state(component.get("attributesList") || []);
    let operations: string[] = $state(component.get("operationsList") || []);
</script>

<div class="align-middle flex flex-col">
    <h3 class="text-xl text-center">Class</h3>

    Name

    <input
        type="text"
        bind:value={name}
        class="w-full rounded-md bg-white text-gray-900 p-1 border border-gray-300 focus:outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500 transition"
        oninput={() => component.set("name", name)}
    />

    {#each attributes as _, index}
        <input
            type="text"
            bind:value={attributes[index]}
            oninput={() => {
                component.set("attributesList", [...attributes]);
            }}
        />
    {/each}

    <button
        class="cursor-pointer"
        onclick={() => {
            component.set("attributesList", [...attributes, "attr: Prova"]);
        }}
    >
        + add attribute
    </button>

    {#each operations as _, index}
        <input
            type="text"
            bind:value={operations[index]}
            oninput={() => {
                component.set("operationsList", [...operations]);
            }}
        />
        <br />
    {/each}

    <button
        class="cursor-pointer"
        onclick={() => {
            component.set("operationsList", [...operations, "op(args): void"]);
        }}
    >
        + add operation
    </button>
</div>
