// Types for Giscus comments integration

export type GiscusMapping =
	| "pathname" // Map by URL pathname (recommended)
	| "url" // Map by full URL
	| "title" // Map by page title
	| "og:title" // Map by og:title meta tag
	| "specific" // Manually specify discussion
	| "number"; // Map by discussion number

export type GiscusTheme =
	| "light"
	| "light_high_contrast"
	| "light_protanopia"
	| "light_tritanopia"
	| "dark"
	| "dark_high_contrast"
	| "dark_protanopia"
	| "dark_tritanopia"
	| "dark_dimmed"
	| "transparent_dark"
	| "preferred_color_scheme"
	| `https://${string}`;

export interface GiscusConfig {
	/** GitHub repository in format "owner/repo" */
	repo: string;

	/** Repository ID from Giscus setup (get from https://giscus.app) */
	repoId: string;

	/** Discussion category name */
	category: string;

	/** Category ID from Giscus setup (get from https://giscus.app) */
	categoryId: string;

	/** How to map posts to discussions */
	mapping: GiscusMapping;

	/** Enable reactions on comments */
	reactionsEnabled: boolean;

	/** Emit discussion metadata */
	emitMetadata: boolean;

	/** Where to place input box */
	inputPosition: "top" | "bottom";

	/** Theme */
	theme: GiscusTheme;

	/** Language code */
	lang: string;

	/** Enable comments by default on all posts */
	defaultEnabled: boolean;

	/** Loading strategy */
	loading: "lazy" | "eager";
}
