<script context="module">
	import { browser } from '$app/env';

	export const router = browser;

	function sleep(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
	// store a reference to our file handle
	let dirHandle;
	let folders = [];

	// https://expressflow.com/blog/posts/file-system-access-api-for-the-web-chrome
	async function getFolder() {
		// open file picker
		dirHandle = await window.showDirectoryPicker();
		console.log(dirHandle);

		/*for await (let [name, handle] of dirHandle.values()) {
			const kind = handle.kind;
			folders.push({
				name,
				handle,
				kind
			});
		}*/
	}

	async function dirty() {
		//create a folder
		const newDirHandle = await dirHandle.getDirectoryHandle('Folder by my PWA', { create: true });
		//and a subfolder in it
		await newDirHandle.getDirectoryHandle('subsubfolder', { create: true });

		// lets create a file (if it doesn't exists) this one won't be cleanedup
		const newFileHandle = await dirHandle.getFileHandle('testPersist.txt', {
			create: true
		});

		// lets create a file (if it doesn't exists)
		const newFileHandle2 = await newDirHandle.getFileHandle('PWA_with_fs_access.txt', {
			create: true
		});
		await sleep(3000);
		// Deleting is done via 'removeEntry' our newly created empty txt-file.
		await newDirHandle.removeEntry('PWA_with_fs_access.txt');
		// folder cleanup recursive
		await dirHandle.removeEntry('Folder by my PWA', { recursive: true });
	}
</script>

<svelte:head>
	<title>About</title>
</svelte:head>

<div class="content">
	<h1>Reading local folder</h1>
	<button on:click={getFolder}>Load folder</button>
	<button on:click={dirty}>Dirty</button>
	<div>
		<div id="list" style="width:50%">
			<ul>
				{#each folders as folder}
					<li>{folder.kind} -- {folder.name}</li>
				{/each}
			</ul>
		</div>
		<div id="file" style="width:50%">todo ...</div>
	</div>
</div>

<style>
	.content {
		width: 100%;
		max-width: var(--column-width);
		margin: var(--column-margin-top) auto 0 auto;
	}
</style>
