const path = require("node:path");
const fs = require('node:fs');

const http = require("node:http");
const { createGzip } = require("node:zlib");
const url = require("node:url");
//Q1. Use a readable stream to read a file in chunks and log each chunk
const filePath=path.resolve('./big.txt'); 
const readStream=fs.createReadStream(filePath,{encoding:"utf-8"}); 
 readStream.on('data',(chunk)=>{ 
    console.log('......................................') 
    console.log({chunk}); 
    console.log('...................................................')  })
//........................................................................................... 
//Q2. Use readable and writable streams to copy content from one file to another. 
const readStream2=fs.createReadStream('./source.txt',{encoding:'utf-8'});
 const writeStream2=fs.createWriteStream('./dest.txt',{encoding:'utf-8'});
 readStream2.pipe(writeStream2);
//...................................................
//Q3:3. Create a pipeline that reads a file, compresses it, and writes it to another file
const readStream3=fs.createReadStream('./data.txt',{encoding:'utf-8'}); 
const writeStream3=fs.createWriteStream('./data.txt.gz',{encoding:'utf-8'}); 
 const zip = createGzip();
 readStream3.pipe(zip).pipe(writeStream3);
//.......................................................................................
//................part 2....................................
let port = 3000;

function serverListen() {
    return server.listen(port, '127.0.0.1', () => {
        console.log(`server is running on port::${port}`)
    });
}

const server = http.createServer((req, res) => {
    const { method } = req;
    const parsedUrl = url.parse(req.url, true);
    const urlPath = parsedUrl.pathname.split("/").filter(Boolean);

    // --------------------
    //Q1. Create an API that adds a new user to your users stored in a JSON file
    // --------------------
    if (method == "POST" && urlPath[0] == 'user' && urlPath.length === 1) {
        let body = '';

        req.on('data', (chunk) => {
            body += chunk;
        });

        req.on('end', () => {
            const newUser = JSON.parse(body);
            let data = '';

            const readerStream = fs.createReadStream(path.resolve('./users.json'), { encoding: "utf-8" });

            readerStream.on('data', (chunk) => {
                data += chunk;
            });

            readerStream.on('end', () => {
                if (!data.trim()) {
                    data = "{}";
                }

                const json = JSON.parse(data);

                
                for (let id in json) {
                    if (json[id].email === newUser.email) {
                        res.writeHead(409);
                        return res.end(JSON.stringify({ message: "Email is already Exist" }));
                    }
                }

               
                let newId = 1;
                for (let id in json) {
                    const numId = Number(id);
                    if (numId >= newId) newId = numId + 1;
                }

               
                json[newId] = {
                    id: newId,
                    name: newUser.name,
                    email: newUser.email,
                    age: newUser.age
                };

                const writerStream = fs.createWriteStream("users.json");
                writerStream.write(JSON.stringify(json, null, 2));
                writerStream.end();

                writerStream.on("finish", () => {
                    res.writeHead(201, { 'content-type': 'application/json' });
                    res.end(JSON.stringify({message:"user added successfully "}));
                });
            });
        });
    }

    // ---------------------------------------
    //Q5. Create an API that gets User by ID.
    // ---------------------------------------
    else if (req.method === "GET" && urlPath[0] === "user" && urlPath[1]) {

        const userId = String(urlPath[1]);
        let data = "";

        const r = fs.createReadStream("users.json", { encoding: "utf8" });

        r.on("data", (chunk) => (data += chunk));

        r.on("end", () => {
            if (!data.trim()) data = "{}";

            const json = JSON.parse(data);
            const user = json[userId];

            if (!user) {
                res.writeHead(404, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ message: "User not Found" }));
            }

            res.writeHead(200, { "Content-Type": "application/json" });
            return res.end(JSON.stringify(user));
        });

        r.on("error", () => {
            res.writeHead(500);
            res.end(JSON.stringify({ message: "Could not read users.json" }));
        });
    }

    // ---------------------------------------
    // Q4-Create an API that gets all users from the JSON file.
    // ---------------------------------------
    else if (method == "GET" && urlPath[0] == 'user') {

        let data = '';
        const readerStream = fs.createReadStream(path.resolve('./users.json'), { encoding: 'utf-8' });

        readerStream.on("data", (chunk) => {
            data += chunk;
        });

        readerStream.on('end', () => {
            if (!data.trim()) {
                data = "{}";
            }
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(data);
        });

        readerStream.on("error", () => {
            res.writeHead(500);
            res.end("Error reading file");
        });
    }

    // ---------------------------------------
    // Q2. Create an API that updates an existing user's name, age, or email by their ID. The user ID should be retrieved from the URL
    // ---------------------------------------
    else if (method === 'PATCH' && urlPath[0] === 'user' && urlPath[1]) {

        const userId = urlPath[1];
        let body = '';

        req.on('data', (chunk) => {
            body += chunk;
        });

        req.on('end', () => {

            const updatedData = JSON.parse(body);
            let data = '';

            const readerStream = fs.createReadStream(
                path.resolve('./users.json'),
                { encoding: "utf-8" }
            );

            readerStream.on('data', (chunk) => {
                data += chunk;
            });

            readerStream.on('end', () => {
                if (!data.trim()) data = '{}';

                const json = JSON.parse(data);
                const user = json[userId];

                if (!user) {
                    res.writeHead(404, { "Content-Type": "application/json" });
                    return res.end(JSON.stringify({ message: "User not found" }));
                }

                const newUser = {
                    id: user.id,
                    name: updatedData.name ?? user.name,
                    email: updatedData.email ?? user.email,
                    age: updatedData.age ?? user.age
                };

                json[userId] = newUser;

                const writerStream = fs.createWriteStream("users.json");
                writerStream.write(JSON.stringify(json, null, 2));
                writerStream.end();

                writerStream.on("finish", () => {
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ message: "User updated" }));
                });
            });

            readerStream.on("error", () => {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ message: "Error reading users.json" }));
            });
        });
    }

    // ---------------------------------------
    // Q3. Create an API that deletes a User by ID. The user id should be retrieved from the URL
    // ---------------------------------------
    else if (method == "DELETE" && urlPath[0] == "user" && urlPath[1]) {
        const userId = urlPath[1];
        let data = '';

        const readerStream = fs.createReadStream(
            path.resolve('./users.json'),
            { encoding: "utf-8" }
        );

        readerStream.on('data', (chunk) => {
            data += chunk;
        });

        readerStream.on('end', () => {
            if (!data.trim()) data = '{}';

            const json = JSON.parse(data);

            if (!json[userId]) {
                res.writeHead(404, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ message: "User not found" }));
            }

            delete json[userId];

            const writerStream = fs.createWriteStream("users.json");
            writerStream.write(JSON.stringify(json, null, 2));
            writerStream.end();

            writerStream.on("finish", () => {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ message: "User deleted" }));
            });
        });
    }

    // ---------------------------------------
    // NOT FOUND
    // ---------------------------------------
    else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "User not Found" }));
    }
});

serverListen();

server.on("error", (error) => {
    if (error.code === 'EADDRINUSE') {
        ++port;
        serverListen();
    }
});
