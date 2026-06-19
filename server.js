const express = require("express");
const bodyParser = require("body-parser");
const sql = require("mssql");

const app = express();
const port = process.env.PORT || 8080;

app.use(bodyParser.json());
app.use(express.static("public"));

const config = {
  user: "serveradmin",
  password: "Akashgk@9380",
  server: "curdsqldbs.database.windows.net",
  database: "curdsqldb",
  options: {
    encrypt: true,
    trustServerCertificate: false,
  },
};

// Create table if it doesn't exist
async function initializeDatabase() {
  await sql.query(`
    IF NOT EXISTS (
      SELECT * FROM sys.tables WHERE name = 'Items'
    )
    BEGIN
      CREATE TABLE Items (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(255) NOT NULL,
        description NVARCHAR(MAX) NULL,
        createdAt DATETIME2 DEFAULT GETDATE()
      )
    END
  `);

  console.log("Items table verified/created");
}

// Connect and initialize
sql
  .connect(config)
  .then(async () => {
    console.log("Connected to Azure SQL Database");

    await initializeDatabase();
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });

// Get all items
app.get("/api/items", async (req, res) => {
  try {
    const result = await sql.query`SELECT * FROM Items`;
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Create item
app.post("/api/items", async (req, res) => {
  const { name, description } = req.body;

  try {
    await sql.query`
      INSERT INTO Items (name, description)
      VALUES (${name}, ${description})
    `;

    res.status(201).send("Item added");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Update item
app.put("/api/items/:id", async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    await sql.query`
      UPDATE Items
      SET name = ${name},
          description = ${description}
      WHERE id = ${id}
    `;

    res.send("Item updated");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Delete item
app.delete("/api/items/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await sql.query`
      DELETE FROM Items
      WHERE id = ${id}
    `;

    res.send("Item deleted");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
