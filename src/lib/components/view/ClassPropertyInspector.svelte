<script lang="ts">
import {
	type UMLAttribute,
	type UMLOperation,
	type UMLParameter,
} from "$lib/types/uml";

const {
	kind = "attribute" as "attribute" | "operation",
	property,
	onSave,
	onClose,
}: {
	kind?: "attribute" | "operation";
	property: any; // will add types later
	onSave: (data: any) => void;
	onClose: () => void;
} = $props();

let name = $derived(property?.name || "");
let type = $derived(property?.type || "");
let multiplicity = $derived(property?.multiplicity || "");
let isIdentifier = $derived(property?.isIdentifier || false);

let parameters = $derived<UMLParameter[]>(property?.parameters || []);

// temporary until types interface is added
const types = ["Periodo", "DataOra", "Data", "Magik"];

function handleSave() {
	if (!name.trim()) return;

	const newData =
		kind === "attribute"
			? {
					...property,
					name: name.trim(),
					type,
					multiplicity: multiplicity || undefined,
					isIdentifier,
				}
			: {
					...property,
					name: name.trim(),
					parameters,
					type: type,
				};

	onSave(newData);
	onClose();
}

function addParameter() {
	parameters = [...parameters, { name: "", type: "DataOra" }];
}

function removeParameter(index: number) {
	parameters = parameters.filter((_, i) => i !== index);
}

function updateParameter(index: number, field: "name" | "type", value: string) {
	parameters[index] = { ...parameters[index], [field]: value };
}
</script>

<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
        <h3 class="text-2xl font-semibold text-center mb-6">
            {property ? `Edit ${kind === 'attribute' ? 'attribute' : 'operation'}` : `New ${kind === 'attribute' ? 'attribute' : 'operation'}`}
        </h3>

        <div class="space-y-4">
            <div>
                <label class="block text-sm font-medium mb-1">
                    {kind === 'attribute' ? 'Attribute name' : 'Operation name'}
                </label>
                <input type="text" bind:value={name} class="w-full rounded-md ..." placeholder="es. dataNascita" />
            </div>

            <div>
                <label class="block text-sm font-medium mb-1">
                    {kind === 'attribute' ? 'Type' : 'Return Type'}
                </label>
                <select bind:value={type} class="w-full rounded-md ...">
                    {#each types as t}
                        <option value={t}>{t}</option>
                    {/each}
                </select>
            </div>

            {#if kind === 'attribute'}
                <div>
                    <label class="block text-sm font-medium mb-1">Multiplicity</label>
                    <select bind:value={multiplicity} class="w-full rounded-md ...">
                        <option value="1">1</option>
                        <option value="0..1">0..1</option>
                        <option value="0..*">0..*</option>
                        <option value="1..*">1..*</option>
                    </select>
                </div>

                <label class="flex items-center gap-2">
                    <input type="checkbox" bind:checked={isIdentifier} class="w-4 h-4" />
                    <span>Is identifier (ID)</span>
                </label>
            {/if}

            {#if kind === 'operation'}
                <div>
                    <div class="flex justify-between items-center mb-2">
                        <label class="block text-sm font-medium">Parameters</label>
                        <button 
                            onclick={addParameter}
                            class="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                            + Add parameter
                        </button>
                    </div>

                    <div class="space-y-2">
                        {#each parameters as param, index (index)}
                            <div class="flex gap-2 items-start">
                                <input 
                                    type="text" 
                                    bind:value={param.name}
                                    oninput={() => updateParameter(index, 'name', param.name)}
                                    placeholder="paramName"
                                    class="flex-1 rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <select 
                                    bind:value={param.type}
                                    onchange={() => updateParameter(index, 'type', param.type)}
                                    class="w-28 rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    {#each types as t}
                                        <option value={t}>{t}</option>
                                    {/each}
                                </select>
                                <button 
                                    onclick={() => removeParameter(index)}
                                    class="text-red-500 hover:text-red-700 px-2 py-2">✕</button>
                            </div>
                        {/each}

                        {#if parameters.length === 0}
                            <p class="text-xs text-gray-400 italic text-center py-2">No parameters yet</p>
                        {/if}
                    </div>
                </div>
            {/if}
        </div>

        <div class="flex gap-3 mt-8">
            <button onclick={onClose} class="flex-1 py-2.5 border rounded-lg hover:bg-gray-50">Cancel</button>
            <button onclick={handleSave} class="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
        </div>
    </div>
</div>