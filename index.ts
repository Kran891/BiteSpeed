import express, { NextFunction, Request, Response } from 'express'
import YAML from 'yamljs'
import SwaggerUI from 'swagger-ui-express'
import { json } from 'body-parser'
import http from 'http'
import { middleware } from 'express-openapi-validator'
import path from 'path'
//Read oas.yaml for instructions
const docs=YAML.load('./oas.yaml');
const app=express()
app.use(json())
app.use("/docs",SwaggerUI.serve,SwaggerUI.setup(docs));
app.use(middleware({
    apiSpec: './oas.yaml',
    operationHandlers: path.join(__dirname),
    validateRequests: true, 
  }))

app.use((err:Error,req:Request,res:Response,next:NextFunction)=>{
    res.json(err);
});
http.createServer(app).listen(4001,()=>{
    console.log("Running on Port ",4001);
    console.log("http://localhost:4001/");
    
})