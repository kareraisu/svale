<script>
    import { items, modals } from "./store"
    import { Button, Modal, Icon } from "svelte-chota"
    import mock from './mocks'

    // USE THIS TO SWITCH ENV VARS AND MOCK CONFIG
    //import LOCAL_ENV from '../.env'
    const dev = false

    let ENV = {}
    let API = {}
    let loading = true
    let welcomed = false
    let config
    let publish
    const thepass = 'YWxvaG9tb3Jh'
    let pass = location.hash.substr(1)
    let darkTheme = false
    const ALL = "🌌 Todo"
    let category = ALL
    let categories = []
    let itemProps = []
    let currentItem = {}
    let nombre = ""
    let currentPic = 0
    let slider

    $modals.welcome = true
    $modals.detail = false
	$modals.tip = false
    $modals.checkout = 0

    $: valid = pass && (pass.toLowerCase() === atob(thepass))
    $: $modals.welcome = !welcomed
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

    init()

    async function init() {
        applyTheme()
        await loadEnv()
        // await fetchRate()
        await fetchData()
        checkWelcome()
        loading = false
    }

    async function loadEnv() {
        if (dev) {
            // Cannot use this cause seems that rollup checks dynamic imports
            // while bundling and chokes if it cannot resolve them
            // (even if try-catching and even if code is unreachable)
            // ENV = (await import('../.env')).default
            
            ENV = LOCAL_ENV
            console.log('Loaded dev env:', ENV)
        }
        API = {
            data: `https://docs.google.com/spreadsheets/d/e/${ENV.SHEET_ID}/pub?gid=0&single=true&output=tsv`,
            config: `https://docs.google.com/spreadsheets/d/e/${ENV.SHEET_ID}/pub?gid=435559156&single=true&output=tsv`,
            xrate: ENV.XRATE_URL, // not used ATM
        }
        dev ? setConfig(mock.config) : await fetchConfig()
    }

    function checkWelcome() {
        welcomed = localStorage.getItem('welcomed')
        if (!welcomed) {
            localStorage.setItem('welcomed', true)
        }
    }

    async function fetchConfig() {
        console.log('Fetching config...')
        try {
            const res = await fetch(API.config)
            if (!res.ok) throw 'Res not ok'
            const data = await res.text()
            await setConfig(data)
        } catch (err) {
            console.error('Failed to fetch config')
        }
    }

    /**
     * Not used ATM
     */
    async function fetchRate() {
        console.log('Fetching currency exchange rate...')
        try {
            const res = await fetch(API.xrate)
            if (!res.ok) throw 'Res not ok'
            const data = await res.text()
            setRate(data)
        } catch (err) {
            console.error('Failed to fetch exchange rate:', err)
            console.warn('Falling back to config rate:', config.xrate)
            xrate = config.xrate
        }
    }

    async function fetchData() {
        console.log('Fetching product data...')
        try {
            const res = await fetch(API.data)
            if (!res.ok) throw 'Res not ok'
            const data = await res.text()
            setData(data)
        } catch (err) {
            console.error('Failed to fetch product data')
        }
    }

    async function setConfig(data) {
        const rows = data.split(/\n/).map(row => row.split(/\t/).map(v => v.trim()))
        config = Object.fromEntries( zip(...rows) )
        console.log('Loaded config:', config)
        publish = !!config.publish
    }

    /**
     * This expects `data` to be a webpage,
     * it parses the html, selects a known node and extracts the price from it
     * */ 
    function setRate(data) {
        const parser = new DOMParser()
        const doc = parser.parseFromString(data, 'text/html')
        let price = doc.querySelector(ENV.XRATE_DOM_PATH).textContent.replace('$', '')
        config.xrate = parseInt(price)
        console.log('Loaded exchange rate:', config.xrate)
    }

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
        item.precio = Math.floor( Number(item.price) * Number(config.xrate) )
        return item
    }

    function zip(...arrays) {
        const length = Math.min(...arrays.map(arr => arr.length))
        return Array.from({ length }, (_, index) => arrays.map((array => array[index])))
    }
    

    function toggleTheme() {
        darkTheme = !darkTheme
        applyTheme()
    }

    function applyTheme() {
        const light = {
            'bg-color': 'color-white',
            'font-color': 'color-black',
        }
        const dark = {
            'bg-color': 'color-darkGrey',
            'font-color': 'color-white',
        }
        const theme = darkTheme ? dark : light
        for (let prop of Object.keys(theme)) {
            document.documentElement.style.setProperty('--' + prop, `var(--${theme[prop]})`)
        }
    }

	function toggleFav(item = currentItem) {
		item.fav = !item.fav
		const i = $items.findIndex((e) => e.nombre == item.nombre)
		$items[i] = item
		setTimeout(() => {
			$modals.detail = false
		}, 250)
	}

    function closeModals(noBackNav) {
        const openModals = Object.values($modals).some(v => v)
            
        if (openModals) {
            // close all modals
            $modals = Object.fromEntries( Object.entries($modals).map(([k]) => [k,false]) )
            // reset currentPic
            currentPic = 0
            // deactivate back navigation
            if (noBackNav) history.pushState(null, document.title, location.href)
        }
    }

    function nextPic() {
        if (currentPic >= currentItem.fotos.length -1) return
        currentPic++
        slider.scrollTo({left: slider.offsetWidth * currentPic})
    }

    function prevPic() {
        if (currentPic <= 0) return
        currentPic--
        slider.scrollTo({left: slider.offsetWidth * currentPic})
    }

    window.addEventListener('keydown', (e) => e.key === 'Escape' && closeModals(true))

    window.addEventListener('popstate', () => closeModals(true))

