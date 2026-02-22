import type { UMLAttribute } from "./uml";

export const isStringArray = (value: any): value is string[] => {
	return (
		Array.isArray(value) && value.every((item) => typeof item === "string")
	);
};

export function isUMLAttribute(value: unknown): value is UMLAttribute {
	return (
		value != null &&
		typeof value === "object" &&
		"name" in value &&
		typeof (value as any).name === "string" &&
		"type" in value &&
		typeof (value as any).type === "string" &&
		(!("multiplicity" in value) ||
			typeof (value as any).multiplicity === "string" ||
			(value as any).multiplicity == null) &&
		"isIdentifier" in value &&
		typeof (value as any).isIdentifier === "boolean"
	);
}
