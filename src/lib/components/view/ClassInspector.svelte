<script lang="ts">
    import {
        UMLAttributeData,
        type IUMLClass,
        type UMLAttribute,
        type UMLOperation,
    } from "$lib/types/uml";
    import { ManuallyOrderedMap } from "$lib/collections.svelte";
    import { ArrowDown, ArrowUp, Plus, X } from "@lucide/svelte";

    const { component }: { component: IUMLClass } = $props();

    let name: string = $state("");
    let attributes = $state<UMLAttribute[]>([]);
    let operations: UMLOperation[] = $state([]);

    let openAttribute: [string, UMLAttributeData] | null = $state(null);

    // let entries = $derived.by(() => {
    //     attributes.version;
    //     return attributes.entries();
    // });

    $effect(() => {
        name = component.get("name");
    });

    $effect(() => {
        attributes = component.get("attributes");
    });

    $effect(() => {
        operations = component.get("operations");
    });

    $effect(() => {
        component.set("name", name);
    });

    $effect(() => {
        component.set("attributes", attributes);
        component.update();
    });

    $effect(() => {
        component.set("operations", operations);
    });
</script>

<div class="flex flex-col align-middle gap-2">
    <div>
        <p class="text-sm font-medium! mb-1">Name</p>
        <input type="text" bind:value={name} class="w-full" />
    </div>

    <div>
        <div class="flex justify-between items-center mb-2">
            <p class="text-sm font-medium!">Attributes</p>
            <button
                class="icon"
                onclick={() => {
                    let default_attributes_index = 0;
                    for (const attribute of attributes) {
                        if (attribute.name.startsWith("attribute")) {
                            try {
                                const id = Number(
                                    attribute.name.slice("attribute".length),
                                );
                                if (id >= default_attributes_index) {
                                    default_attributes_index = id + 1;
                                }
                            } catch (e) {}
                        }
                    }

                    attributes.push({
                        name: `attribute${default_attributes_index > 0 ? default_attributes_index : ""}`,
                        type: "Type",
                        multiplicityLower: 1,
                        multiplicityUpper: 1,
                        identifier: { enabled: false },
                    });
                }}
            >
                <Plus size={16} />
            </button>
        </div>

        <div class="flex flex-col gap-2">
            {#each attributes as attribute, index}
                <div class="flex items-center gap-2">
                    <input
                        class="w-30"
                        type="text"
                        value={attribute.name}
                        oninput={() => {
                            attributes[index].name = this.value;
                        }}
                    />
                    :
                    <input
                        class="w-20"
                        type="text"
                        value={attribute.type}
                        oninput={() => {
                            attributes[index].type = this.value;
                        }}
                    />

                    [
                    <input
                        class="w-10"
                        type="number"
                        min="0"
                        value={attribute.multiplicityLower}
                        oninput={() => {
                            attribute.multiplicityLower = this.value;
                        }}
                    />
                    ..
                    <input
                        class="w-7"
                        type="text"
                        value={attribute.multiplicityUpper}
                        oninput={() => {
                            attribute.multiplicityUpper = this.value;
                        }}
                    />
                    ]

                    <input
                        type="checkbox"
                        checked={attribute.identifierEnabled}
                        oninput={() => {
                            attributes[index].identifierEnabled = this.value;
                        }}
                    />

                    <input
                        class="w-10"
                        type="number"
                        min="1"
                        value={attribute.identifierEnabled
                            ? attribute.identifierNumber
                            : ""}
                        disabled={!attribute.identifierEnabled}
                        oninput={() => {
                            attribute.identifierNumber = this.value;
                        }}
                    />

                    <div class="flex gap-2">
                        <button
                            disabled={index === 0}
                            onclick={() => {
                                // attributes.swap(name, entries[index - 1][0]);
                            }}
                        >
                            <ArrowUp size={16} />
                        </button>

                        <button
                            disabled={index === attributes.length - 1}
                            onclick={() => {
                                // attributes.swap(name, entries[index + 1][0]);
                            }}
                        >
                            <ArrowDown size={16} />
                        </button>

                        <button
                            class="text-red-600"
                            onclick={() => {
                                attributes.splice(index, 1);
                            }}
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            {/each}
        </div>
    </div>
</div>

<!-- onclick={() => openModal(attr, "attribute")} -->
<!-- <button class="flex-1 cursor-pointer"> -->
<!--     <span class="font-mono text-sm"> {name} </span> -->
<!-- </button> -->

<!-- <div class="space-y-1"> -->
<!-- </div> -->
<!-- <div> -->
<!--     <div class="flex justify-between items-center mb-2"> -->
<!--         <p class="text-sm font-medium">Operations</p> -->
<!--         <button -->
<!--             class="text-blue-600 hover:text-blue-700 text-sm font-medium" -->
<!--             onclick={() => openModal(null, "operation")} -->
<!--             >+ Add operation</button -->
<!--         > -->
<!--     </div> -->
<!--     <div class="space-y-1"> -->
<!--         {#each operations as op, i (op.name)} -->
<!--             <div -->
<!--                 class="group flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 hover:border-blue-300" -->
<!--             > -->
<!--                 <button -->
<!--                     class="flex-1 cursor-pointer" -->
<!--                     onclick={() => openModal(op, "operation")} -->
<!--                 > -->
<!--                     <span class="font-mono text-sm"> -->
<!--                         {op.name} -->
<!--                     </span> -->
<!--                 </button> -->
<!---->
<!--                 <button -->
<!--                     onclick={() => moveProperty(op.name, "up")} -->
<!--                     disabled={i === 0} -->
<!--                     class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-700" -->
<!--                     >↑</button -->
<!--                 > -->
<!--                 <button -->
<!--                     onclick={() => moveProperty(op.name, "down")} -->
<!--                     disabled={i === attributes.length - 1} -->
<!--                     class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-700" -->
<!--                     >↓</button -->
<!--                 > -->
<!--                 <button -->
<!--                     onclick={() => deleteAttribute(op.name)} -->
<!--                     class="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600" -->
<!--                     >✕</button -->
<!--                 > -->
<!--             </div> -->
<!--         {/each} -->
<!--     </div> -->
<!-- </div> -->

<!-- <h3 class="text-xl text-center font-semibold">Class</h3> -->

<!-- onclick={() => openModal(null, "attribute")} -->
<!-- <button class="text-blue-600 hover:text-blue-700 text-sm font-medium" >+ Add attribute</button -->
<!-- > -->
<!-- {#if showModal} -->
<!--     <ClassPropertyInspector -->
<!--         kind={editingType as "attribute" | "operation"} -->
<!--         property={editingProperty} -->
<!--         onSave={saveProperty} -->
<!--         onClose={() => { -->
<!--             showModal = false; -->
<!--             editingProperty = null; -->
<!--         }} -->
<!--     /> -->
<!-- {/if} -->

<!-- // (component.get("attributes") || []).map((a: any, i: number) => ({ -->
<!-- //     name: typeof a === "string" ? a.split(":")[0].trim() : a.name, -->
<!-- //     type: -->
<!-- //         typeof a === "string" -->
<!-- //             ? (a.split(":")[1] || "DataOra").trim() -->
<!-- //             : a.type, -->
<!-- //     multiplicity: a.multiplicity, -->
<!-- //     isIdentifier: a.isIdentifier ?? false, -->
<!-- // })), -->
<!-- // ); -->
<!---->
<!-- // let operations: UMLOperation[] = $state( -->
<!-- //     (component.get("operations") || []).map((o: any, i: number) => { -->
<!-- //         if (typeof o === "string") { -->
<!-- //             // Parse string like "operation(arg: Type): Type" -->
<!-- //             const parenIndex = o.indexOf("("); -->
<!-- //             const colonIndex = o.lastIndexOf(":"); -->
<!-- //             const name = ( -->
<!-- //                 parenIndex > 0 ? o.slice(0, parenIndex) : o.split(":")[0] -->
<!-- //             ).trim(); -->
<!-- //             const type = ( -->
<!-- //                 colonIndex > parenIndex && colonIndex > 0 -->
<!-- //                     ? o.slice(colonIndex + 1) -->
<!-- //                     : "void" -->
<!-- //             ).trim(); -->
<!-- //             const paramsStr = ( -->
<!-- //                 parenIndex >= 0 -->
<!-- //                     ? o -->
<!-- //                           .slice( -->
<!-- //                               parenIndex + 1, -->
<!-- //                               colonIndex > 0 ? colonIndex : undefined, -->
<!-- //                           ) -->
<!-- //                           .replace(")", "") -->
<!-- //                     : "" -->
<!-- //             ).trim(); -->
<!-- // -->
<!-- //             const parameters: UMLParameter[] = paramsStr -->
<!-- //                 ? paramsStr -->
<!-- //                       .split(",") -->
<!-- //                       .map((p) => { -->
<!-- //                           const [pName, pType] = p -->
<!-- //                               .split(":") -->
<!-- //                               .map((s) => s.trim()); -->
<!-- //                           return { -->
<!-- //                               name: pName || "", -->
<!-- //                               type: pType || "any", -->
<!-- //                           }; -->
<!-- //                       }) -->
<!-- //                       .filter((p) => p.name) -->
<!-- //                 : []; -->
<!-- // -->
<!-- //             return { -->
<!-- //                 name, -->
<!-- //                 type, -->
<!-- //                 parameters, -->
<!-- //             }; -->
<!-- //         } else { -->
<!-- //             return { -->
<!-- //                 name: o.name || "", -->
<!-- //                 type: o.type || "", -->
<!-- //                 parameters: Array.isArray(o.parameters) ? o.parameters : [], -->
<!-- //             }; -->
<!-- //         } -->
<!-- //     }), -->
<!-- // ); -->
<!-- // <!-- oninput={() => component.set("name", name)} -->
<!-- // component.on("change:attributes", () => { -->
<!-- //     attributes = component.get("attributes"); -->
<!-- // }); -->
<!---->
<!-- // TODO: reactive component directly from item -->
<!-- // let attributes: UMLAttribute[] = $state(component.get("attributes")); -->
<!-- // let operations: UMLOperation[] = $state(component.get("operations")); -->
<!---->
<!-- // function updateName() { -->
<!-- //     component.set("name", name); -->
<!-- // } -->
<!-- -->
<!-- // attributes.set( -->
<!-- //     "ciao", -->
<!-- //     new UMLAttributeData( -->
<!-- //         new String1("Type"), -->
<!-- //         new Multiplicity(), -->
<!-- //         new Identifier(), -->
<!-- //     ), -->
<!-- // ); -->
<!---->
<!-- // $effect(() => { -->
<!-- //     console.log("called effect", attributes.length); -->
<!-- // }); -->
<!---->
<!-- // let editingType = $state<string>(""); -->
<!-- // let showModal = $state(false); -->
<!-- // let editingProperty: UMLAttributeData | UMLOperation | null = $state(null); -->
<!-- // -->
<!-- // function openModal( -->
<!-- //     attr: UMLAttributeData | UMLOperation | null = null, -->
<!-- //     type: "attribute" | "operation", -->
<!-- // ) { -->
<!-- //     editingType = type; -->
<!-- //     editingProperty = attr; -->
<!-- //     showModal = true; -->
<!-- // } -->
<!---->
<!-- // function saveProperty(newItem: UMLAttribute | UMLOperation) { -->
<!-- //     const isAttr = isUMLAttribute(newItem); -->
<!-- // -->
<!-- //     if (editingProperty) { -->
<!-- //         const array = isAttr ? attributes : operations; -->
<!-- // -->
<!-- //         const idx = array.findIndex( -->
<!-- //             (item) => item.name === editingProperty?.name, -->
<!-- //         ); -->
<!-- // -->
<!-- //         if (idx !== -1) { -->
<!-- //             array[idx] = newItem; -->
<!-- //         } -->
<!-- //     } else { -->
<!-- //         if (isAttr) { -->
<!-- //             attributes = [...attributes, newItem]; -->
<!-- //         } else { -->
<!-- //             operations = [...operations, newItem]; -->
<!-- //         } -->
<!-- //     } -->
<!-- // -->
<!-- //     if (isAttr) { -->
<!-- //         attributes = attributes.filter((a) => a.name.value.trim() !== ""); -->
<!-- //         component.set("attributes", attributes); -->
<!-- //     } else { -->
<!-- //         operations = operations.filter((o) => o.name.trim() !== ""); -->
<!-- //         component.set("operations", operations); -->
<!-- //     } -->
<!-- // } -->
<!---->
<!-- // function deleteAttribute(name: string) { -->
<!-- //     attributes = attributes.filter((a) => a.name.value !== name); -->
<!-- //     component.set("attributes", attributes); -->
<!-- // } -->
<!---->
<!-- // function moveProperty(name: string, direction: "up" | "down") { -->
<!-- //     const toMove = editingType === "attribute" ? attributes : operations; -->
<!-- //     const idx = attributes.findIndex((a) => a.name.value === name); -->
<!-- //     if (direction === "up" && idx > 0) { -->
<!-- //         [attributes[idx], attributes[idx - 1]] = [ -->
<!-- //             attributes[idx - 1], -->
<!-- //             attributes[idx], -->
<!-- //         ]; -->
<!-- //     } else if (direction === "down" && idx < attributes.length - 1) { -->
<!-- //         [attributes[idx], attributes[idx + 1]] = [ -->
<!-- //             attributes[idx + 1], -->
<!-- //             attributes[idx], -->
<!-- //         ]; -->
<!-- //     } -->
<!-- //     editingType === "attribute" -->
<!-- //         ? component.set("attributes", attributes) -->
<!-- //         : component.set("operations", operations); -->
<!-- // } -->
<!-- // import { writable } from "svelte/store"; -->
<!-- // import ClassPropertyInspector from "./ClassPropertyInspector.svelte"; -->
