<script lang="ts">
    import { paper } from "$lib/utils";
    import * as joint from "@joint/core";
    import { Scan, ZoomIn, ZoomOut } from "@lucide/svelte";
    import { onMount } from "svelte";

    let zoom = $state(100);
    let zoomX: number = 0;
    let zoomY: number = 0;

    const MIN_ZOOM: number = 60;
    const MAX_ZOOM: number = 200;

    function updateZoomWithDelta(x: number, y: number, delta: number) {
        zoom = Math.min(Math.max(zoom + delta * 10, MIN_ZOOM), MAX_ZOOM);
        zoomX = x;
        zoomY = y;
    }

    onMount(() => {
        zoom = Number.parseInt(localStorage.getItem("zoom") || "100");
    });

    $effect(() => {
        localStorage.setItem("zoom", `${zoom}`);
    });

    paper.on(
        "blank:mousewheel",
        function (
            _event: joint.dia.Event,
            x: number,
            y: number,
            delta: number,
        ) {
            updateZoomWithDelta(x, y, delta);
        },
    );

    paper.on(
        "element:mousewheel link:mousewheel",
        function (
            _elementView: joint.dia.ElementView,
            _event: joint.dia.Event,
            x: number,
            y: number,
            delta: number,
        ) {
            updateZoomWithDelta(x, y, delta);
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
    onkeypress={function (event: KeyboardEvent) {
        if (
            event.target instanceof HTMLElement &&
            event.target.tagName.toLowerCase() == "input"
        ) {
            return;
        }

        if (event.key === "+") {
            event.preventDefault();
            zoom = Math.min(Math.max(zoom + 10, MIN_ZOOM), MAX_ZOOM);
            return;
        }

        if (event.key === "-") {
            event.preventDefault();
            zoom = Math.min(Math.max(zoom - 10, MIN_ZOOM), MAX_ZOOM);
            return;
        }
    }}
/>

<button
    class="grid place-items-center rounded-md w-7 h-7 hover:bg-gray-MAX_ZOOM"
    onclick={() => (zoom = Math.max(MIN_ZOOM, zoom - 10))}
>
    <ZoomOut size={16} />
</button>
<input
    type="number"
    min="MIN_ZOOM"
    max="MAX_ZOOM"
    bind:value={zoom}
    class="w-14"
/>
<button
    class="grid place-items-center rounded-md w-7 h-7 hover:bg-gray-MAX_ZOOM"
    onclick={() => (zoom = Math.min(zoom + 10, MAX_ZOOM))}
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
