<script lang="ts">
import * as joint from "@joint/core";
import type { UMLAttribute, UMLOperation, UMLParameter } from "$lib/types/uml";
import ClassPropertyInspector from "./ClassPropertyInspector.svelte";
import { isUMLAttribute } from "$lib/types/typeSafety";

const { component }: { component: joint.dia.Element } = $props();

let name: string = $state(component.get("name") || "");
let editingType = $state<string>("");

let attributes: UMLAttribute[] = $state(
	(component.get("attributes") || []).map((a: any, i: number) => ({
		name: typeof a === "string" ? a.split(":")[0].trim() : a.name,
		type:
			typeof a === "string" ? (a.split(":")[1] || "DataOra").trim() : a.type,
		multiplicity: a.multiplicity,
		isIdentifier: a.isIdentifier ?? false,
	})),
);

let operations: UMLOperation[] = $state(
	(component.get("operations") || []).map((o: any, i: number) => {
		if (typeof o === "string") {
			// Parse string like "operation(arg: Type): Type"
			const parenIndex = o.indexOf("(");
			const colonIndex = o.lastIndexOf(":");
			const name = (
				parenIndex > 0 ? o.slice(0, parenIndex) : o.split(":")[0]
			).trim();
			const type = (
				colonIndex > parenIndex && colonIndex > 0
					? o.slice(colonIndex + 1)
					: "void"
			).trim();
			const paramsStr = (
				parenIndex >= 0
					? o
							.slice(parenIndex + 1, colonIndex > 0 ? colonIndex : undefined)
							.replace(")", "")
					: ""
			).trim();

			const parameters: UMLParameter[] = paramsStr
				? paramsStr
						.split(",")
						.map((p) => {
							const [pName, pType] = p.split(":").map((s) => s.trim());
							return { name: pName || "", type: pType || "any" };
						})
						.filter((p) => p.name)
				: [];

			return {
				name,
				type,
				parameters,
			};
		} else {
			return {
				name: o.name || "",
				type: o.type || "",
				parameters: Array.isArray(o.parameters) ? o.parameters : [],
			};
		}
	}),
);

console.log(operations);

let showModal = $state(false);
let editingProperty: UMLAttribute | UMLOperation | null = $state(null);

function updateName() {
	component.set("name", name);
}

function openModal(
	attr: UMLAttribute | UMLOperation | null = null,
	type: "attribute" | "operation",
) {
	editingType = type;
	editingProperty = attr;
	showModal = true;
}

function saveProperty(newItem: UMLAttribute | UMLOperation) {
	const isAttr = isUMLAttribute(newItem);

	if (editingProperty) {
		const array = isAttr ? attributes : operations;

		const idx = array.findIndex((item) => item.name === editingProperty?.name);

		if (idx !== -1) {
			array[idx] = newItem;
		}
	} else {
		if (isAttr) {
			attributes = [...attributes, newItem];
		} else {
			operations = [...operations, newItem];
		}
	}

	if (isAttr) {
		attributes = attributes.filter((a) => a.name.trim() !== "");
		component.set("attributes", attributes);
	} else {
		operations = operations.filter((o) => o.name.trim() !== "");
		component.set("operations", operations);
	}
}

function deleteAttribute(name: string) {
	attributes = attributes.filter((a) => a.name !== name);
	component.set("attributes", attributes);
}

function moveProperty(name: string, direction: "up" | "down") {
	const toMove = editingType === "attribute" ? attributes : operations;
	const idx = attributes.findIndex((a) => a.name === name);
	if (direction === "up" && idx > 0) {
		[attributes[idx], attributes[idx - 1]] = [
			attributes[idx - 1],
			attributes[idx],
		];
	} else if (direction === "down" && idx < attributes.length - 1) {
		[attributes[idx], attributes[idx + 1]] = [
			attributes[idx + 1],
			attributes[idx],
		];
	}
	editingType === "attribute"
		? component.set("attributes", attributes)
		: component.set("operations", operations);
}
</script>

<div class="align-middle flex flex-col">
    <h3 class="text-xl text-center font-semibold">Class</h3>

    <div>
        <p class="text-sm font-medium mb-1">Name</p>
        <input type="text" bind:value={name} oninput={updateName}
               class="w-full rounded-md bg-white text-gray-900 p-1 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
    </div>

    <div>
        <div class="flex justify-between items-center mb-2">
            <p class="text-sm font-medium">Attributes</p>
            <button onclick={() => openModal(null, "attribute")} 
                    class="text-blue-600 hover:text-blue-700 text-sm font-medium">+ Add attribute</button>
        </div>

        <div class="space-y-1">
            {#each attributes as attr, i (attr.name)}
                <div class="group flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 hover:border-blue-300">
                    <button class="flex-1 cursor-pointer" onclick={() => openModal(attr, "attribute")}>
                        <span class="font-mono text-sm">
                            {attr.name}
                        </span>
                    </button>

                    <button onclick={() => moveProperty(attr.name, 'up')} disabled={i===0}
                            class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-700">↑</button>
                    <button onclick={() => moveProperty(attr.name, 'down')} disabled={i===attributes.length-1}
                            class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-700">↓</button>
                    <button onclick={() => deleteAttribute(attr.name)}
                            class="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600">✕</button>
                </div>
            {/each}
        </div>
    </div>

    <div>
        <div class="flex justify-between items-center mb-2">
            <p class="text-sm font-medium">Operations</p>
            <button class="text-blue-600 hover:text-blue-700 text-sm font-medium" onclick={() => openModal(null, "operation")}>+ Add operation</button>
        </div>
        <div class="space-y-1">
            {#each operations as op, i (op.name)}
                <div class="group flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 hover:border-blue-300">
                    <button class="flex-1 cursor-pointer" onclick={() => openModal(op, "operation")}>
                        <span class="font-mono text-sm">
                            {op.name}
                        </span>
                    </button>

                    <button onclick={() => moveProperty(op.name, 'up')} disabled={i===0}
                            class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-700">↑</button>
                    <button onclick={() => moveProperty(op.name, 'down')} disabled={i===attributes.length-1}
                            class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-700">↓</button>
                    <button onclick={() => deleteAttribute(op.name)}
                            class="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600">✕</button>
                </div>
            {/each}
        </div>
    </div>
</div>

{#if showModal}    
    <ClassPropertyInspector 
            kind={editingType as "attribute" | "operation"}
            property={editingProperty}
            onSave={saveProperty}
            onClose={() => { showModal = false; editingProperty = null; }}
    />
{/if}