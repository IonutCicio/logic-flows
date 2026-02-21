import * as joint from "@joint/core";
import { JointJSClass } from "./components/JointJS/JointJSClass";
import { JointJSAssociation } from "./components/JointJS/JointJSAssociation";
import { GRID_SIZE } from "./utils";

export function exampleDiagram(graph: joint.dia.Graph) {
    const class1 = new JointJSClass();
    class1.position(GRID_SIZE * 4, GRID_SIZE * 8);
    class1.set("name", "Hello");
    class1.set("attributes", [
        "attr1: Data",
        "attr2: DataOra",
        "attr3: Magik",
    ]);
    class1.set("operations", ["op1(arg: Type): void"]);
    class1.addTo(graph);

    const class2 = new JointJSClass();
    class2.position(GRID_SIZE * 4, GRID_SIZE * 30);
    class2.set("name", "World");
    class2.set("attributes", [
        "attr1: Periodo",
        "attr2: FasciaOraria",
        "attr3: GiornoSettimana",
    ]);
    class2.addTo(graph);

    const assoc1 = new JointJSAssociation();
    assoc1.source(class1);
    assoc1.target(class2);
    assoc1.set({
        sourceMultiplicity: "1..1",
        name: "to the",
        targetMultiplicity: "0..*",
    });
    assoc1.addTo(graph);

    const assoc2 = new JointJSAssociation();
    assoc2.source(class1);
    assoc2.target(class2);
    assoc2.set({
        sourceMultiplicity: "2..1",
        name: "male",
        targetMultiplicity: "0..*",
    });
    assoc2.addTo(graph);

    const assoc3 = new JointJSAssociation();
    assoc3.source(class1);
    assoc3.target(class2);
    assoc3.set({
        sourceMultiplicity: "3..1",
        name: "male2",
        targetMultiplicity: "0..*",
    });
    assoc3.addTo(graph);
}
