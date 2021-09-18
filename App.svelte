<script>
    import { items } from "./store"
    import { Modal } from "svelte-chota"
    import Card from "./Card.svelte"
    import { data } from "./dummyData"

    const DEV = false

    let ENV = {}
    const ALL = "🌌 Todo"
    let category = ALL
    let categories = []
    let welcome = true
    let checkout = 0
    let nombre = ""

    $: filtered =
        category == ALL
            ? $items
            : $items.filter((e) => e.categoria === category)
    $: favs = $items.filter((e) => e.fav)
    $: total = favs
        .map((e) => (typeof e.precio == "number" ? e.precio : 0))
        .reduce((a, b) => a + b, 0)
    $: listado = `Hola! Soy ${nombre}. Estuve chusmeando tu Super Venta y me gustó lo siguiente:

${favs.map((e) => e.nombre + "\t\t $" + e.precio).join("\n")}

Total: $${total}`

    $: waref = `https://wa.me/${ENV.WA_NUMBER}?text=${encodeURI(listado)}`
    $: mailref = `mailto:${ENV.EMAIL}?subject=${encodeURI(`[Super Venta] Listado de ${nombre}`)}&body=${encodeURI(listado)}`

    function setData(data) {
        categories = [ALL, ...new Set(data.map((e) => e.categoria))]
        items.set(data)
    }

    async function fetchData() {
        const res = await fetch(ENV.API)
        if (res.ok)
            try {
                const data = await res.json()
                setData(data.products.filter(el => el.desc && el.foto))
            } catch (err) {}
    }

    DEV ? setData(data) : fetchData()

</script>

<main>
    <Modal class="card modal"
        bind:open={welcome}
        on:keydown={e =>['Escape'].includes(e.key) && (welcome = false)}
    >
        <h2 class="textc">🎊 Super Venta de Ale y Caro 🎉</h2>
        <h4 class="textc">Hola! 👋</h4>
        <p>
            Estamos haciendo limpieza y tenemos varias cosas
            que te pueden llegar a interesar...
        </p>

        <hr>

        <h4 class="textc">📋 Instrucciones</h4>
        <ol>
            <li>👀 Chusmeá lo que tenemos <small>(clickeá las fotos)</small></li>
            <li>❤️ favoriteá lo que te guste</li>
            <li>Dale al <span class="button bg-primary">👍 Listo!</span> <small>(abajo a la derecha)</small>
            para mandarnos tu listado por whatsapp o mail y luego poder coordinar la venta</li>
        </ol>
        <p class="small">
            Aceptamos <b>efectivo</b>, <b>transferencia</b> o podemos hacerte un <b>link de mercadopago</b>
            para que puedas usar el medio de pago que prefieras.
        </p>
        <p class="small">
            Los productos se retiran por <b>Villa Urquiza (CABA)</b>, zona Av. Congreso y Av. Constituyentes.
            También podemos coordinar envío de paquetes no demasiado grandes.
        </p>

        <hr>

        <p class="textc">Esperamos que encuentres algo de tu agrado! 😊</p>
        <div class="spaced controls">
            <button class="bg-primary"
                tabindex="0"
                on:click={(e) => (welcome = false)}>👀 A chusmear!</button>
        </div>
    </Modal>

    <Modal class="card modal"
        bind:open={checkout}
        on:keydown={e =>['Escape'].includes(e.key) && (checkout = 0)}
    >
        {#if !favs.length}
        <div class="compact textc msg">
            <h1>😅</h1>
            <h4>Aún no favoriteaste nada...</h4>
            <p>Cuando encuentres algo que te guste, clickeá el ❤️!</p>
            <button class="bg-primary" on:click={() => (checkout = 0)}>OK</button>
        </div>
        {/if}

        {#if favs.length && checkout == 1}
            <h3>Estos son tus favoritos</h3>
            <table>
                <thead><tr><th>Nombre</th><th>Precio</th></tr></thead>
                <tbody>
                    {#each favs as item}
                        <tr><td>{item.nombre}</td><td>$ {item.precio}</td></tr>
                    {/each}
                </tbody>
                <tfoot><tr class="bold"><td>Total:</td><td>$ {total}</td></tr></tfoot>
            </table>
            <div class="spaced controls">
                <button class="bg-primary"
                    on:click={() => (checkout = 2)}>👌 Perfecto, ya estoy</button>
                <button on:click={() => (checkout = 0)}>👀 Seguir chusmeando</button>
            </div>
        {/if}

        {#if favs.length && checkout == 2}
            <h3>Mandanos tu listado!</h3>
            <p>1. Ingresá tu nombre: <input type="text" bind:value={nombre} /></p>
            {#if nombre}
                <p>2. Elegí el medio de contacto que prefieras:</p>
                <div class="spaced controls">
                    <a href={waref} class="textc">
                        <img height="100%"
                            src="https://image.flaticon.com/icons/png/128/1384/1384055.png"
                            alt="Whatsapp">
                        <div>Whatsapp</div>
                    </a>
                    <a href={mailref} class="textc">
                        <img height="100%"
                            src="https://image.flaticon.com/icons/png/128/893/893257.png"
                            alt="Email">
                        <div>Email</div>
                    </a>
                </div>
                <hr>
                <div class="compact textc">
                    <h1>😃</h1>
                    <h3>Gracias por tu tiempo!</h3>
                    <p>Te responderemos a la brevedad</p>
                </div>
            {/if}
        {/if}
    </Modal>

    <div class="wrap controls">
        <div class="hide-phone">Categorias:</div>
        {#each categories as cat}
            <button
                class={category == cat ? "bg-primary" : ""}
                on:click={() => (category = cat)}>{cat}</button
            >
        {/each}

        <button class="contact scale bg-primary"
            on:click={() => (checkout = 1)}
        >👍 Listo!</button>
    </div>

    <div class="content">
        {#each filtered as d}
            <Card data={d}/>
        {/each}
    </div>
</main>

<style>

    main {
        padding: 4rem;
        padding-top: 0 !important;
    }

    .content {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
        grid-gap: 2rem;
    }

    .contact {
        position: fixed;
        bottom: 0;
        right: 0;
        z-index: 1;
    }

    .msg {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        height: 20rem;
        margin: auto;
    }

    table {
        margin-bottom: 1rem;
    }
    thead,
    tbody,
    tfoot {
        display: block;
    }
    tbody {
        overflow-y: scroll;
        max-height: calc(100vh - 37rem);
    }
    thead th:nth-child(1),
    tbody td:nth-child(1),
    tfoot td:nth-child(1) {
        width: 20rem;
    }

    .compact > h1,
    .compact > h3,
    .compact > h4,
    .compact > p {
        margin: 0;
    }

    p.small {
        font-size: 1.25rem;
    }

    @media (max-width: 900px) {
        :global(.modal) {
            width: 80vw;
        }

        main {
            padding: 2rem;
        }

        .content {
            grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
            grid-gap: 1.5rem;
        }
    }

    @media (max-width: 500px) {
        :global(.modal) {
            height: 100vh;
            width: 100vw;
        }

        main {
            padding: 1rem;
        }

        .content {
            grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
            grid-gap: 1rem;
        }

        .hide-phone {
            display: none;
        }
    }

</style>
