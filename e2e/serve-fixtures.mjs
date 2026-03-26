import fs from "fs";
import http from "http";
import path from "path";

const port = Number(process.argv[2] ?? 51234);
const rootDir = path.resolve("e2e/fixtures-pages");

function contentTypeFor(filePath) {
	const ext = path.extname(filePath).toLowerCase();
	switch (ext) {
		case ".html":
			return "text/html; charset=utf-8";
		case ".css":
			return "text/css; charset=utf-8";
		case ".js":
			return "text/javascript; charset=utf-8";
		case ".png":
			return "image/png";
		case ".jpg":
		case ".jpeg":
			return "image/jpeg";
		case ".svg":
			return "image/svg+xml; charset=utf-8";
		case ".webp":
			return "image/webp";
		case ".gif":
			return "image/gif";
		case ".ico":
			return "image/x-icon";
		default:
			return "application/octet-stream";
	}
}

const server = http.createServer((req, res) => {
	if (!req.url) {
		res.writeHead(400);
		res.end();
		return;
	}

	const urlPath = decodeURIComponent(req.url.split("?")[0]);
	const safePath = urlPath.replace(/^\/+/, "");
	const filePath = path.join(rootDir, safePath);

	if (!filePath.startsWith(rootDir)) {
		res.writeHead(403);
		res.end();
		return;
	}

	if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
		res.writeHead(404);
		res.end();
		return;
	}

	const body = fs.readFileSync(filePath);
	res.writeHead(200, { "Content-Type": contentTypeFor(filePath) });
	res.end(body);
});

server.listen(port, "localhost", () => {
	console.log(`fixtures server listening on http://localhost:${port}`);
});
