import * as joint from "@joint/core";
import { JointJSClass } from "./components/JointJS/JointJSClass";
import { conf } from ".";
import { get } from 'svelte/store';

export function exampleDiagram(graph: joint.dia.Graph) {
    /* @TODO: redo example diagram */
    // const class1 = new JointJSClass();
    // class1.position(get(conf).gridSize * 4, get(conf).gridSize * 8);
    // class1.set("name", "Hello");
    // class1.set("attributes", [
    //     "attr1: Data",
    //     "attr2: DataOra",
    //     "attr3: Magik",
    // ]);
    // class1.set("operations", ["op1(arg: Type): void"]);
    // class1.addTo(graph);
    //
    // const class2 = new JointJSClass();
    // class2.position(get(conf).gridSize * 4, get(conf).gridSize * 30);
    // class2.set("name", "World");
    // class2.set("attributes", [
    //     "attr1: Periodo",
    //     "attr2: FasciaOraria",
    //     "attr3: GiornoSettimana",
    // ]);
    // class2.addTo(graph);
}
