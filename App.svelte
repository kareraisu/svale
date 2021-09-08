<script>
  import { items } from "./store";
  import { Modal } from "svelte-chota";
  import Card from "./Card.svelte";
  import { data } from "./dummyData";
  import ENV from './.env';

  const DEV = true;
  const ALL = "Todo";
  let category = ALL;
  let categories = [];
  let welcome = true;
  let checkout = 0;
  let nombre = "";

  $: filtered =
    category == ALL ? $items : $items.filter(e => e.categoria === category);
  $: favs = $items.filter(e => e.fav);
  $: total = favs
    .map(e => (typeof e.precio == "number" ? e.precio : 0))
    .reduce((a, b) => a + b, 0);
  $: listado =
    `A ${nombre} le gustó lo siguiente: /n/n` +
    favs.map(e => e.nombre + " " + e.precio).join("/n") +
    "/n/nTotal: " +
    total;
  $: waref = `https://wa.me/${ENV.WA}?text=${encodeURI(listado)}`;
  $: mailref = `mailto:${ENV.MAIL}?subject=${encodeURI(
    `[Super Venta] Listado de ${nombre}`
  )}&body=${encodeURI(listado)}`;

  function setData(data) {
    categories = [ALL, ...new Set(data.map(e => e.categoria))];
    items.set(data);
  }

  async function fetchData() {
    const res = await fetch(ENV.API);
    if (res.ok)
      try {
        const data = await res.json();
        setData(data.products);
      } catch (err) {}
  }

  DEV ? setData(data) : fetchData();
</script>

<style>
  @import "https://unpkg.com/chota@latest";

  :global(:root) {
    --bg-color: #222;
    --bg-secondary-color: #f3f3f6;
    --color-primary: #14854f;
    --color-lightGrey: #d2d6dd;
    --color-grey: #747681;
    --color-darkGrey: #3f4144;
    --color-error: #d43939;
    --color-success: #28bd14;
    --grid-maxWidth: 120rem;
    --grid-gutter: 2rem;
    --font-size: 1.8rem;
    --font-color: #333333;
    --font-family-sans: sans-serif;
    --font-family-mono: monaco, "Consolas", "Lucida Console", monospace;
  }
  :global(hr) {
    background-color: var(--color-darkGrey);
    height: 1.5px;
    margin: 2.5rem auto;
    width: 90%;
  }
  :global(.modal) {
    min-width: 600px !important;
    padding: 4rem;
  }
  :global(.scale:hover) {
    transform: scale(1.05);
  }
  :root {
    font-size: 12px;
  }

  main {
    padding: 3rem;
  }

  .content {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-gap: 2.5rem;
  }

  .controls {
    display: flex;
    align-items: center;
    margin: 20px 0;
  }
  .controls > * {
    margin-right: 15px;
  }
  .contact {
    position: fixed;
    bottom: 0;
    right: 0;
    z-index: 1;
  }
  thead,
  tbody,
  tfoot {
    display: block;
  }
  tbody {
    overflow-y: scroll;
    max-height: 200px;
  }
  thead th:nth-child(1),
  tbody td:nth-child(1),
  tfoot td:nth-child(1) {
    width: 400px;
  }
</style>

<main>

  <Modal bind:open={welcome} class='card modal'>
    <h1>Super Venta de Ale y Caro</h1>
    <h4>Bienvenide!<br>
    Estamos haciendo limpieza y tenemos varias cosas que te pueden llegar a interesar...
    </h4>

    <h4>Instrucciones</h4>
    <ol>
      <li>Chusmeá lo que tenemos (podés clickear las tarjetas para ver más detalles).</li>
      <li>Favoriteá lo que te guste (dale al 🤍 en el detalle de una tarjeta).</li>
      <li>Una vez que termines, dale al 'Listo!' abajo a la derecha.</li>
    </ol>

    <p>Esperamos que encuentres algo de tu agrado!</p>
    <button on:click={e => welcome = false}>A chusmear!</button>
  </Modal>

  <Modal bind:open={checkout} class='card modal'>

  {#if checkout == 1}
    <h3>Esto es lo que favoriteaste:</h3>
<table>
<thead><tr><th>Nombre</th><th>Precio</th></tr></thead>
<tbody>
    {#each favs as item}
  <tr><td>{item.nombre}</td><td>$ {item.precio}</td></tr>
    {/each}
    </tbody>
    <tfoot><tr><td>Total:</td><td>$ {total}</td></tr></tfoot>
</table>
<button on:click={e => checkout = 2}		>Sip, ya estoy</button>
<button on:click={e => checkout = 0}		>Seguir chusm eando</button>
{/if}

  {#if checkout == 2}
    <p>Ingresa tu nombre y elegí el medio de contacto que prefieras:</p>
    <input type="text" bind:value={nombre}/>
    <a class='button' href={waref}      >Whatsapp</a>
    <a class='button' href={mailref}      >Email</a>
    {/if}
  </Modal>

  <div class='controls'>
    <div>Categorias:</div>

      {#each categories as cat}
      <button
        class={category == cat ? 'bg-primary' : ''}
        on:click={e => category = cat}
                  >{cat}</button>
      {/each}

      <button class='contact scale'
      on:click={e => checkout = 1}
      >Listo!</button>
  </div>

  <div class='content'>
  {#each filtered as d}
    <Card data={d}  />
    {/each}
  </div>

</main>