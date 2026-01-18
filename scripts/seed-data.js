/**
 * Seed Sample Data Script
 * 
 * Imports sample restaurants and menu items into DynamoDB
 * Can be used for both local development and production deployment
 * 
 * Usage:
 *   node scripts/seed-data.js
 * 
 * Environment Variables:
 *   AWS_REGION - AWS region (default: ap-southeast-1)
 *   RESTAURANTS_TABLE - DynamoDB table name for restaurants
 *   MENU_TABLE - DynamoDB table name for menu items
 *   AWS_ENDPOINT_URL - Optional: DynamoDB Local endpoint (http://localhost:8000)
 */

const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

const AWS_REGION = process.env.AWS_REGION || 'ap-southeast-1';
const RESTAURANTS_TABLE = process.env.RESTAURANTS_TABLE || 'food-delivery-local-restaurants';
const MENU_TABLE = process.env.MENU_TABLE || 'food-delivery-local-menu';
const AWS_ENDPOINT_URL = process.env.AWS_ENDPOINT_URL;

// Configure AWS SDK
const awsConfig = { region: AWS_REGION };
if (AWS_ENDPOINT_URL) {
  awsConfig.endpoint = AWS_ENDPOINT_URL;
}
AWS.config.update(awsConfig);
const dynamodb = new AWS.DynamoDB.DocumentClient();

// Read sample data files
const restaurantsPath = path.join(__dirname, '../sample-data/restaurants.json');
const menuItemsPath = path.join(__dirname, '../sample-data/menu-items.json');

async function seedRestaurants() {
  try {
    const restaurantsData = JSON.parse(fs.readFileSync(restaurantsPath, 'utf8'));
    console.log(`\n📦 Seeding ${restaurantsData.length} restaurants...`);

    for (const restaurant of restaurantsData) {
      const item = {
        ...restaurant,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await dynamodb.put({
        TableName: RESTAURANTS_TABLE,
        Item: item
      }).promise();

      console.log(`  ✅ ${restaurant.name} (${restaurant.restaurantId})`);
    }

    console.log(`\n✅ Successfully seeded ${restaurantsData.length} restaurants`);
    return restaurantsData.length;
  } catch (error) {
    console.error('❌ Error seeding restaurants:', error.message);
    throw error;
  }
}

async function seedMenuItems() {
  try {
    const menuItemsData = JSON.parse(fs.readFileSync(menuItemsPath, 'utf8'));
    console.log(`\n🍕 Seeding ${menuItemsData.length} menu items...`);

    for (const menuItem of menuItemsData) {
      const item = {
        ...menuItem,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await dynamodb.put({
        TableName: MENU_TABLE,
        Item: item
      }).promise();

      console.log(`  ✅ ${menuItem.name} (${menuItem.itemId}) - $${menuItem.price}`);
    }

    console.log(`\n✅ Successfully seeded ${menuItemsData.length} menu items`);
    return menuItemsData.length;
  } catch (error) {
    console.error('❌ Error seeding menu items:', error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting data seed process...');
  console.log(`📍 Region: ${AWS_REGION}`);
  console.log(`🏪 Restaurants Table: ${RESTAURANTS_TABLE}`);
  console.log(`🍽️  Menu Table: ${MENU_TABLE}`);
  if (AWS_ENDPOINT_URL) {
    console.log(`🔗 Endpoint: ${AWS_ENDPOINT_URL} (DynamoDB Local)`);
  }

  try {
    // Seed restaurants first
    const restaurantCount = await seedRestaurants();

    // Seed menu items
    const menuItemCount = await seedMenuItems();

    console.log('\n✨ Seed completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Restaurants: ${restaurantCount}`);
    console.log(`   - Menu Items: ${menuItemCount}`);
    console.log('\n💡 Tip: You can now start the API and frontend to view the data');

  } catch (error) {
    console.error('\n❌ Seed failed:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { seedRestaurants, seedMenuItems };
