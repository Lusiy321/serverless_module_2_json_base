import express from "express";
import fs from "fs/promises";
import path from "path";

const app = express();
const PORT = 3000;

const jsonPath = path.join(__dirname, "json.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

async function saveJson() {
  try {
    await fs.access(jsonPath);
  } catch {
    await fs.writeFile(jsonPath, "{}", "utf-8");
  }

  try {
    await fs.writeFile(jsonPath, JSON.stringify(json, null, 2));
    console.log("saved");
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error saving:", error.message);
    } else {
      console.error("Unknown error:", error);
    }
  }
}

let json: Record<string, any> = {};

async function readFile() {
  try {
    const fileData = await fs.readFile(jsonPath, "utf-8");
    json = JSON.parse(fileData);
  } catch (error: any) {
    if (error && error.code === "ENOENT") {
      json = {};
      console.log("file not found, creating a new one.");
    } else {
      console.error("Error reading JSON  file:", error.message);
    }
  }
}

readFile().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
});

app.put("/:json_path", (req, res) => {
  const jsonPath = req.params.json_path;
  const jsonData = req.body;

  json[jsonPath] = jsonData;

  saveJson();

  res.status(201).json({ status: "success", message: "successful" });
});

app.get("/:json_path", (req, res) => {
  const jsonPath = req.params.json_path;
  const jsonData = json[jsonPath];

  if (jsonData) {
    res.json(jsonData);
  } else {
    res.status(404).json({ status: "error", message: "document not found" });
  }
});
