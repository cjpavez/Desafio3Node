import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import process from "node:process";
import {
	crearPost,
	darLike,
	eliminarPost,
	obtenerPosts,
} from "./consultas.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/posts", async (_req, res) => {
	try {
		const posts = await obtenerPosts();

		res.status(200).json(posts);
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
		const post = await crearPost(titulo, imageUrl, descripcion);

		res.status(201).json(post);
	} catch (error) {
		console.error("Error al crear el post:", error);
		res.status(500).json({ error: "No fue posible crear el post." });
	}
});

app.put("/posts/like/:id", async (req, res) => {
	const { id } = req.params;

	try {
		const post = await darLike(id);

		if (!post) {
			return res.status(404).json({ error: "Post no encontrado." });
		}

		res.status(200).json(post);
	} catch (error) {
		console.error("Error al dar like al post:", error);
		res.status(500).json({ error: "No fue posible actualizar el post." });
	}
});

app.delete("/posts/:id", async (req, res) => {
	const { id } = req.params;

	try {
		const post = await eliminarPost(id);

		if (!post) {
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