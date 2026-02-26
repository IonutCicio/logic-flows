<script lang="ts">
    import { paper } from "$lib/utils";
    import * as joint from "@joint/core";
    import { ZoomIn, ZoomOut } from "@lucide/svelte";

    let { zoom = $bindable(100) }: { zoom: number } = $props();

    let zoomX: number = 0;
    let zoomY: number = 0;

    paper.on(
        "blank:mousewheel",
        (event: joint.dia.Event, x: number, y: number, delta: number): void => {
            event.preventDefault();
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
