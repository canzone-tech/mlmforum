import {Controller,Get,Req,ForbiddenException} from "@nestjs/common";
import {Request} from "express";
import {Role} from "@prisma/client";
import {AuthService} from "./auth.service";
import {Database} from "./db.service";
import {GenealogyService} from "./genealogy.service";

@Controller("api/member")
export class MemberController {
 constructor(private readonly auth:AuthService,private readonly db:Database,private readonly genealogy:GenealogyService){}
 @Get("genealogy")
 async genealogyTree(@Req() req:Request){
  const member=await this.authenticatedMember(req);
  return this.genealogy.read(member.id);
 }
 private async authenticatedMember(req:Request){
  const access=req.headers.cookie?.split(";")
   .map(part=>part.trim()).find(part=>part.startsWith("mlmf_access="))
   ?.slice("mlmf_access=".length);
  const identity=await this.auth.identity(access);
  if(!identity.roles.includes(Role.MEMBER))
   throw new ForbiddenException("Member access required");
  return identity;
 }
 @Get("overview")
 async overview(@Req() req:Request) {
  const identity=await this.authenticatedMember(req);
  // Identity comes from the verified server session, not a query parameter.
  const member=await this.db.user.findUniqueOrThrow({
   where:{id:identity.id},
   select:{name:true,memberCode:true,status:true,createdAt:true,
    emailVerifiedAt:true,mobileVerifiedAt:true}
  });
  const sessions=await this.db.session.findMany({
   where:{userId:identity.id},orderBy:{createdAt:"desc"},take:5,
   select:{createdAt:true,revokedAt:true,expiresAt:true}
  });
  return {
   account:{name:member.name,memberCode:member.memberCode,
    status:member.status,joinedAt:member.createdAt.toISOString(),
    emailVerified:member.emailVerifiedAt!==null,
    mobileVerified:member.mobileVerifiedAt!==null},
   recentSignIns:sessions.map(s=>({at:s.createdAt.toISOString(),
    status:s.revokedAt?"Ended":s.expiresAt<=new Date()?"Expired":"Active"}))
  };
 }
}
