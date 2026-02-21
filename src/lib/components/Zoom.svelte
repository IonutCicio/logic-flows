<script lang="ts">
    import * as joint from "@joint/core";

    const { paper }: { paper: joint.dia.Paper } = $props();

    let zoomLevel: number = $state(100);
    let zoomX: number = 0;
    let zoomY: number = 0;

    $effect(() => {
        paper.on(
            "blank:mousewheel",
            (event: joint.dia.Event, x: number, y: number, delta: number) => {
                event.preventDefault();
                zoomLevel = Math.max(zoomLevel + delta * 10, 20);
                zoomX = x;
                zoomY = y;
            },
        );
    });

    $effect(() => {
        const x = zoomX;
        const y = zoomY;

        const localPoint = paper.clientToLocalPoint({ x, y });

        paper.scale(zoomLevel * 0.01);

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
    class="grid place-items-center rounded-md w-8 h-8"
    onclick={(e) => {
        e.preventDefault();
        zoomLevel -= 10;
    }}
>
    <span class="material-symbols-outlined"> zoom_out </span>
</button>
<input type="number" bind:value={zoomLevel} class="w-14" />
<button
    class="grid place-items-center rounded-md w-8 h-8"
    onclick={(e) => {
        e.preventDefault();
        zoomLevel += 10;
    }}
>
    <span class="material-symbols-outlined"> zoom_in </span>
</button>

<!-- <div class="flex items-center gap-3 bg-white px-3 py-2 card"> -->
<!-- </div> -->
