<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { initAuth, isLoading, isAuthenticated } from '$lib/stores/user';

	let { children } = $props();

	onMount(() => {
		initAuth();
	});

	// Route protection
	$effect(() => {
		const isLoginPage = $page.url.pathname === '/login';

		if (!$isLoading) {
			if (!$isAuthenticated && !isLoginPage) {
				goto('/login');
			}
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if $isLoading}
	<div class="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
		<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-400"></div>
	</div>
{:else}
	{@render children()}
{/if}
