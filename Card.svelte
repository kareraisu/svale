<script>
	import { items } from './store'
	import { Modal } from "svelte-chota";

	export let data;

	let detail = false;

	const toggleFav = e => {
		data.fav = !data.fav
		const i = $items.findIndex(e => e.nombre == data.nombre)
		$items[i] = data
	}

	</script>

<style>
.thumb {
	height: 20rem;
	width: 20rem;
	background-repeat: no-repeat;
	background-size: cover;
}
	.card {
	  position: relative;
	  cursor: pointer;
	  transition: transform 0.2s;
	}
	.fav,
	.faved {
	  font-size: 3rem;
	  background-color: transparent;
	}
	.faved {
		position: absolute;
	  right: 0;
	  font-size: 2rem;
	}

	.fav:hover {
	  font-size: 3.5rem;
	}
	.img {
		height: calc(100vh - 200px);
	}
	.text {
		margin-left: 2rem;
	}
	.price {
		font-size: 2.5rem;
	}
	.flex {
		display: flex;
	}
	.on-hover {
		opacity: 0;
		transition: opacity .2s;
	}
	*:hover .on-hover {
		opacity: 1;
	}
</style>

<div class="thumb card scale"
	on:click={e => detail = true}
	style={`background-image: url(${data.thumb})`}
>
{#if data.fav}
<button class="faved">❤️</button>
{/if}
	<h4 class="on-hover">{data.nombre}</h4>
	<div class="on-hover tag">$ {data.precio}</div>
</div>

<Modal bind:open={detail} class='card modal'>
	<h4>{data.nombre}</h4>
	<div class="flex">
		<img class='img' src={data.foto} alt={data.nombre}/>
		<div class='text'>
			<p>{data.desc}</p>
			<hr/>
			<div style='text-align: center'>
				<div class="tag">{data.estado}</div>
				<div class='price'>$ {data.precio}</div>
			</div>
			<hr/>
			<div class='flex'>
			<button class='fav'
		on:click={toggleFav}
	>{data.fav ? '❤️' : '🤍'}</button>
		<button on:click={e => detail = false}
		>Seguir chusm eando</button>
		</div>
		</div>
	</div>
</Modal>
