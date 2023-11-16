const { Configuration, OpenAIApi } = require("openai");
const express=require("express");
const bodyParser= require ("body-parser");
const cors =require ("cors");
const Message =require ("./model/message.js");
const mongoose= require ("mongoose");
const port = 8000;
const dotenv = require("dotenv");
const app = express();
const http = require('http');
const {Server} = require('socket.io');
const server = http.createServer(app);
const path = require('path');

const io = new Server(server, {
  cors: {
      origin: "*"
  },
  pingTimeout: 180000, 
  pingInterval: 30000 
});

io.on('connection',(socket)=>{
  // console.log('connected')
  socket.on('send',async (data)=>{
    // console.log(data)
    const result = await getData(data);
    socket.emit('data',result);
  })
})

dotenv.config();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
const uri =process.env.MONGO_URI
mongoose.set('strictQuery', false);
mongoose
  .connect(uri)
  .then(() => {
    console.log("mongodb connected");
  })
  .catch((err) => {
    console.log("error in connecting", err);
  });
const key=process.env.dummystring || "hsnkas";

const configuration = new Configuration({
  apiKey: key,
});
const openai = new OpenAIApi(configuration);

app.get('/chats',async(req,res)=>{
  const msg = await Message.find();
  return res.status(200).json({message:msg});
})

const getData = async (msg) => {
  await Message.create({
    role:'user',
    message:msg
  })

  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: msg,
      max_tokens: 3000,
    });
  
    await Message.create({
      role:'AI',
      message:completion.data.choices[0].text
    })
    return {message: completion.data.choices[0].text}
  } catch (error) {
    console.log(error);
  }
};


// DEPLOYMENT

const __dirname1 = path.resolve();
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/frontend/build")));
  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}



// DEPLOYMENT

server.listen(port, () => {
  console.log(`listening on port ${port}`);
});
