import bcrypt from 'bcryptjs';

const data = {
  users: [
    {
      name: 'Dana',
      email: 'admin@example.com',
      password: bcrypt.hashSync('parola'),
      isAdmin: true,
    },
    {
      name: 'Maria',
      email: 'maria@example.com',
      password: bcrypt.hashSync('maria'),
      isAdmin: false,
    },
  ],
  products: [
    {
      //_id: '1',
      name: 'Cană pictată manual',
      slug: 'cana-pictata-manual',
      category: 'Ustensile bucatarie',
      image: '/images/p1.jpg',
      price: 40,
      countInStock: 5,
      commercializer: 'ObiectePictate',
      rating: 4.0,
      numReviews: 5,
      description: 'Cană pictata manual cu modele deosebite',
    },
    {
      //_id: '2',
      name: 'Covor albastru brodat',
      slug: 'covor-albastru-deschis',
      category: 'Decoratiuni pentru casa',
      image: '/images/p8-rug.jpg',
      price: 100,
      countInStock: 0,
      commercializer: 'Atelierul Oanei',
      rating: 0.0,
      numReviews: 0,
      description:
        'Covor albastru deschis, cu un model inspirat din stilul rustic',
    },
    {
      //_id: '3',
      name: 'Cercei cu perle',
      slug: 'cercei-cu-perle',
      category: 'Bijuterii',
      image: '/images/p3.jpg',
      price: 70,
      countInStock: 30,
      commercializer: 'Bijuterii HandMade',
      rating: 0.0,
      numReviews: 0,
      description:
        'Cercei eleganti cu perle din aur, perfecti pentru orice ocazie',
    },
    {
      //_id: '4',
      name: 'Lănțișor cu pandantiv roșu',
      slug: 'lantisor-cu-pandantiv',
      category: 'Bijuterii',
      image: '/images/p4.jpg',
      price: 120,
      countInStock: 20,
      commercializer: 'Teilor',
      rating: 4.6,
      numReviews: 5,
      description:
        'Lanțul elegant din aur este însoțit de un pandantiv distins în nuanțe vibrante de roșu, aducând o notă de rafinament și căldură la orice ținută.',
    },
  ],
};
export default data;
