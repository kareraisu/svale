<script>
	import { items } from "./store"
	import { Modal } from "svelte-chota"

	export let data

	let detail = false

	const toggleFav = (e) => {
		data.fav = !data.fav
		const i = $items.findIndex((e) => e.nombre == data.nombre)
		$items[i] = data
		setTimeout(() => {
			detail = false
		}, 250)
	}

</script>

<div
	tabindex="0"
	class="thumb card scale"
	on:click={(e) => (detail = true)}
	on:keydown={(e) => ["Enter", "Space"].includes(e.key) && (detail = true)}
	style={`background-image: url(${data.thumb})`}
>
	{#if data.fav}
		<div class="faved">💖</div>
	{/if}
	<div class="on-hover title">{data.nombre}</div>
	<div class="on-hover tag">$ {data.precio}</div>
</div>

<Modal
	class="card modal"
	bind:open={detail}
	on:keydown={(e) => ["Escape"].includes(e.key) && (detail = false)}
>
	<h4>{data.nombre}</h4>
	<div class="flex">
		<a href={data.foto} target="_blank">
			<div  class="img"
				style={`background-image: url(${data.thumb})`}>
			</div>
		</a>
		<div class="text">
			<p class="desc">{data.desc}
				{#if data.link}
					<br><br> <a href={data.link} target="_blank">🔗 Más info</a>
				{/if}
			</p>
			
			<hr />
			<div style="text-align: center">
				<div class="tag">{data.estado}</div>
				<div class="price">$ {data.precio}</div>
			</div>
			<hr />
			<div class="spaced controls">
				<button class="fav" on:click={toggleFav}
					>{data.fav ? "💖" : "❤️"}</button
				>
				<button class="done" on:click={(e) => (detail = false)}
					>👀 Seguir chusm eando</button
				>
			</div>
		</div>
	</div>
</Modal>

<style>
	.thumb {
		position: relative;
		height: 20rem;
		background-position: center;
		background-repeat: no-repeat;
		background-size: cover;
	}
	/* .thumb:hover::before,
	.thumb:focus::before {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		width: 100%;
		background-image: linear-gradient(
			#000a,
			transparent,
			transparent,
			#000a
		);
	} */
	.thumb .title {
		color: var(--color-white);
		font-size: 2.5rem;
		text-shadow: 0 0 4px black;
	}
	.thumb .tag {
		position: absolute;
		bottom: 0;
		right: 0;
		margin: 2rem;
		color: var(--color-white);
		background: var(--color-primary);
		text-shadow: 0 0 4px black;
		box-shadow: 0 0 4px black;
	}

	.card {
		position: relative;
		cursor: pointer;
		transition: transform 0.2s;
	}
	.flex {
		height: 88%;
	}
	.flex > * {
		flex-basis: 50%;
	}
	.desc {
		height: 40%;
		overflow: auto;
		font-size: 1.5rem;
    	line-height: 1.4;
		white-space: break-spaces;
	}
	.fav {
		background-color: transparent;
		font-size: 3rem;
	}
	.fav,
	.done {
		width: 120px;
	}
	.faved {
		position: absolute;
		right: 1.5rem;
		font-size: 2.5rem;
	}

	.img {
		height: 100%;
		background-position: center;
		background-repeat: no-repeat;
		background-size: contain;
		background-color: var(--color-lightGrey);
		cursor: zoom-in;
	}
	.text {
		margin-left: 2.5rem;
	}
	.price {
		font-size: 2.5rem;
	}

	.on-hover {
		opacity: 0;
		transition: opacity 0.2s;
	}
	*:hover .on-hover,
	*:focus .on-hover {
		opacity: 1;
	}

	@media (max-width: 500px) {
		.thumb {
			height: 10rem;
		}
		.flex {
			flex-wrap: wrap;
		}
		.text {
			margin-left: 0;
			margin-top: 2.5rem;
		}
	}
</style>
