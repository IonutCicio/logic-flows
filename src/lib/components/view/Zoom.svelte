<script lang="ts">
    import { paper } from "$lib/utils";
    import * as joint from "@joint/core";
    import { Scan, ZoomIn, ZoomOut } from "@lucide/svelte";

    let zoom = $state(100);
    let zoomX: number = 0;
    let zoomY: number = 0;

    paper.on(
        "blank:mousewheel",
        function (
            _event: joint.dia.Event,
            x: number,
            y: number,
            delta: number,
        ) {
            zoom = Math.min(Math.max(zoom + delta * 10, 60), 200);
            zoomX = x;
            zoomY = y;
        },
    );

    $effect(() => {
        const x = zoomX;
        const y = zoomY;

        const initialLocalPoint = paper.pageToLocalPoint({ x, y });
        paper.scale(zoom / 100);
        const scaledLocalPoint = paper.pageToLocalPoint({ x, y });

        const dx = scaledLocalPoint.x - initialLocalPoint.x;
        const dy = scaledLocalPoint.y - initialLocalPoint.y;

        const translate = paper.translate();
        paper.translate(translate.tx + dx, translate.ty + dy);
    });
</script>

<svelte:window
    onkeydown={(event: KeyboardEvent) => {
        if (!(event.ctrlKey || event.metaKey)) {
            return;
        }

        if (event.key === "+") {
            event.preventDefault();
            zoom = Math.min(Math.max(zoom + 10, 60), 200);
            return;
        }

        if (event.key === "-") {
            event.preventDefault();
            zoom = Math.min(Math.max(zoom - 10, 60), 200);
            return;
        }
    }}
/>

<button
    class="grid place-items-center rounded-md w-7 h-7 hover:bg-gray-200"
    onclick={() => (zoom = Math.max(60, zoom - 10))}
>
    <ZoomOut size={16} />
</button>
<input type="number" min="60" max="200" bind:value={zoom} class="w-14" />
<button
    class="grid place-items-center rounded-md w-7 h-7 hover:bg-gray-200"
    onclick={() => (zoom = Math.min(zoom + 10, 200))}
>
    <ZoomIn size={16} />
</button>
<button
    title="Reset view"
    class="icon"
    onclick={() => {
        paper.translate(0, 0);
        zoom = 100;
    }}
>
    <Scan size={16} />
</button>
