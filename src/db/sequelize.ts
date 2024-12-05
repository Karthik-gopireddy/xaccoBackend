// // sequelize.ts
// import { Sequelize, Options } from 'sequelize';
// import dotenv from 'dotenv';

// dotenv.config();

// const sequelizeOptions: Options = {
//   dialect: 'postgres',
//   dialectOptions: {
//     ssl: {
//       rejectUnauthorized: false,
//     },
//   },
// };

// const sequelize = new Sequelize(process.env.DATABASE_URL as string, sequelizeOptions);

// // Check the connection
// sequelize.authenticate()
//   .then(() => {
//     console.log('Connected to the database');
//   })
//   .catch((err) => {
//     console.error('Unable to connect to the database:', err);
//   });

// export { sequelize };


import { Sequelize } from "sequelize";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize Sequelize with the DATABASE_URL
export const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres", // Ensure the dialect matches your database
  logging: false, // Optional: Disable query logging for cleaner output
});

// Test the database connection
sequelize
  .authenticate()
  .then(() => console.log("Sequelize connected to PostgreSQL successfully"))
  .catch((err) => console.error("Unable to connect to the database:", err));
