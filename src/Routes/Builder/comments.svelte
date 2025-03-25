<script>
	import { onMount } from 'svelte';
	import { api, user } from '$lib/stores.js';
	import Avatar from '$lib/avatar.svelte';
	import TitleBadge from '$lib/TitleBadge.svelte';
	import { toast } from '@zerodevx/svelte-toast';
	import Icon from '@iconify/svelte';
	export let buildId;
	export let isVisible = false;
	let comments = [];
	let isLoading = true;
	let currentPage = 1;
	let totalPages = 1;
	let sortBy = 'newest';
	let isReplying = null;
	let isSubmitting = false;
	let isReplySubmitting = {};
	let replyContent = '';
	let commentFilterWarning = null; // New state for filter warning
	let replyFilterWarnings = {}; // New state for reply filter warnings

	// Format date to relative time (e.g., "2 hours ago")
	function formatRelativeTime(dateString) {
		const date = new Date(dateString);
		const now = new Date();
		const diffInSeconds = Math.floor((now - date) / 1000);

		if (diffInSeconds < 60) return 'just now';
		if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
		if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
		if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
		return date.toLocaleDateString();
	}

	async function loadComments(resetPage = false) {
		if (resetPage) {
			currentPage = 1;
		}

		isLoading = true;

		try {
			const [response] = await Promise.all([
				fetch(`${api}/build/${buildId}/comments?page=${currentPage}&sort=${sortBy}`),
				new Promise((resolve) => setTimeout(resolve, 300))
			]);

			if (!response.ok) throw new Error('Failed to fetch comments');

			const data = await response.json();
			// Make sure we properly assign both comments and totalPages
			comments = data.comments.comments || [];
			totalPages = data.comments.totalPages || 1;
		} catch (error) {
			console.error('Error loading comments:', error);
			toast.push('Failed to load comments');
			comments = [];
		} finally {
			isLoading = false;
		}
	}

	async function submitComment(parentId = null) {
		if (!$user) {
			toast.push('Please log in to comment');
			return;
		}

		const content = parentId ? replyContent : document.getElementById('comment-input').value;
		if (!content.trim()) {
			toast.push('Comment cannot be empty');
			return;
		}

		if (parentId) {
			isReplySubmitting[parentId] = true;
			replyFilterWarnings[parentId] = null;
		} else {
			isSubmitting = true;
			commentFilterWarning = null;
		}

		try {
			const response = await fetch(`${api}/build/${buildId}/comments`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					userId: $user.id,
					content,
					authorName: $user.username,
					authorAvatar: $user.avatar,
					parentId
				}),
				credentials: 'include'
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to post comment');
			}

			// Handle filter warnings if present
			if (data.warning) {
				if (parentId) {
					replyFilterWarnings[parentId] = data.warning;
				} else {
					commentFilterWarning = data.warning;
				}

				toast.push(data.warning, {
					theme: {
						'--toastBackground': '#FFF3CD',
						'--toastColor': '#856404',
						'--toastBarBackground': '#FFE69C'
					}
				});
			} else {
				toast.push('Comment posted successfully');
			}

			// Clear inputs and reset states before reloading
			if (parentId) {
				replyContent = '';
				isReplying = null; // Reset the reply state
				isReplySubmitting[parentId] = false;
			} else {
				document.getElementById('comment-input').value = '';
				isSubmitting = false;
			}

			// Reload comments to get the updated data
			await loadComments(false);
		} catch (error) {
			if (error.message.includes('inappropriate content')) {
				toast.push(error.message, {
					theme: {
						'--toastBackground': '#F8D7DA',
						'--toastColor': '#721C24',
						'--toastBarBackground': '#F5C6CB'
					}
				});
			} else {
				toast.push(error.message || 'Failed to post comment');
			}
		} finally {
			// Ensure states are reset even if there's an error
			if (parentId) {
				isReplySubmitting[parentId] = false;
			} else {
				isSubmitting = false;
			}
		}
	}

	async function deleteComment(commentId) {
		if (!confirm('Are you sure you want to delete this comment?')) return;

		try {
			const response = await fetch(`${api}/build/${buildId}/comments/${commentId}`, {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userId: $user.id }),
				credentials: 'include'
			});

			if (!response.ok) throw new Error('Failed to delete comment');

			loadComments();
			toast.push('Comment deleted successfully');
		} catch (error) {
			console.error('Error deleting comment:', error);
			toast.push('Failed to delete comment');
		}
	}

	async function handleVote(commentId, voteType) {
		if (!$user) {
			toast.push('Please log in to vote');
			return;
		}

		try {
			const response = await fetch(`${api}/build/${buildId}/comments/${commentId}/vote`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userId: $user.id, voteType }),
				credentials: 'include'
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error);
			}

			loadComments();
		} catch (error) {
			toast.push(error.message);
		}
	}

	function handleSort(newSort) {
		if (sortBy !== newSort) {
			sortBy = newSort;
			currentPage = 1;
			loadComments();
		}
	}

	function handlePreviousPage() {
		if (currentPage > 1) {
			currentPage--;
			loadComments();
		}
	}

	function handleNextPage() {
		if (currentPage < totalPages) {
			currentPage++;
			loadComments();
		}
	}

	onMount(() => {
		loadComments();
	});
