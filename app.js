const express = require("express")
const app = express()
const path = require('path');

app.use(express.static(path.join(__dirname + "/public/pages")));
app.use(express.static(path.join(__dirname + "/public")));

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname+'/public/home/index.html'))
})

app.listen(process.env.PORT || 3000, function () {
  console.log("Up and running")
})