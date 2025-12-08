const { Pool } = require("pg");
require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";

// Función para parsear puertos y valores
const toInt = (v, def) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : def;
};

let poolConfig;

if (isProduction) {
  // PRODUCCIÓN (Render -> Railway público)
  poolConfig = {
    host: process.env.DB_HOST, // ej: caboose.proxy.rlwy.net
    port: toInt(process.env.DB_PORT, 5432), // ej: 42368
    database: process.env.DB_NAME, // ej: railway
    user: process.env.DB_USER, // ej: postgres
    password: process.env.DB_PASSWORD, // pon este valor en Render
    ssl: { rejectUnauthorized: false }, // esencial con host público de Railway
    max: toInt(process.env.DB_POOL_MAX, 5), // reduce conexiones simultáneas
    idleTimeoutMillis: toInt(process.env.DB_IDLE_MS, 10000), // cierra ociosas tras 10s
    connectionTimeoutMillis: toInt(process.env.DB_CONN_TIMEOUT_MS, 10000), // espera hasta 10s para conectar
    keepAlive: true, // mantiene viva la conexión TCP
    keepAliveInitialDelayMillis: toInt(process.env.DB_KEEPALIVE_DELAY_MS, 5000),
  };
} else {
  // DESARROLLO LOCAL
  poolConfig = {
    host: process.env.DB_HOST || "localhost",
    port: toInt(process.env.DB_PORT, 5432),
    database: process.env.DB_NAME || "policia_db",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "Sigba2025db",
    ssl:
      process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
    max: toInt(process.env.DB_POOL_MAX, 5),
    idleTimeoutMillis: toInt(process.env.DB_IDLE_MS, 10000),
    connectionTimeoutMillis: toInt(process.env.DB_CONN_TIMEOUT_MS, 10000),
    keepAlive: true,
    keepAliveInitialDelayMillis: toInt(process.env.DB_KEEPALIVE_DELAY_MS, 5000),
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
  console.error("❌ Error en la conexión a PostgreSQL:", err);
});

// Prueba de conexión al iniciar (con reintentos simples)
const testConnection = async (attempt = 1) => {
  try {
    await pool.query("SELECT 1");
    console.log("✅ Prueba de conexión exitosa");
    return true;
  } catch (err) {
    console.error(
      `❌ Error en prueba de conexión (intento ${attempt}):`,
      err.message
    );
    if (attempt < 3) {
      await new Promise((r) => setTimeout(r, 1500 * attempt)); // backoff
      return testConnection(attempt + 1);
    }
    return false;
  }
};

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
  testConnection,
};
