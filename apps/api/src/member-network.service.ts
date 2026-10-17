import {BadRequestException,Injectable} from "@nestjs/common";
import {Prisma} from "@prisma/client";
import {z} from "zod";
import {Database} from "./db.service";
import {config} from "./config";
import {visibleConfirmedMember} from "./member-visibility";

const isoDate=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value=>{
 const date=new Date(value+"T00:00:00.000Z");
 return Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===value;
},"Invalid date");
const filterSchema=z.object({
 joinedFrom:z.union([isoDate,z.literal("")]).default(""),
 joinedTo:z.union([isoDate,z.literal("")]).default(""),
 searchTerm:z.string().trim().max(100).default("")
}).strict();
const querySchema=filterSchema.extend({
 page:z.coerce.number().int().min(1).max(10000).default(1)
}).passthrough();
type Filter=z.infer<typeof filterSchema>;
type NetworkQuery=z.infer<typeof querySchema>;

function validateDateRange(from:string,to:string):void{
 if(from&&to&&from>to)throw new BadRequestException("Joined from must not be after joined to");
}
function parseQuery(raw:unknown):NetworkQuery {
 const parsed=querySchema.safeParse(raw);
 if(!parsed.success)throw new BadRequestException("Invalid network filters");
 validateDateRange(parsed.data.joinedFrom,parsed.data.joinedTo);
 return parsed.data;
}
function parseDraft(raw:unknown):Filter {
 const parsed=filterSchema.safeParse(raw);
 if(!parsed.success)throw new BadRequestException("Invalid network filter draft");
 validateDateRange(parsed.data.joinedFrom,parsed.data.joinedTo);
 return parsed.data;
}
function dateStart(value:string):Date{return new Date(value+"T00:00:00.000Z");}
function dateEnd(value:string):Date{return new Date(value+"T23:59:59.999Z");}

@Injectable()
export class MemberNetworkService {
 constructor(private readonly db:Database){}

 async list(memberId:string,query:unknown){
  const filters=parseQuery(query);
  const where:Prisma.MemberSponsorLinkWhereInput={
   sponsorId:memberId,
   member:{
    ...visibleConfirmedMember,
    ...(filters.joinedFrom||filters.joinedTo?{
     createdAt:{
      ...(filters.joinedFrom?{gte:dateStart(filters.joinedFrom)}:{}),
      ...(filters.joinedTo?{lte:dateEnd(filters.joinedTo)}:{})
     }
    }:{}),
    ...(filters.searchTerm?{OR:[
     {memberCode:{contains:filters.searchTerm}},
     {name:{contains:filters.searchTerm}}
    ]}:{})
   }
  };
  const take=config.NETWORK_PAGE_SIZE;
  const [links,total]=await Promise.all([
   this.db.memberSponsorLink.findMany({
    where,orderBy:[{linkedAt:"asc"},{memberId:"asc"}],
    skip:(filters.page-1)*take,take:take+1,
    select:{member:{select:{name:true,memberCode:true,status:true,createdAt:true}}}
   }),
   this.db.memberSponsorLink.count({where})
  ]);
  return {
   members:links.slice(0,take).map(link=>({
    name:link.member.name,
    memberCode:link.member.memberCode,
    memberStatus:link.member.status,
    joinedAt:link.member.createdAt.toISOString()
   })),
   page:filters.page,
   pageSize:take,
   total,
   hasMore:links.length>take
  };
 }

 async draft(memberId:string){
  const saved=await this.db.memberNetworkFilterDraft.findUnique({where:{memberId}});
  return saved?{
   joinedFrom:saved.joinedFrom?.toISOString().slice(0,10)??"",
   joinedTo:saved.joinedTo?.toISOString().slice(0,10)??"",
   searchTerm:saved.searchTerm,
   savedAt:saved.updatedAt.toISOString()
  }:null;
 }

 async saveDraft(memberId:string,payload:unknown){
  const data=parseDraft(payload);
  const saved=await this.db.memberNetworkFilterDraft.upsert({
   where:{memberId},
   create:{
    memberId,searchTerm:data.searchTerm,
    joinedFrom:data.joinedFrom?dateStart(data.joinedFrom):null,
    joinedTo:data.joinedTo?dateStart(data.joinedTo):null
   },
   update:{
    searchTerm:data.searchTerm,
    joinedFrom:data.joinedFrom?dateStart(data.joinedFrom):null,
    joinedTo:data.joinedTo?dateStart(data.joinedTo):null
   }
  });
  return {savedAt:saved.updatedAt.toISOString()};
 }
}
