<script lang="ts">
    import { graph } from "$lib/utils";
    import { Undo, Redo } from "@lucide/svelte";

    let history: string[] = new Array(20);
    let history_length: number = $state(-1);

    graph.on("add remove change", function (cell: any) {
        if (history_length === history.length) {
            // history.push(graph.toJSON());
        } else {
            // history[history_length] = graph.toJSON();
        }

        history_length++;
    });

    function undo() {
        if (history_length > 0) {
            history_length--;
            // graph.fromJSON(history[history_length - 1]);
        }
    }

    function redo() {
        if (history_length < history.length) {
            history_length++;
            // graph.fromJSON(history[history_length - 1]);
        }
    }
</script>

<svelte:window
    onkeydown={(event: KeyboardEvent) => {
        if (!(event.ctrlKey || event.metaKey)) {
            return;
        }

        if (event.key === "z") {
            event.preventDefault();
            undo();
            return;
        }

        if (event.key === "Z") {
            event.preventDefault();
            redo();
            return;
        }
    }}
/>

<button title="Undo" class="icon" onclick={undo} disabled={history_length < 0}>
    <Undo size={16} />
</button>
<button
    title="Redo"
    class="icon"
    onclick={redo}
    disabled={history_length === history.length}
>
    <Redo size={16} />
</button>
