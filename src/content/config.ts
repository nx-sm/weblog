import { z, defineCollection } from "astro:content";

function removeDupsAndLowerCase(array: string[]) {
	if (!array.length) return array;
	const lowercaseItems = array.map((str) => str.toLowerCase());
	const distinctItems = new Set(lowercaseItems);
	return Array.from(distinctItems);
}

function toPascalCase(str: string) {
	const cleanedStr = str.replace(/[^a-zA-Z0-9]+/g, " ");
	const words = cleanedStr.split(" ");

	return words
		.map((word) => {
			return word.charAt(0).toUpperCase() + word.slice(1);
		})
		.join("");
}

const post = defineCollection({
	schema: z.object({
		title: z.string().max(100),
		description: z.string().min(10).max(200),
		thumbnail: z.string().nullable().optional(),
		publishDate: z.string().transform((str) => new Date(str)),
		tags: z.array(z.string()).default([]).transform(removeDupsAndLowerCase),
		ogImage: z.string().optional(),
	}),
});

export const collections = { post };
