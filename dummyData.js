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
        'Mesa rectangular de [material] color blanco, medidas largo x ancho x alto',
      link: '',
      estado: 'Como nuevo',
      precio: random(3),
      thumb: 'https://i.ibb.co/FmsnYTs/dav.jpg',
      foto: 'https://i.ibb.co/HBNXP8N/dav.jpg'
    };
  });
