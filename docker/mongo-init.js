db = db.getSiblingDB('quickqr');

db.createUser({
  user: 'quickqr_user',
  pwd: 'quickqr_password',
  roles: [
    {
      role: 'readWrite',
      db: 'quickqr',
    },
  ],
});

// Create initial collections
db.createCollection('users');
db.createCollection('restaurants');
db.createCollection('menus');
db.createCollection('categories');
db.createCollection('menu_items');
db.createCollection('orders');
db.createCollection('tables');
db.createCollection('qrcodes');
db.createCollection('subscriptions');
db.createCollection('plans');

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.restaurants.createIndex({ slug: 1 }, { unique: true });
db.restaurants.createIndex({ owner: 1 });
db.orders.createIndex({ restaurant: 1, createdAt: -1 });
db.orders.createIndex({ status: 1 });

print('Database initialized successfully!');