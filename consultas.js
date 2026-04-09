import dotenv from "dotenv";
import process from "node:process";
import pg from "pg";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
	host: process.env.DB_HOST || "localhost",
	user: process.env.DB_USER || "postgres",
	password: process.env.DB_PASSWORD || "",
	database: process.env.DB_NAME || "likeme",
	port: Number(process.env.DB_PORT) || 5432,
	allowExitOnIdle: true,
});

export const obtenerPosts = async () => {
	const { rows } = await pool.query(
		"SELECT id, titulo, img, descripcion, likes FROM posts ORDER BY id ASC"
	);

	return rows;
};

export const crearPost = async (titulo, imageUrl, descripcion) => {
	const { rows } = await pool.query(
		"INSERT INTO posts (titulo, img, descripcion, likes) VALUES ($1, $2, $3, $4) RETURNING id, titulo, img, descripcion, likes",
		[titulo, imageUrl, descripcion, 0]
	);

	return rows[0];
};

export const darLike = async (id) => {
	const { rows } = await pool.query(
		"UPDATE posts SET likes = likes + 1 WHERE id = $1 RETURNING id, titulo, img, descripcion, likes",
		[id]
	);

	return rows[0];
};

export const eliminarPost = async (id) => {
	const { rows } = await pool.query(
		"DELETE FROM posts WHERE id = $1 RETURNING id",
		[id]
	);

	return rows[0];
};
