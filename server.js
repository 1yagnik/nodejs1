const http = require('http')
const server = http.createServer((req, res) =>{
    console.log(req.url)
    
    if(req.url == "/product"){
        res.end("this is product");

    }else if(req.url == "/user"){
        res.end("this is user");
    }
})

server.listen(3000, () =>{
    console.log("hello sir")
})
console.log('server listned')