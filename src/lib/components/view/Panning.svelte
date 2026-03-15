<script lang="ts">
    import { EditorMode, paper } from "$lib/utils";
    import * as joint from "@joint/core";

    let {
        editorMode = $bindable(),
        mouseButton = $bindable(),
    }: { editorMode: EditorMode; mouseButton: number } = $props();

    let initialX: number = 0;
    let initialY: number = 0;

    paper.on("blank:pointerdown", function (event: joint.dia.Event) {
        const eventPositionOnPaper = paper.clientToLocalPoint(
            event.clientX || 0,
            event.clientY || 0,
        );
        initialX = eventPositionOnPaper.x;
        initialY = eventPositionOnPaper.y;
    });

    paper.on("blank:pointermove", function (event: joint.dia.Event) {
        if (editorMode !== EditorMode.Panning && mouseButton !== 1) {
            return;
        }

        const eventPositionOnPaper = paper.clientToLocalPoint(
            event.clientX || 0,
            event.clientY || 0,
        );

        const dx = eventPositionOnPaper.x - initialX;
        const dy = eventPositionOnPaper.y - initialY;

        const translate = paper.translate();
        paper.translate(translate.tx + dx, translate.ty + dy);
    });
</script>
