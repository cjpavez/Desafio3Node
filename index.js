import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import process from "node:process";
import pg from "pg";

dotenv.config();

const { Pool } = pg;

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
	host: process.env.DB_HOST || "localhost",
	user: process.env.DB_USER || "postgres",
	password: process.env.DB_PASSWORD || "",
	database: process.env.DB_NAME || "likeme",
	port: Number(process.env.DB_PORT) || 5432,
	allowExitOnIdle: true,
});

app.use(cors());
app.use(express.json());

app.get("/posts", async (_req, res) => {
	try {
		const { rows } = await pool.query(
			"SELECT id, titulo, img, descripcion, likes FROM posts ORDER BY id ASC"
		);

		res.status(200).json(rows);
	} catch (error) {
		console.error("Error al obtener los posts:", error);
		res.status(500).json({ error: "No fue posible obtener los posts." });
	}
});

app.post("/posts", async (req, res) => {
	const { titulo, url, img, descripcion } = req.body;
	const imageUrl = url || img;

	if (!titulo || !imageUrl || !descripcion) {
		return res.status(400).json({
			error: "Debes enviar titulo, url y descripcion para crear el post.",
		});
	}

	try {
		const { rows } = await pool.query(
			"INSERT INTO posts (titulo, img, descripcion, likes) VALUES ($1, $2, $3, $4) RETURNING id, titulo, img, descripcion, likes",
			[titulo, imageUrl, descripcion, 0]
		);

		res.status(201).json(rows[0]);
	} catch (error) {
		console.error("Error al crear el post:", error);
		res.status(500).json({ error: "No fue posible crear el post." });
	}
});

app.put("/posts/like/:id", async (req, res) => {
	const { id } = req.params;

	try {
		const { rows } = await pool.query(
			"UPDATE posts SET likes = likes + 1 WHERE id = $1 RETURNING id, titulo, img, descripcion, likes",
			[id]
		);

		if (!rows.length) {
			return res.status(404).json({ error: "Post no encontrado." });
		}

		res.status(200).json(rows[0]);
	} catch (error) {
		console.error("Error al dar like al post:", error);
		res.status(500).json({ error: "No fue posible actualizar el post." });
	}
});

app.delete("/posts/:id", async (req, res) => {
	const { id } = req.params;

	try {
		const { rows } = await pool.query(
			"DELETE FROM posts WHERE id = $1 RETURNING id",
			[id]
		);

		if (!rows.length) {
			return res.status(404).json({ error: "Post no encontrado." });
		}

		res.status(200).json({ message: "Post eliminado correctamente." });
	} catch (error) {
		console.error("Error al eliminar el post:", error);
		res.status(500).json({ error: "No fue posible eliminar el post." });
	}
});

app.listen(port, () => {
	console.log(`Servidor activo en http://localhost:${port}`);
});