</script>

<!-- Comments section -->
<div class="comments-container border" style={isVisible ? `display: block` : `display: none`}>
	{#if $user}
		<div class="comment-input-container">
			<Avatar w="30px" h="30px" img={`${$user.avatar}`} />
			<div class="input-wrapper">
				<textarea
					id="comment-input"
					class="input"
					class:has-warning={commentFilterWarning}
					placeholder="Write a comment..."
					rows="2"
				></textarea>
				{#if commentFilterWarning}
					<div class="filter-warning">
						<Icon icon="octicon:alert-16" />
						{commentFilterWarning}
					</div>
				{/if}
			</div>
			<button
				class="comment-submit border-edge"
				on:click={() => submitComment()}
				disabled={isSubmitting}
			>
				{#if isSubmitting}
					<Icon icon="octicon:sync-16" class="spinner" />
				{:else}
					Post
				{/if}
			</button>
		</div>
	{:else}
		<div class="login-prompt border">
			<p>Please log in to comment</p>
		</div>
	{/if}

	<div class="sort-controls">
		<button
			class={`${sortBy === 'newest' ? 'active' : ''} border-edge`}
			on:click={() => handleSort('newest')}>Newest</button
		>
		<button
			class={`${sortBy === 'oldest' ? 'active' : ''} border-edge`}
			on:click={() => handleSort('oldest')}>Oldest</button
		>
		<button
			class={`${sortBy === 'votes' ? 'active' : ''} border-edge`}
			on:click={() => handleSort('votes')}>Most Voted</button
		>
	</div>

	{#if isLoading}
		<div class="loading-state">
			<Icon icon="octicon:sync-16" class="spinner" />
			<p>Loading comments...</p>
		</div>
	{:else if comments.length === 0}
		<div class="no-comments">No comments yet</div>
	{:else}
		<div class="comments-list">
			{#each comments as comment (comment.id)}
				<div class="comment border-edge">
					<div class="comment-header">
						<div class="comment-author">
							<Avatar
								w="24px"
								h="24px"
								img={`https://cdn.discordapp.com/avatars/${comment.author.id}/${comment.author.avatar}.png`}
							/>
							<span class="author-name">{comment.author.name}</span>
							<TitleBadge title={comment.author.titles[0]} />
						</div>
						<span class="comment-time">{formatRelativeTime(comment.createdAt)}</span>
					</div>
					<div class="comment-content">
						{comment.content}
					</div>
					<div class="comment-actions">
						<div class="vote">
							<button
								class="vote-button"
								class:active={comment.votes?.voters?.[`${$user?.id}`] === 'up'}
								on:click={() => handleVote(comment.id, 'up')}
							>
								<img
									src={comment.votes?.voters?.[`${$user?.id}`] === 'up'
										? 'upvote.png'
										: 'neutralup.png'}
									alt="upvote"
								/>
							</button>
							<p>{(comment.votes?.up || 0) - (comment.votes?.down || 0)}</p>
							<button
								class="vote-button"
								class:active={comment.votes?.voters?.[`${$user?.id}`] === 'down'}
								on:click={() => handleVote(comment.id, 'down')}
							>
								<img
									src={comment.votes?.voters?.[`${$user?.id}`] === 'down'
										? 'downvote.png'
										: 'neutraldown.png'}
									alt="downvote"
								/>
							</button>
						</div>
						<button class="reply-button" on:click={() => (isReplying = comment.id)}>Reply</button>
						{#if $user && comment.author.id === $user.id}
							<button class="delete-button" on:click={() => deleteComment(comment.id)}>
								Delete
							</button>
						{/if}
					</div>

					{#if isReplying === comment.id}
						<div class="reply-form">
							<div class="input-wrapper">
								<textarea
									bind:value={replyContent}
									class="input"
									class:has-warning={replyFilterWarnings[comment.id]}
									placeholder="Write a reply..."
									rows="2"
								></textarea>
								{#if replyFilterWarnings[comment.id]}
									<div class="filter-warning">
										<Icon icon="octicon:alert-16" />"
										{replyFilterWarnings[comment.id]}
									</div>
								{/if}
							</div>
							<div class="reply-actions">
								<button
									class="delete-button"
									on:click={() => (isReplying = null)}
									disabled={isReplySubmitting[comment.id]}
								>
									Cancel
								</button>
								<button
									class="reply-button"
									on:click={() => submitComment(comment.id)}
									disabled={isReplySubmitting[comment.id]}
								>
									{#if isReplySubmitting[comment.id]}
										<Icon icon="octicon:sync-16" class="spinner" />
									{:else}
										Reply
									{/if}
								</button>
							</div>
						</div>
					{/if}

					{#if comment.replies && comment.replies.length > 0}
						<div class="replies">
							{#each comment.replies as reply (reply.id)}
								<div class="reply">
									<div class="comment-header">
										<div class="comment-author">
											<Avatar
												w="20px"
												h="20px"
												img={`https://cdn.discordapp.com/avatars/${reply.author.id}/${reply.author.avatar}.png`}
											/>
											<span class="author-name">{reply.author.name}</span>
											<TitleBadge title={reply.author.titles[0]} />
										</div>
										<span class="comment-time">{formatRelativeTime(reply.createdAt)}</span>
									</div>
									<div class="comment-content">
										{reply.content}
									</div>
									<div class="comment-actions">
										<div class="vote">
											<button
												class="vote-button"
												class:active={reply.votes?.voters?.[`${$user?.id}`] === 'up'}
												on:click={() => handleVote(reply.id, 'up')}
											>
												<img
													src={reply.votes?.voters?.[`${$user?.id}`] === 'up'
														? 'upvote.png'
														: 'neutralup.png'}
													alt="upvote"
												/>
											</button>
											<p>{(reply.votes?.up || 0) - (reply.votes?.down || 0)}</p>
											<button
												class="vote-button"
												class:active={reply.votes?.voters?.[`${$user?.id}`] === 'down'}
												on:click={() => handleVote(reply.id, 'down')}
											>
												<img
													src={reply.votes?.voters?.[`${$user?.id}`] === 'down'
														? 'downvote.png'
														: 'neutraldown.png'}
													alt="downvote"
												/>
											</button>
										</div>
										{#if $user && reply.author.id === $user.id}
											<button class="delete-button" on:click={() => deleteComment(reply.id)}
												>Delete</button
											>
										{/if}
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		</div>

		{#if totalPages > 1}
			<div class="pagination">
				<button disabled={currentPage === 1} on:click={handlePreviousPage}>Previous</button>
				<span>{currentPage} of {totalPages}</span>
				<button disabled={currentPage === totalPages} on:click={handleNextPage}>Next</button>
			</div>
		{/if}
	{/if}
</div>

<style>
	@import '$lib/css/border.css';

	.comments-container {
		padding: 1rem;
		margin-top: 1rem;
		background: var(--container-background);
	}

	.comment-toggle {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: url('/background.png');
		color: white;
		cursor: pointer;
		margin: 0.5rem 0;
		border: none;
		width: 100%;
	}

	.comment-input-container {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.comment-input-container textarea {
		flex-grow: 1;
		resize: vertical;
		padding: 0.5rem;
		border-radius: 4px;
	}

	.login-prompt {
		text-align: center;
		padding: 0.5rem;
		margin: 0.5rem;
		color: white;
		background: url('/background.png');
	}

	.sort-controls {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.sort-controls button {
		padding: 0.25rem 0.5rem;
		background: none;
		background: url('/background.png');
		filter: brightness(0.75);
		color: white;
	}

	.sort-controls button.active {
		filter: brightness(1);
	}

	.input-wrapper {
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.filter-warning {
		font-size: 0.875rem;
		color: #856404;
		background-color: #fff3cd;
		border: 1px solid #ffe69c;
		border-radius: 4px;
		padding: 0.25rem 0.5rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.filter-warning i {
		color: #856404;
	}

	.input.has-warning {
		border-color: #ffe69c;
	}

	.comment-submit:disabled,
	.reply-button:disabled,
	.delete-button:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.comments-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.comment {
		padding: 1rem;
		background: var(--surface-color-alt);
	}

	.comment-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.comment-author {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.author-name {
		font-weight: 500;
	}

	.comment-time {
		color: gray;
		font-size: 0.875rem;
	}

	.comment-content {
		margin: 0.5rem 0;
		white-space: pre-wrap;
	}

	.comment-actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.5rem;
		align-items: center;
	}

	.comment-submit {
		padding: 0.25rem 0.5rem;
		background: var(--button-background);
		color: white;
		cursor: pointer;
	}

	.comment-submit:hover {
		box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
	}

	.vote {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.vote-button {
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		display: flex;
		align-items: center;
	}

	.vote-button img {
		width: 24px;
		height: 24px;
	}

	.vote-button.active {
		filter: brightness(1.2);
	}

	.vote p {
		margin: 0;
		min-width: 20px;
		text-align: center;
	}

	.reply-button,
	.delete-button {
		padding: 0.25rem 0.5rem;
		background: none;
		border-radius: 4px;
		cursor: pointer;
		border: 1px solid gray;
		border-radius: 5px;
		color: black;
		transition: border 0.2s;
	}

	.reply-button:hover,
	.delete-button:hover {
		border: 1px solid black;
		box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
	}

	.delete-button {
		color: darkred;
	}

	.replies {
		margin-left: 2rem;
		margin-top: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.reply {
		padding: 0.75rem;
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
	}

	.reply-form {
		margin-top: 0.5rem;
		padding-left: 2rem;
	}

	.reply-form textarea {
		width: 100%;
		resize: vertical;
		padding: 0.5rem;
		border-radius: 4px;
	}

	.reply-actions {
		display: flex;
		gap: 0.5rem;
		justify-content: flex-end;
		margin-top: 0.5rem;
	}

	.pagination {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1rem;
		margin-top: 1rem;
		padding-top: 1rem;
	}

	.pagination button {
		padding: 0.25rem 0.5rem;
		background: url('/background.png');
		color: white;
		cursor: pointer;
	}

	.pagination button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem;
	}

	.spinner {
		font-size: 2rem;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	.no-comments {
		text-align: center;
		padding: 2rem;
	}
</style>
