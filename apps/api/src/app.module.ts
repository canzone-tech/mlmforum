import {Controller,Get,Module,ServiceUnavailableException} from "@nestjs/common";
import {APP_GUARD} from "@nestjs/core";
import {ThrottlerModule,ThrottlerGuard} from "@nestjs/throttler";
import {Database} from "./db.service";
import {AuthService} from "./auth.service";
import {AuthController} from "./auth.controller";
import {MemberController} from "./member.controller";
import {GenealogyService} from "./genealogy.service";
@Controller("health")
class HealthController {
 constructor(private readonly db:Database){}
 @Get("live") live(){return {status:"alive"};}
 @Get("ready") async ready(){
  try{await this.db.$queryRaw`SELECT 1`;return {status:"ready"};}
  catch{throw new ServiceUnavailableException("Database not ready");}
 }
}
@Module({
 imports:[ThrottlerModule.forRoot([{ttl:60000,limit:60}])],
 controllers:[AuthController,MemberController,HealthController],
 providers:[Database,AuthService,GenealogyService,{provide:APP_GUARD,useClass:ThrottlerGuard}]
})
export class AppModule {}
