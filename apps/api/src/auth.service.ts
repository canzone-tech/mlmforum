import {Injectable,UnauthorizedException,BadRequestException,ConflictException,NotFoundException,ServiceUnavailableException} from "@nestjs/common";
import {Database} from "./db.service";
import {config} from "./config";
import {JwtService} from "@nestjs/jwt";
import {hash,verify} from "argon2";
import {Prisma,Role,UserStatus} from "@prisma/client";
import {z} from "zod";
import {randomUUID} from "node:crypto";

const memberCode=z.string().trim().toUpperCase().regex(/^[A-Z0-9-]{3,30}$/);
const email=z.string().trim().toLowerCase().email().max(160);
const password=z.string().min(1).max(1024);
const loginSchema=z.object({email,password}).strict();
const registerSchema=z.object({
 fullName:z.string().trim().min(2).max(100),
 email,
 mobileNo:z.string().regex(/^[6-9][0-9]{9}$/),
 sponsorId:memberCode,
 requestedAccountType:z.enum(["member","business","expert","organizer","advertiser"]),
 interest:z.enum(["Network Marketing","Business Opportunities","Training & Learning","Products & Services","Leadership"]),
 consent:z.literal(true)
}).strict();
const accountRoles:Record<string,Role>={
 member:Role.MEMBER,business:Role.BUSINESS,expert:Role.EXPERT,
 organizer:Role.ORGANIZER,advertiser:Role.ADVERTISER
};
type Identity={userId:string;sessionId:string};
function validated<T>(schema:z.ZodType<T>,payload:unknown):T {
 const result=schema.safeParse(payload);
 if(!result.success)throw new BadRequestException("Invalid request data");
 return result.data;
}
@Injectable()
export class AuthService {
 private readonly jwt=new JwtService();
 constructor(private readonly db:Database){}
 private token(payload:Identity,type:"access"|"refresh"):Promise<string>{
  return this.jwt.signAsync({...payload,typ:type},{
   secret:type==="access"?config.JWT_ACCESS_SECRET:config.JWT_REFRESH_SECRET,
   expiresIn:type==="access"?600:604800
  });
 }
 private async verifyToken(token:string,type:"access"|"refresh"):Promise<Identity>{
  try{
   const data:unknown=await this.jwt.verifyAsync(token,{
    secret:type==="access"?config.JWT_ACCESS_SECRET:config.JWT_REFRESH_SECRET
   });
   if(!data || typeof data!=="object")throw new Error("Invalid token");
   const value=data as Record<string,unknown>;
   if(value.typ!==type||typeof value.userId!=="string"||typeof value.sessionId!=="string")throw new Error("Invalid token claims");
   return {userId:value.userId,sessionId:value.sessionId};
  }catch{throw new UnauthorizedException("Authentication required");}
 }
 async sponsor(code:string):Promise<{name:string}>{
  const parsed=memberCode.safeParse(code);
  if(!parsed.success)throw new BadRequestException("Invalid Sponsor ID");
  const sponsor=await this.db.user.findUnique({where:{memberCode:parsed.data},select:{name:true,status:true,mobileVerifiedAt:true}});
  // Conservative lookup: no names for accounts not verified and active.
  if(!sponsor||sponsor.status!==UserStatus.ACTIVE||!sponsor.mobileVerifiedAt)throw new NotFoundException("Sponsor not found");
  return {name:sponsor.name};
 }
 async registration(payload:unknown):Promise<{status:string}>{
  if(!config.REGISTRATION_INTAKE_ENABLED)throw new ServiceUnavailableException("Registration intake not enabled");
  const data=validated(registerSchema,payload);
  const sponsor=await this.db.user.findUnique({where:{memberCode:data.sponsorId},select:{id:true,status:true,mobileVerifiedAt:true}});
  if(!sponsor||sponsor.status!==UserStatus.ACTIVE||!sponsor.mobileVerifiedAt)
   throw new BadRequestException("Sponsor is not verified");
  const inUse=await this.db.user.findFirst({where:{OR:[{email:data.email},{mobile:data.mobileNo}]},select:{id:true}});
  if(inUse)throw new ConflictException("Registration cannot be accepted");
  try{
   await this.db.registrationRequest.create({data:{
    fullName:data.fullName,email:data.email,mobile:data.mobileNo,sponsorId:sponsor.id,
    requestedRole:accountRoles[data.requestedAccountType],interest:data.interest,
    consentVersion:config.CONSENT_POLICY_VERSION
   }});
  }catch(error){
   if(error instanceof Prisma.PrismaClientKnownRequestError && error.code==="P2002")throw new ConflictException("Registration cannot be accepted");
   throw error;
  }
  // No user, password, active network node, or commission is created here.
  return {status:"pending_verification"};
 }
 async login(payload:unknown):Promise<{access:string;refresh:string}>{
  const data=validated(loginSchema,payload);
  const user=await this.db.user.findUnique({where:{email:data.email},include:{roles:true}});
  if(!user||user.status!==UserStatus.ACTIVE||!user.mobileVerifiedAt||!user.passwordHash
   ||!(await verify(user.passwordHash,data.password).catch(()=>false)))
   throw new UnauthorizedException("Incorrect email or password");
  const identity={userId:user.id,sessionId:randomUUID()};
  const access=await this.token(identity,"access");
  const refresh=await this.token(identity,"refresh");
  await this.db.session.create({data:{
   id:identity.sessionId,userId:user.id,refreshHash:await hash(refresh),
   expiresAt:new Date(Date.now()+604800000)
  }});
  return {access,refresh};
 }
 async identity(accessToken:string|undefined):Promise<{id:string;name:string;roles:Role[]}>{
  if(!accessToken)throw new UnauthorizedException("Authentication required");
  const identity=await this.verifyToken(accessToken,"access");
  const session=await this.db.session.findUnique({where:{id:identity.sessionId},include:{user:{include:{roles:true}}}});
  if(!session||session.revokedAt||session.expiresAt<=new Date()||
    session.userId!==identity.userId||session.user.status!==UserStatus.ACTIVE)
   throw new UnauthorizedException("Authentication required");
  return {id:session.user.id,name:session.user.name,roles:session.user.roles.map(x=>x.role)};
 }
 async rotate(refreshToken:string|undefined):Promise<{access:string;refresh:string}>{
  if(!refreshToken)throw new UnauthorizedException("Authentication required");
  const identity=await this.verifyToken(refreshToken,"refresh");
  const previous=await this.db.session.findUnique({where:{id:identity.sessionId},include:{user:true}});
  if(!previous||previous.revokedAt||previous.expiresAt<=new Date()||
     previous.userId!==identity.userId||previous.user.status!==UserStatus.ACTIVE||
     !(await verify(previous.refreshHash,refreshToken).catch(()=>false)))
    throw new UnauthorizedException("Authentication required");
  const updated=await this.db.session.updateMany({where:{
    id:identity.sessionId,revokedAt:null,expiresAt:{gt:new Date()}
  },data:{revokedAt:new Date()}});
  if(updated.count!==1)throw new UnauthorizedException("Authentication required");
  const newId={userId:identity.userId,sessionId:randomUUID()};
  const access=await this.token(newId,"access");
  const refresh=await this.token(newId,"refresh");
  await this.db.session.create({data:{
   id:newId.sessionId,userId:identity.userId,refreshHash:await hash(refresh),
   expiresAt:new Date(Date.now()+604800000)
  }});
  return {access,refresh};
 }
 async logout(refreshToken:string|undefined):Promise<void>{
  if(!refreshToken)return;
  try{
   const identity=await this.verifyToken(refreshToken,"refresh");
   const session=await this.db.session.findUnique({where:{id:identity.sessionId}});
   if(session&&session.userId===identity.userId&&!session.revokedAt&&
     await verify(session.refreshHash,refreshToken).catch(()=>false)){
    await this.db.session.updateMany({where:{id:session.id,revokedAt:null},data:{revokedAt:new Date()}});
   }
  }catch{
   // Repeated logout is idempotent. Never disclose token/session state.
  }
 }
}
