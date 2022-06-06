let mock = {
    config: `publish	xrate	updated
    X	205	2022-06-06`,
}

//mock = Object.fromEntries( Object.entries(mock).map(([k,v]) => [k, delay(v)]) )

function delay(data, ms=100) {
    return () => new Promise(res => setTimeout(() => data.ok = 1, res(data), ms))
}

export default mock
