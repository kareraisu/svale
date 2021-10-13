<script>
    import { items, modals } from "./store"
    import { Button, Modal, Icon } from "svelte-chota"

    let ENV = {}
    const API = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTnow5FsrJH_liAk7Pw6JjjLxAGAibMSeM7wmA17eNcbjYUOIPpkW_MjD0SjhTrxLzGtAPN-cTcpPjC/pub?gid=0&single=true&output=tsv'
    const thepass = 'alohomora'
    let pass = location.hash.substr(1)
    let darkTheme = true
    const ALL = "🌌 Todo"
    let category = ALL
    let categories = []
    let itemProps = []
    let currentItem = {}
    let nombre = ""

    $modals.welcome = true
    $modals.detail = false
	$modals.tip = false
    $modals.checkout = 0

    $: valid = pass && (pass.toLowerCase() === thepass)
    $: valid && fetchData()
    $: filtered =
        category == ALL
            ? $items
            : $items.filter((e) => e.categoria === category)
    $: favs = $items.filter((e) => e.fav)
    $: total = favs
        .map((e) => { try { return parseInt(e.precio) } catch(err) { return 0 } })
        .reduce((a, b) => a + b, 0)
    $: listado = `Hola! Soy ${nombre}. Estuve chusmeando tu Super Venta y me gustó lo siguiente:

${favs.map((e) => e.nombre + "\t\t $" + e.precio).join("\n")}

Total: $${total}`

    $: waref = `https://wa.me/${ENV.WA_NUMBER}?text=${encodeURI(listado)}`
    $: mailref = `mailto:${ENV.EMAIL}?subject=${encodeURI(`[Super Venta] Listado de ${nombre}`)}&body=${encodeURI(listado)}`
    $: $modals.detail = currentItem.nombre

    function setData(data) {
        data = data.split(/\r\n/).map(row => row.split(/\t/))
        itemProps = data.shift()
        data = data
            .map(createItem)
            .filter(el => el.desc && el.fotos && el.precio && !el.interesade)
            console.log('Loaded product data:', data)
        categories = [ALL, ...new Set(data.map((e) => e.categoria))]
        items.set(data)
    }

    function createItem(data) {
        const item = Object.fromEntries( zip(itemProps, data) )
        item.desc = item.desc
            .replace(new RegExp('  ', 'g'), '\n\n')
            .replace(new RegExp(' •', 'g'), '\n•')
        item.fotos = item.fotos && item.fotos.trim().split(', ').map(f => f.split(' '))
        return item
    }

    function zip(...arrays) {
        const length = Math.min(...arrays.map(arr => arr.length))
        return Array.from({ length }, (_, index) => arrays.map((array => array[index])))
    }

    async function fetchData() {
        const res = await fetch(API)
        if (res.ok)
            try {
                const data = await res.text()
                setData(data)
            } catch (err) {
                console.error('Failed to fetch data')
            }
    }

    function toggleTheme() {
        const light = {
            'bg-color': 'color-white',
            'font-color': 'color-black',
        }
        const dark = {
            'bg-color': 'color-darkGrey',
            'font-color': 'color-white',
        }
        darkTheme = !darkTheme
        const theme = darkTheme ? dark : light
        for (let prop of Object.keys(theme)) {
            document.documentElement.style.setProperty('--' + prop, `var(--${theme[prop]})`)
        }
    }

	function toggleFav(e) {
		currentItem.fav = !currentItem.fav
		const i = $items.findIndex((e) => e.nombre == currentItem.nombre)
		$items[i] = currentItem
		setTimeout(() => {
			$modals.detail = false
		}, 250)
	}

    window.addEventListener('popstate', function() {
        const openModals = Object.values($modals).some(v => v)
            
        if (openModals) {
            // close all modals
            $modals = Object.fromEntries( Object.entries($modals).map(([k]) => [k,false]) )
            // deactivate back navigation
            history.pushState(null, document.title, location.href)
        }
    })

</script>



