import Promotion from './models/promotionModel.js';

const seedPromotions = async () => {
  try {
    const existingPromotions = await Promotion.find();
    if (existingPromotions.length === 0) {
      const promotions = [
        {
          code: 'SUMMER25',
          discount: 25,
          expirationDate: new Date('2024-08-31'),
        },
      ];

      await Promotion.insertMany(promotions);
      console.log('Promotions seeded successfully.');
    } else {
      console.log(
        'Promotions already exist in the database. Skipping seeding.'
      );
    }
  } catch (error) {
    console.error('Error seeding promotions:', error);
  }
};

export default seedPromotions;
