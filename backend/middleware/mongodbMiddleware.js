import mongoose from 'mongoose';
import session from 'express-session';
import MongoStore from 'connect-mongodb-session';
import crypto from 'crypto';

export const initializeMongoConnection = async (MONGODB_URI) => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Database Connected Successfully.');
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  }
};

export const initializeSessionStore = (MONGODB_URI) => {
  const MongoDBStore = MongoStore(session);

  const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions',
    ttl: 5 * 60 * 60,
    autoRemove: 'native',
  });

  store.on('error', function (error) {
    console.error('Session store connection error:', error);
  });

  return store;
};

export const generateRandomString = (length) => {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
};