{#if !valid}
    <div class="gate">
        <img src="gate.jpg" alt="Puertas de Moria">
        <h3>Escribe, amigo, y entra</h3>
        <input bind:value={pass}>
    </div>
{:else}
<main class="rel">
    <div class="categories flex wrap">
        {#each categories as cat}
            <Button
                primary={category == cat}
                outline={category != cat}
                on:click={() => (category = cat)}>
                { cat.split(' ')[0] } <span class="hide-phone">{ cat.split(' ')[1] }</span>
            </Button>
        {/each}

        <div class="abs click theme" on:click={toggleTheme}>{ darkTheme ? '☀️' : '🌑' }</div>

        <button class="button contact scale bg-primary"
            on:click={() => ($modals.checkout = 1)}
        >👍 Listo!</button>
    </div>

    <div class="content">
        {#each filtered as item}
        <div
            tabindex="0"
            class="thumb card scale"
            on:click={(e) => (currentItem = item)}
            on:keydown={(e) => ["Enter", "Space"].includes(e.key) && (currentItem = item)}
            style={`background-image: url(${item.fotos[0][1]})`}
        >
            {#if item.fav}
                <div class="faved">💖</div>
            {/if}
            <div class="on-hover title">{item.nombre}</div>
            <div class="on-hover tag">$ {item.precio}</div>
        </div>
        {/each}
    </div>

    <p class="abs bottom small m0">favicon by <a href="http://www.dariusdan.com" target="_blank" title="Darius Dan">Darius Dan</a></p>

    <Modal
        class="card modal"
        bind:open={$modals.detail}
        on:keydown={(e) => ["Escape"].includes(e.key) && ($modals.detail = false)}
    >
        <h4>{currentItem.nombre}</h4>
        <div class="flex detail">
            <div class="slider">
                {#each currentItem.fotos as foto}
                    <a href={foto[0]}
                        target="_blank"
                        class="img"
                        style={`background-image: url(${foto[1]})`}
                    > </a>
                {/each}
            </div>
            <div class="text">
                <p class="small desc">{currentItem.desc}
                    {#if currentItem.link}
                        <br><br> <a href={currentItem.link} target="_blank">🔗 Más info</a>
                    {/if}
                </p>
                
                <hr />
                <div style="text-align: center">
                    <div class="tag">
                        {currentItem.estado}
                    </div>
                    <Icon on:click={() => $modals.tip = true}
                        src='https://icongr.am/clarity/help.svg'
                        size='2rem'
                        class='click'
                    />
                    <div class="price">$ {currentItem.precio}</div>
                </div>
                <hr />
                <div class="spaced controls">
                    <button class="button outline"
                        on:click={(e) => ($modals.detail = false)}
                    >
                        👀 Seguir chusmeando
                    </button>
                    <button class="bg-primary fav"
                        on:click={toggleFav}
                    >
                        {currentItem.fav ? "💖" : "❤️"}
                    </button>
                </div>
            </div>
        </div>
    </Modal>

    <Modal
        class="small card modal"
        bind:open={$modals.tip}
        on:keydown={(e) => ["Escape"].includes(e.key) && ($modals.tip = false)}
    >
        <h4 class="textc">Estado de los productos</h4>
        <p class="small" style="line-height: 2.5;">
            <span class="tag">Nuevo</span> : casi sin uso, perfecto estado <br>
            <span class="tag">Como nuevo</span> : usado, perfecto estado <br>
            <span class="tag">Usado</span> : usado, con signos de uso
        </p>
        <div class="textc">
            <Button primary on:click={(e) => ($modals.tip = false)}>OK</Button>
        </div>
    </Modal>

    <Modal class="card modal"
        bind:open={$modals.welcome}
        on:keydown={e =>['Escape'].includes(e.key) && ($modals.welcome = false)}
    >
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

        <hr>

        <p class="small">
            Aceptamos <b>efectivo</b>, <b>transferencia</b> o podemos hacerte un <b>link de mercadopago</b>
            para que puedas usar el medio de pago que prefieras.
        </p>
        <p class="small">
            Los productos se retiran por <b>Villa Urquiza (CABA)</b>, zona Av. Congreso y Av. Constituyentes.
            Podemos coordinar envío de paquetes no demasiado grandes.
        </p>

        <hr>

        <p class="textc">Esperamos que encuentres algo de tu agrado! 😊</p>
        <div class="spaced controls">
            <Button primary
                tabindex="0"
                on:click={(e) => ($modals.welcome = false)}>👀 A chusmear!</Button>
        </div>
    </Modal>

    <Modal class="small card modal"
        bind:open={$modals.checkout}
        on:keydown={e =>['Escape'].includes(e.key) && ($modals.checkout = 0)}
    >
        {#if !favs.length}
        <div class="compact textc">
            <h1>😅</h1>
            <h4>Aún no favoriteaste nada...</h4>
            <p>Cuando encuentres algo que te guste, clickeá el ❤️!</p>
            <button class="bg-primary"
                style="margin-top: 2rem;"
                on:click={() => ($modals.checkout = 0)}
            >OK</button>
        </div>
        {:else}

        {#if $modals.checkout == 1}
        <div class="textc">
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
                <button class="button outline"
                    on:click={() => ($modals.checkout = 0)}
                >👀 Seguir chusmeando</button>
                <button class="bg-primary"
                    on:click={() => ($modals.checkout = 2)}
                >👌 Perfecto, ya estoy</button>
            </div>
        </div>
        {/if}

        {#if $modals.checkout == 2}
        <div class="textc">
            <h3>Mandanos tu listado!</h3>
            <p>
                <label for="name">1. Ingresá tu nombre:</label>
                <input id="name" class="name"
                    bind:value={nombre}
                    on:keydown={ev => (ev.key == 'Enter') && (nombre.length >= 3) && ($modals.checkout = 3)}
                />
                <button
                    class={nombre.length >= 3 ? 'bg-primary' : ''}
                    disabled={nombre.length < 3}
                    on:click={() => $modals.checkout = 3}
                >OK</button>
            </p>
        </div>
        {/if}

        {#if $modals.checkout == 3}
        <div class="textc">
            <h3>Mandanos tu listado!</h3>
            <p>2. Elegí un medio de contacto:</p>
            <div class="spaced controls">
                <a href={waref} class="textc"
                    on:click={() => $modals.checkout = 4}>
                    <img height="100%"
                        src="https://image.flaticon.com/icons/png/128/1384/1384055.png"
                        alt="Whatsapp">
                    <div>Whatsapp</div>
                </a>
                <a href={mailref} class="textc"
                    on:click={() => $modals.checkout = 4}>
                    <img height="100%"
                        src="https://image.flaticon.com/icons/png/128/893/893257.png"
                        alt="Email">
                    <div>Email</div>
                </a>
            </div>
        </div>
        {/if}

        {#if $modals.checkout == 4}
        <div class="textc compact">
            <h1>😃</h1>
            <h3>Gracias por tu tiempo!</h3>
            <p>Te responderemos a la brevedad</p>
        </div>
        {/if}
        {/if}
    </Modal>
</main>
{/if}


<style>

    .gate {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
    }

    main {
        display: flex;
        flex-direction: column;
        height: 100vh;
        padding: 2rem 4rem 5rem 4rem;
    }

    .content {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
        grid-gap: var(--space);
        margin-top: var(--space);
        overflow-x: hidden;
        overflow-y: auto;
    }

    .contact {
        position: fixed;
        bottom: 0;
        right: 0;
        margin: var(--space);
        z-index: 1;
        font-size: 2rem;
    }

    .theme {
        right: var(--d-space);
        font-size: 3rem;
    }

    table {
        margin-bottom: var(--h-space);
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

    .name {
        width: 50% !important;
        margin: auto;
        margin-bottom: 1rem;
    }

    .thumb {
		position: relative;
		height: 20rem;
		background-position: center;
		background-repeat: no-repeat;
		background-size: cover;
	}
	.thumb .title {
		color: var(--color-white);
		font-size: calc(var(--font-size) * 1.2);
		line-height: 1.2;
		text-shadow: 0 0 4px black;
	}
	.thumb .tag {
		position: absolute;
		bottom: 0;
		right: 0;
		margin: var(--space);
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

    .detail {
        height: 88%;
    }

	.slider {
		flex-basis: 70%;
	}

	.text {
		flex-basis: 30%;
	}
	.desc {
		height: 40%;
		overflow: auto;
		white-space: break-spaces;
	}
	.controls > button {
        height: 80px;
		width: 140px;
        padding: 1rem 1.5rem;
	}
	.fav {
		background-color: transparent;
		font-size: 3rem;
	}
	.faved {
		position: absolute;
		right: 1.5rem;
		font-size: 2.5rem;
	}

	.img {
		width: 100%;
		background-position: center;
		background-repeat: no-repeat;
		background-size: cover;
		background-color: var(--bg-color);
		cursor: zoom-in;
	}
	.text {
		margin-left: 2.5rem;
	}
	.price {
		font-size: 3rem;
	}

	.on-hover {
		opacity: 0;
		transition: opacity 0.2s;
	}
	*:hover > .on-hover,
	*:focus > .on-hover {
		opacity: 1;
	}
    @media (max-width: 900px) {

        main {
            padding: 2rem 2rem 4rem 2rem;
        }

        .content {
            grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
        }
    }

    @media (max-width: 500px) {

        main {
            padding: 1rem 1rem 3rem 1rem;
        }

        .content {
            grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
        }

        .theme {
            position: fixed;
            bottom: 0;
            left: var(--space);
            right: initial;
            z-index: 1;
        }

        .hide-phone {
            display: none;
        }

        .thumb {
			height: 10rem;
		}
		.flex {
			flex-wrap: wrap;
		}
        .detail {
            height: auto;
        }
		.detail > * {
			flex-basis: 100%;
			height: 50%;
            min-height: 200px;
		}
		.text {
			margin-left: 0;
			margin-top: var(--space);
		}
    }

</style>
