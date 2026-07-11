<script lang="ts">
import { onMount } from "svelte";
import { giscusConfig } from "@/config";

interface Props {
	discussionNumber?: number;
	class?: string;
}

let { discussionNumber, class: className = "" }: Props = $props();

let container: HTMLDivElement;

onMount(() => {
	// Create script element for Giscus
	const script = document.createElement("script");
	script.src = "https://giscus.app/client.js";
	script.setAttribute("data-repo", giscusConfig.repo);
	script.setAttribute("data-repo-id", giscusConfig.repoId);
	script.setAttribute("data-category", giscusConfig.category);
	script.setAttribute("data-category-id", giscusConfig.categoryId);

	// Use discussionNumber if provided, otherwise use configured mapping
	if (discussionNumber) {
		script.setAttribute("data-mapping", "number");
		script.setAttribute("data-discussion-number", discussionNumber.toString());
	} else {
		script.setAttribute("data-mapping", giscusConfig.mapping);
	}

	script.setAttribute("data-strict", "0");
	script.setAttribute(
		"data-reactions-enabled",
		giscusConfig.reactionsEnabled ? "1" : "0",
	);
	script.setAttribute(
		"data-emit-metadata",
		giscusConfig.emitMetadata ? "1" : "0",
	);
	script.setAttribute("data-input-position", giscusConfig.inputPosition);
	script.setAttribute("data-theme", giscusConfig.theme);
	script.setAttribute("data-lang", giscusConfig.lang);
	script.setAttribute("data-loading", giscusConfig.loading);

	script.crossOrigin = "anonymous";
	script.async = true;

	// Append script to container
	container.appendChild(script);
});
</script>

<div bind:this={container} class="giscus-container w-full {className}"></div>
