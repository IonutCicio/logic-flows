<script lang="ts">
    import {
        Multiplicity,
        type IUMLClass,
        type UMLAttribute,
        type UMLOperation,
    } from "$lib/types/uml";
    import { hexToHSL, HSLToHex } from "$lib/utils";
    import { ArrowDown, ArrowUp, Plus, X } from "@lucide/svelte";

    const { component }: { component: IUMLClass } = $props();

    let name = $state(component.get("name") || "");
    let attributes = $state<UMLAttribute[]>(component.get("attributes") || []);
    let operations = $state<UMLOperation[]>(component.get("operations") || []);
    let strokeHex = $derived(HSLToHex(component.attr("body/stroke") || '#000000'));
    let fillHex   = $derived(HSLToHex(component.attr("body/fill")   || '#ffffff'));

    const changeStyle = (e: Event & { currentTarget: EventTarget & HTMLInputElement; }, type: "stroke" | "fill") => {
        const obj = hexToHSL(e.currentTarget.value)
        const value = `hsl(${obj.h}, ${obj.s}%, ${obj.l}%)`
        switch(type) {
            case "stroke":
                component.attr("body/stroke", value);
                break;
            case "fill":
                component.attr("body/fill", value);
        }
    }

    function swapAttributes(indexA: number, indexB: number) {
        if (
            indexA < 0 ||
            indexB < 0 ||
            indexA >= attributes.length ||
            indexB >= attributes.length ||
            indexA === indexB
        ) {
            return;
        }[attributes[indexA], attributes[indexB]] = [attributes[indexB], attributes[indexA]];

        attributes = [...attributes];
    }

    function swapOperations(indexA: number, indexB: number) {
        if (
            indexA < 0 ||
            indexB < 0 ||
            indexA >= operations.length ||
            indexB >= operations.length ||
            indexA === indexB
        ) {
            return;
        }

        [operations[indexA], operations[indexB]] = [operations[indexB], operations[indexA]];

        operations = [...operations];
    }

    // $effect(() => {
    //     name = component.get("name");
    // });

    // $effect(() => {
    //     attributes = component.get("attributes");
    // });

    // $effect(() => {
    //     operations = component.get("operations");
    // });

    $effect(() => {
        component.set("name", name);
    });

    $effect(() => {
        component.set("attributes", attributes);
        component.update();
    });

    $effect(() => {
        component.set("operations", operations);
        component.update();
    });
</script>

<div class="flex flex-col align-middle gap-2">
    <div>
        <p class="text-sm font-medium! mb-1">Name</p>
        <input type="text" bind:value={name} class="w-full" />
    </div>
    <div>
        <p class="text-sm font-medium! mb-1">Stroke color</p>
        <input type="color" bind:value={strokeHex} onchange={(e) => changeStyle(e, "stroke")} colorspace="limited-srgb" class="w-full h-8 rounded-md cursor-pointer" />
    </div>
    <div>
        <p class="text-sm font-medium! mb-1">Fill color</p>
        <input type="color" bind:value={fillHex} onchange={(e) => changeStyle(e, "fill")} colorspace="limited-srgb" class="w-full h-8 rounded-md cursor-pointer" />
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
                        identifierEnabled: false,
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
                        bind:value={attribute.name}
                    />
                    :
                    <input
                        class="w-20"
                        type="text"
                        bind:value={attribute.type}
                    />
                    [
                    <input
                        class="w-10"
                        type="number"
                        min="0"
                        bind:value={attribute.multiplicityLower}
                    />
                    ..
                    <input
                        class="w-7"
                        type="text"
                        bind:value={attribute.multiplicityUpper}
                    />
                    ]

                    <input
                        type="checkbox"
                        bind:checked={attribute.identifierEnabled}
                    />

                    <input
                        class="w-10"
                        type="number"
                        min="1"
                        bind:value={attribute.identifierNumber}
                        disabled={!attribute.identifierEnabled}
                    />

                    <div class="flex gap-2">
                        <button
                            disabled={index === 0}
                            onclick={() => {
                                swapAttributes(index, index-1);
                            }}
                        >
                            <ArrowUp size={16} />
                        </button>

                        <button
                            disabled={index === attributes.length - 1}
                            onclick={() => {
                                swapAttributes(index, index+1)
                            }}
                        >
                            <ArrowDown size={16} />
                        </button>

                        <button
                            class="text-red-600"
                            onclick={() => {
                                attributes.splice(index, 1);
                                component.set("attributes", attributes);
                            }}
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            {/each}
        </div>
    </div>

    <div>
        <div class="flex justify-between items-center mb-2">
            <p class="text-sm font-medium!">Operations</p>
            <button
                class="icon"
                onclick={() => {
                    let default_operations_index = 0;
                    for (const operation of operations) {
                        if (operation.name.startsWith("operation")) {
                            try {
                                const id = Number(
                                    operation.name.slice("operation".length),
                                );
                                if (id >= default_operations_index) {
                                    default_operations_index = id + 1;
                                }
                            } catch (e) {}
                        }
                    }

                    operations.push({
                        name: `operation${default_operations_index > 0 ? default_operations_index : ""}`,
                        type: "void",
                        multiplicity: new Multiplicity(),
                    });
                }}
            >
                <Plus size={16} />
            </button>
        </div>

        <div class="flex flex-col gap-2">
            {#each operations as operation, index}
                <div class="flex items-center gap-2">
                    <input
                        class="w-30"
                        type="text"
                        bind:value={operation.name}
                    />
                    :
                    <input
                        class="w-20"
                        type="text"
                        bind:value={operation.type}
                    />

                    <div class="flex gap-2 ml-auto">
                        <button
                            disabled={index === 0}
                            onclick={() => {
                                swapOperations(index, index-1);
                            }}
                        >
                            <ArrowUp size={16} />
                        </button>

                        <button
                            disabled={index === operations.length - 1}
                            onclick={() => {
                                swapOperations(index, index+1)
                            }}
                        >
                            <ArrowDown size={16} />
                        </button>

                        <button
                            class="text-red-600"
                            onclick={() => {
                                operations.splice(index, 1);
                                component.set("operations", operations);
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