</script>

{#if loading}
    <div class="gate">
        <i class="huge cog">⚙️</i>
        <h1>Cargando...</h1>
    </div>
{:else if !publish || !config.xrate || !$items.length}
    <div class="gate">
        <i class="huge">😅</i>
        <h2>Disculpa... <br> Estamos actualizando nuestro catálogo</h2>
        <h3>Por favor, volvé en un par de días!</h3>
    </div>
{:else if !valid}
    <div class="gate">
        <img src="img/gate.jpg" alt="Puertas de Moria">
        <h3>Escribe, amigo, y entra</h3>
        <input bind:value={pass}>
    </div>
{:else}
<main class="flex center">
    <div class="layout">
    <div class="categories flex wrap">
        {#each categories as cat}
            <Button
                primary={category == cat}
                outline={category != cat}
                on:click={() => (category = cat)}>
                { cat.split(' ')[0] } <span class="hide-phone">{ cat.split(' ')[1] }</span>
            </Button>
        {/each}

        <div class="flex actions">
            <div class="click theme" on:click={toggleTheme}>{ darkTheme ? '☀️' : '🌑' }</div>
            <div class="click help" on:click={() => $modals.welcome = true}>📋</div>
        </div>

        <button class="abs bottom right button done scale bg-primary"
            on:click={() => ($modals.checkout = 1)}
        >👍 Listo!</button>
    </div>

    <div class="content">
        {#each filtered as item}
        <div
            tabindex="0"
            class={"thumb card " + (item.fav ? 'faved' : '')}
            on:keydown={(e) => ["Enter", "Space"].includes(e.key) && (currentItem = item)}
        >
            <div class="abs top left bg"
                style={`background-image: url(${item.fotos[0][1]})`}
                on:click={() => (currentItem = item)}
            ></div>
            <div class="on-hover heart" on:click={() => toggleFav(item)}>{item.fav ? "💖" : "❤️"}</div>
            <div class="on-hover hide-phone title" on:click={() => (currentItem = item)}>{item.nombre}</div>
            <div class="on-hover hide-phone tag" on:click={() => (currentItem = item)}>$ {item.precio}</div>
        </div>
        {/each}
    </div>

    <Modal
        class="card modal"
        bind:open={$modals.detail}
        on:keydown={(e) => ["Escape"].includes(e.key) && ($modals.detail = false)}
    >
        <h4>{currentItem.nombre}</h4>
        <div class="flex detail">
            <div class="slider">
                <ul bind:this={slider}>
                    {#each currentItem.fotos as foto, i}
                        <div class="img" style={`background-image: url(${foto[1]})`} ></div>
                    {/each}
                </ul>
                <div class="arrows">
                    <div class="prev" on:click={prevPic} ></div>
                    <a class="zoom" href={currentItem && currentItem.fotos[currentPic][0]} target="_blank"> </a>
                    <div class="next" on:click={nextPic} ></div>
                </div>
                <nav>
                    {#each currentItem.fotos as _, i}
                    <i class={currentPic === i ? 'selected' : ''}/>
                    {/each}
                </nav>
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
                        src='img/help.svg'
                        size='2rem'
                        class='click'
                    />
                    <div class="price">$ {currentItem.precio}</div>
                </div>
                <hr />
                <div class="spaced controls">
                    <button class="button outline"
                        on:click={closeModals}
                    >
                        {currentItem.fav ? "👀 Seguir chusmeando" : "😐 Mmm paso"}
                    </button>
                    <button class="bg-primary fav-btn"
                        on:click={() => toggleFav()}
                    >
                        {currentItem.fav ? "😐 Ya no lo quiero" : "😍 Lo quiero!"}
                    </button>
                </div>
            </div>
        </div>
    </Modal>

    <Modal
        class="small bottom card modal"
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

    <Modal class="welcome small card modal"
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
            <li><b>👀 Chusmeá</b> lo que tenemos</li>
            <li><b>❤️ Favoriteá</b> lo que te guste</li>
            <li>Dale al <span class="button bg-primary">👍 Listo!</span> <small>(abajo a la derecha)</small>
            para mandarnos tu listado y luego poder coordinar la venta</li>
        </ol>

        <hr>

        <p class="small">
            Aceptamos <b>💵 efectivo</b>, <b>💸 transferencia</b> o podemos hacerte un <b>🔗 link de mercadopago</b>
            para que puedas usar el medio de pago que prefieras.
        </p>
        <p class="small">
            Los productos se retiran por <b>📍 Villa Urquiza (CABA)</b>, zona Av. Congreso y Av. Constituyentes.
            Podemos coordinar <b>🚚 envío de paquetes</b> no demasiado grandes.
        </p>

        <hr>

        <p class="textc">Esperamos que encuentres algo de tu agrado! 😊</p>

        <div class="spaced controls">
            <Button primary
                tabindex="0"
                on:click={(e) => ($modals.welcome = false)}>👀 A chusmear!</Button>
        </div>
    </Modal>

    <Modal class="small bottom flex card modal center-both"
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
            <p>2. Elegí un medio de doneo:</p>
            <div class="spaced controls">
                <a href={waref} class="textc"
                    on:click={() => $modals.checkout = 4}>
                    <img height="100%"
                        src="img/whatsapp.svg"
                        alt="Whatsapp">
                    <div>Whatsapp</div>
                </a>
                <a href={mailref} class="textc"
                    on:click={() => $modals.checkout = 4}>
                    <img height="100%"
                        src="img/email.svg"
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
</div>
</main>
{/if}


<style>
    .huge {
        font-style: normal;
        font-size: 5em;
    }

    .gate {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        height: 100vh;
    }

    main {
        height: 100vh;
        padding: 2rem 4rem 5rem 4rem;
    }

    .layout {
        position: relative;
        display: flex;
        flex-direction: column;
        max-width: 1400px;
    }

    .content {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
        grid-gap: var(--space);
        margin-top: var(--d-space);
        overflow-x: hidden;
        overflow-y: auto;
    }

    .done {
        z-index: 1;
        font-size: 2rem;
    }

    .actions {
        margin-left: var(--space);
    }

    .theme, .help {
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
        max-height: 300px;
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
        overflow: hidden;
		position: relative;
		height: 20rem;
	}
    .thumb.faved {
        transform: scale(0.9);
    }
    .thumb .bg {
        height: 100%;
        width: 100%;
		background-position: center;
		background-repeat: no-repeat;
		background-size: cover;
        transition: transform .2s;
    }
    .thumb:hover .bg,
    .thumb:focus .bg {
        transform: scale(1.05);
    }
    .thumb.faved .bg {
        filter: grayscale(1) opacity(0.5);
    }
    .thumb .heart {
		position: absolute;
        bottom: 1.5rem;
		left: 1.5rem;
		font-size: 2.5rem;
        text-shadow: 0 0 4px black;
        transition: transform .2s;
	}
    .thumb .heart:hover {
        transform: scale(1.2);
    }
	.thumb .title {
		color: var(--color-white);
		font-size: calc(var(--font-size) * 1.2);
		line-height: 1.2;
		text-shadow: 0 0 4px black;
        transform: scale(1);
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
	.fav-btn {
		background-color: transparent;
	}

	.img {
		width: 100%;
		background-position: center;
		background-repeat: no-repeat;
		background-size: contain;
		background-color: var(--bg-color);
	}
	.text {
		margin-left: 2.5rem;
	}
	.price {
		font-size: 3rem;
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
            max-height: calc(100vh - 160px);
        }

        .actions {
            position: fixed;
            bottom: var(--h-space);
            left: var(--space);
            margin: 0;
            z-index: 1;
        }

        .done {
            position: fixed;
            bottom: var(--h-space);
            right: var(--d-space);
            margin: 1rem;
        }

        .hide-phone {
            display: none;
        }

        .show-phone {
            display: block;
        }

        .thumb {
			height: 10rem;
		}
        .thumb .heart {
            bottom: initial;
            left: initial;
            top: -0.2rem;
            right: 0rem;
            font-size: 2rem;
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
