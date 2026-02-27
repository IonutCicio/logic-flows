<script lang="ts">
    import { EditorMode, paper } from "$lib/utils";
    import * as joint from "@joint/core";

    let {
        editorMode = $bindable(),
        mouseButton = $bindable(),
    }: { editorMode: EditorMode; mouseButton: number } = $props();

    let initialX: number = 0;
    let initialY: number = 0;

    paper.on(
        "blank:pointerdown",
        function (_event: joint.dia.Event, x: number, y: number) {
            initialX = x;
            initialY = y;
        },
    );

    paper.on(
        "blank:pointermove",
        function (_event: joint.dia.Event, x: number, y: number) {
            if (editorMode !== EditorMode.Panning && mouseButton !== 1) {
                return;
            }

            // TODO: use clientX and clientY to do it smoothly
            const dx = x - initialX;
            const dy = y - initialY;

            const translate = paper.translate();
            paper.translate(translate.tx + dx, translate.ty + dy);
        },
    );
</script>
