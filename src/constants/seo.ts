export interface OwnerIdentity {
	name: string;
	alternateName: string[];
	sameAs: string[];
	url: string;
}

// Canonical owner identity reused across sitewide and per-page structured data (JSON-LD)
export const ownerIdentity: OwnerIdentity = {
	name: "Alex Argyriou",
	alternateName: ["Alexandros Argyriou", "Alexander Argyriou"],
	sameAs: [
		"https://www.linkedin.com/in/alexander-argyriou/",
		"https://github.com/AlexanderArgyriou",
	],
	url: "https://pixel-pistons.com/",
};
