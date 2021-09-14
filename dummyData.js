function pickOne(arr) {
  return arr[random(2) % arr.length];
}

function random(digits = 1) {
  return Math.floor(Math.random() * 10 ** digits);
}

const cats = 'Muebles Ropa Libros'.split(' ');

export const data = Array(20)
  .fill(0)
  .map((e, i) => {
    const cat = pickOne(cats);
    return {
      categoria: cat,
      nombre: cat + ' ' + i,
      desc:
        'Hermosa longboard marca Board Zone de 100 x 22,2 cm con diseño de pez koi. Usada 2 veces. Con detalles estéticos por guardarla a la intemperie (bordes ligeramente abiertos, bulones oxidados, pintura descolorida). Tracks, ruedas y grip en perfecto estado.',
      link: 'https://www.board-zone.com.ar/Longboard_completos_Koi.html',
      estado: 'Usado',
      precio: random(3),
      thumb: 'https://i.ibb.co/FmsnYTs/dav.jpg',
      foto: 'https://i.ibb.co/HBNXP8N/dav.jpg'
    };
  });
