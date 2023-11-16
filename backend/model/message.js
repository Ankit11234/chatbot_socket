const mongoose =require('mongoose');

const messageSchema = new mongoose.Schema({

  message:{
    type:String,
  },
  role:{
    type:String,
    default:'user'
  }
},
  { timestamps: true }

)

const Message=mongoose.model("message",messageSchema);

module.exports = Message;