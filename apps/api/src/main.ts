import "reflect-metadata";
import {NestFactory} from "@nestjs/core";
import helmet from "helmet";
import {AppModule} from "./app.module";
import {config} from "./config";
async function start(){
 const app=await NestFactory.create(AppModule,{logger:["error","warn","log"]});
 app.use(helmet());
 app.enableShutdownHooks();
 await app.listen(config.API_PORT,config.API_HOST);
}
start().catch((error:unknown)=>{
 console.error("API startup failed:",error instanceof Error?error.message:"unknown");
 process.exitCode=1;
});
