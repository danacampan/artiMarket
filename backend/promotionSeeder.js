import Promotion from './models/promotionModel.js'; // Import your Promotion model

const seedPromotions = async () => {
  try {
    // Check if there are already promotions in the database
    const existingPromotions = await Promotion.find();
    if (existingPromotions.length === 0) {
      // If no promotions exist, seed the promotions
      const promotions = [
        {
          code: 'SUMMER25',
          discount: 25,
          expirationDate: new Date('2024-08-31'),
        },
        // Add more promotions as needed
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
