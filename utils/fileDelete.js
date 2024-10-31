const fs = require("fs")

const fileDelete =(filePath)=>{
  fs.unlink(filePath,(err)=>{
    if(err) throw err
    console.log("image delete is ok!")
  })
}

module.exports = fileDelete