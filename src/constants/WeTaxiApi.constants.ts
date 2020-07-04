import dotenv from 'dotenv';
dotenv.config();

// Server
export const PORT = process.env.PORT;

// Messages
export const WELCOME_MESSAGE = process.env.WELCOME_MESSAGE;

// DB
const MONGO_URL = process.env.DB_URL;
const MONGO_NAME = process.env.DB_NAME;
const MONGO_PORT = process.env.DB_PORT;

export const NUMBER_OF_AVAILABLE_SLOTS = 1000;
export const NUMBER_OF_PARKING_LOTS = 2;

export const MONGO_DB = `${MONGO_URL}${MONGO_PORT}/${MONGO_NAME}`;
