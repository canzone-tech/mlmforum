import {Controller,Get,Post,Body,Param,Req,Res,HttpCode,HttpStatus,ForbiddenException,Headers} from "@nestjs/common";
import {Throttle} from "@nestjs/throttler";
import {Request,Response} from "express";
import {AuthService} from "./auth.service";
import {config,secureCookie} from "./config";
function readCookie(req:Request,name:string):string|undefined{
 const entry=req.headers.cookie?.split(";").map(part=>part.trim()).find(part=>part.startsWith(name+"="));
 return entry?.slice(name.length+1);
}
function cookies(res:Response,access:string,refresh:string):void{
 res.cookie("mlmf_access",access,{httpOnly:true,secure:secureCookie,sameSite:"lax",path:"/",maxAge:600000});
 res.cookie("mlmf_refresh",refresh,{httpOnly:true,secure:secureCookie,sameSite:"lax",path:"/api/auth",maxAge:604800000});
}
function clear(res:Response):void{
 res.clearCookie("mlmf_access",{httpOnly:true,secure:secureCookie,sameSite:"lax",path:"/"});
 res.clearCookie("mlmf_refresh",{httpOnly:true,secure:secureCookie,sameSite:"lax",path:"/api/auth"});
}
@Controller("api")
export class AuthController {
 constructor(private readonly auth:AuthService){}
 private requireOrigin(origin:string|undefined,contentType:string|undefined):void{
  if(origin && origin!==config.APP_ORIGIN)throw new ForbiddenException("Invalid origin");
  if(!contentType?.toLowerCase().startsWith("application/json"))throw new ForbiddenException("JSON required");
 }
 @Get("sponsors/:id")
 @Throttle({default:{limit:30,ttl:60000}})
 sponsor(@Param("id") code:string){return this.auth.sponsor(code);}
 @Post("auth/register")
 @HttpCode(HttpStatus.ACCEPTED)
 @Throttle({default:{limit:5,ttl:60000}})
 register(@Body() data:unknown,@Headers("origin") origin:string|undefined,@Headers("content-type") ct:string|undefined){
  this.requireOrigin(origin,ct);return this.auth.registration(data);
 }
 @Post("auth/login")
 @HttpCode(HttpStatus.OK)
 @Throttle({default:{limit:config.AUTH_LOGIN_RATE_LIMIT,ttl:60000}})
 async login(@Body() data:unknown,@Res({passthrough:true}) res:Response,
  @Headers("origin") origin:string|undefined,@Headers("content-type") ct:string|undefined){
  this.requireOrigin(origin,ct);
  const pair=await this.auth.login(data);cookies(res,pair.access,pair.refresh);
  return {status:"authenticated"};
 }
 @Get("auth/me")
 me(@Req() req:Request){return this.auth.identity(readCookie(req,"mlmf_access"));}
 @Post("auth/refresh")
 @HttpCode(HttpStatus.OK)
 async refresh(@Req() req:Request,@Res({passthrough:true})res:Response,
  @Headers("origin") origin:string|undefined,@Headers("content-type")ct:string|undefined){
  this.requireOrigin(origin,ct);
  const pair=await this.auth.rotate(readCookie(req,"mlmf_refresh"));
  cookies(res,pair.access,pair.refresh);return {status:"authenticated"};
 }
 @Post("auth/logout")
 @HttpCode(HttpStatus.NO_CONTENT)
 async logout(@Req() req:Request,@Res({passthrough:true})res:Response,
  @Headers("origin")origin:string|undefined,@Headers("content-type")ct:string|undefined){
  this.requireOrigin(origin,ct);
  await this.auth.logout(readCookie(req,"mlmf_refresh"));clear(res);
 }
}
