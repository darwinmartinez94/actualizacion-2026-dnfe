const { Pool } = require("pg");
require("dotenv").config();

// Configuración para diferentes entornos
const isProduction = process.env.NODE_ENV === "production";

let poolConfig;

if (isProduction) {
  // Configuración para producción (Railway)
  poolConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: {
      rejectUnauthorized: false, // Necesario para Railway/Render
    },
    max: 10, // Máximo de conexiones
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
} else {
  // Configuración para desarrollo local
  poolConfig = {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || "policia_db",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "Sigba2025db",
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
}

const pool = new Pool(poolConfig);

// Eventos para depuración
pool.on("connect", () => {
  console.log(
    `✅ Conexión a PostgreSQL establecida (${
      isProduction ? "Producción" : "Desarrollo"
    })`
  );
});

pool.on("error", (err) => {
  console.error("❌ Error en la conexión a PostgreSQL:", err.message);
});

// Función para probar conexión
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log("✅ Prueba de conexión exitosa");
    client.release();
    return true;
  } catch (err) {
    console.error("❌ Error en prueba de conexión:", err.message);
    return false;
  }
};

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
  testConnection,
};
