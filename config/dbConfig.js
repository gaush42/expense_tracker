const { Sequelize } = require("sequelize")
require("dotenv").config();

// Create a new Sequelize instance
const sequelize = new Sequelize(
    process.env.DB_NAME,     // e.g., "expense"
    process.env.DB_USER,     // e.g., "root"
    process.env.DB_PASSWORD, // e.g., "root"
    {
      host: process.env.DB_HOST || "localhost",
      // Specify the database dialect
      /*
      In Sequelize, dialects refer to the specific SQL database engine you are using,
      such as MySQL, PostgreSQL, SQLite, MariaDB, or Microsoft SQL Server.
      Each SQL database has its own syntax, features, and quirks,
      and Sequelize uses dialects to handle these differences behind the scenes.
      */
      dialect: "mysql",
      /*
      In Sequelize, the pool object refers to connection pooling,
      which is a mechanism to manage and reuse database connections efficiently

      If Sequelize pool is configured with max: 5, and 10 routes are simultaneously querying the database, then:
      5 queries will immediately get a connection from the pool and start executing.
      The other 5 queries will have to wait in a queue until a connection is released (i.e., one of the active queries finishes and returns its connection to the pool).
      This queuing continues until:
      A connection becomes available (within the time specified by acquire), or
      The request times out (if it waits longer than acquire ms), in which case Sequelize will throw a connection timeout error.
       */
      logging: false, // This disables all query logs printed to the terminal.
      pool: {
        max: 5, // Maximum number of connections in pool
        min: 0, // Minimum number of connections in pool
        acquire: 30000, // Maximum time (ms) to wait for connection
        idle: 10000 // Maximum time (ms) a connection can be idle
      }
    }
);

module.exports = sequelize