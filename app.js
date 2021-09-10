const connection = require('./db-config');
const express = require('express');
const app = express();

const port = process.env.PORT || 3000;

connection.connect((err) => {
  if (err) {
    console.error('error connecting: ' + err.stack);
  } else {
    console.log('connected as id ' + connection.threadId);
  }
});

app.use(express.json());

//Routes
app.use("/api/movies", require("./routes/movies.routes"))
app.use("/api/users", require("./routes/users.routes"))

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
