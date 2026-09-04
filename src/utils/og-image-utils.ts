import { getImage } from "astro:assets";
import path from "node:path";
import { siteConfig } from "../config";
import { url } from "./url-utils";

export interface ResolvedOgImage {
	url: string;
	width?: number;
	height?: number;
}

// Social crawlers render large cards around 1200px wide and several (LinkedIn in particular) drop WebP previews.
const OG_IMAGE_WIDTH = 1200;
const OG_IMAGE_FORMAT = "jpeg";

type CoverSourceKind = "empty" | "external" | "public" | "local";

const localImages = import.meta.glob<ImageMetadata>(
	"../**/*.{png,jpg,jpeg,webp,avif,gif}",
	{ import: "default" },
);

function classifyCoverSource(src: string): CoverSourceKind {
	if (src.trim() === "") return "empty";
	if (
		src.startsWith("http://") ||
		src.startsWith("https://") ||
		src.startsWith("data:")
	)
		return "external";
	if (src.startsWith("/")) return "public";
	return "local";
}

async function resolveLocal(
	src: string,
	basePath: string,
	site: URL,
): Promise<ResolvedOgImage | undefined> {
	const normalizedPath = path
		.normalize(path.join("../", basePath, src))
		.replace(/\\/g, "/");
	const loader = localImages[normalizedPath];
	if (!loader) {
		console.warn(
			`[og-image] Cover image not found: ${normalizedPath.replace("../", "src/")}`,
		);
		return undefined;
	}
	try {
		const metadata = await loader();
		const width = Math.min(OG_IMAGE_WIDTH, metadata.width);
		const optimized = await getImage({
			src: metadata,
			width,
			format: OG_IMAGE_FORMAT,
		});
		return {
			url: new URL(optimized.src, site).href,
			width,
			height: Math.round((metadata.height / metadata.width) * width),
		};
	} catch (error) {
		console.warn(
			`[og-image] Failed to process cover image ${normalizedPath.replace("../", "src/")}: ${error}`,
		);
		return undefined;
	}
}

function resolveFallback(site: URL): Promise<ResolvedOgImage | undefined> {
	return resolveLocal(siteConfig.banner.src, "/", site);
}

export async function resolveOgImage(
	src: string | undefined,
	basePath: string,
	site: URL | undefined,
): Promise<ResolvedOgImage | undefined> {
	if (!site) return undefined;

	const raw = src ?? "";
	switch (classifyCoverSource(raw)) {
		case "external":
			return { url: raw };
		case "public":
			return { url: new URL(url(raw), site).href };
		case "local":
			return (await resolveLocal(raw, basePath, site)) ?? resolveFallback(site);
		default:
			return resolveFallback(site);
	}
}
