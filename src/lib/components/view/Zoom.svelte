<script lang="ts">
    import { paper } from "$lib/utils";
    import * as joint from "@joint/core";
    import { ZoomIn, ZoomOut } from "@lucide/svelte";

    let zoom: number = $state(100);
    let zoomX: number = 0;
    let zoomY: number = 0;

    $effect(() => {
        paper.on(
            "blank:mousewheel",
            (event: joint.dia.Event, x: number, y: number, delta: number) => {
                event.preventDefault();
                zoom = Math.min(Math.max(zoom + delta * 10, 60), 200);
                zoomX = x;
                zoomY = y;
            },
        );
    });

    $effect(() => {
        const x = zoomX;
        const y = zoomY;

        const localPoint = paper.clientToLocalPoint({ x, y });

        paper.scale(zoom * 0.01);

        const newLocalPoint = paper.clientToLocalPoint({ x, y });
        const dx = Math.min(
            100,
            Math.max(-100, newLocalPoint.x - localPoint.x),
        );
        const dy = Math.min(
            100,
            Math.max(-100, newLocalPoint.y - localPoint.y),
        );

        const translate = paper.translate();
        paper.translate(translate.tx + dx, translate.ty + dy);
    });
</script>

<button
    class="grid place-items-center rounded-md w-7 h-7 hover:bg-gray-200"
    onclick={() => (zoom -= 10)}
>
    <ZoomOut size={16} />
</button>
<input type="number" bind:value={zoom} class="w-14" />
<button
    class="grid place-items-center rounded-md w-7 h-7 hover:bg-gray-200"
    onclick={() => (zoom += 10)}
>
    <ZoomIn size={16} />
</button>
