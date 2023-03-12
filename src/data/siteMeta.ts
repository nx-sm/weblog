type SiteMeta = {
	title: string;
	description?: string;
	thumbnail?: string | ImageMetadata | Promise<{ default: ImageMetadata; }>
	ogImage?: string | undefined;
	articleDate?: string | undefined;
};

export type { SiteMeta };
