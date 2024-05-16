const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) =>{
    res.send('Server of Electro Fix is running')
})

app.listen(port, () => {
    console.log(`Server of Electro Fix is running on port ${port}`)
})

// n28Wq2CjHIFrfGam
// ElectroFix