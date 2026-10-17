import {Injectable} from "@nestjs/common";
import {visibleConfirmedMember} from "./member-visibility";
import {Database} from "./db.service";
import {config} from "./config";

export type GenealogyNode={
  memberCode:string;
  name:string;
  sponsorCode:string;
};
export type GenealogyLevel={
  level:number;
  members:GenealogyNode[];
  displayed:number;
  truncated:boolean;
};
export type GenealogyResponse={
  root:{memberCode:string;name:string};
  levels:GenealogyLevel[];
  viewMaxLevel:number;
  viewLimitPerLevel:number;
  complete:boolean;
};

/**
 * Read-only sponsor hierarchy. This returns only the signed-in MEMBER's own
 * verified/active descendant links. It does NOT calculate eligible ranks,
 * counts toward compensation, or create/modify sponsorship relationships.
 */
@Injectable()
export class GenealogyService {
 constructor(private readonly db:Database){}
 async read(memberId:string):Promise<GenealogyResponse>{
  const root=await this.db.user.findUniqueOrThrow({
   where:{id:memberId},select:{memberCode:true,name:true}
  });
  const levels:GenealogyLevel[]=[];
  const seen=new Set<string>([memberId]);
  let parents=[memberId];
  let complete=true;
  for(let level=1;level<=config.GENEALOGY_VIEW_MAX_LEVEL;level++){
   if(parents.length===0){
    levels.push({level,members:[],displayed:0,truncated:false});
    continue;
   }
   const links=await this.db.memberSponsorLink.findMany({
    where:{
     sponsorId:{in:parents},
     member:visibleConfirmedMember
    },
    orderBy:[{linkedAt:"asc"},{memberId:"asc"}],
    take:config.GENEALOGY_VIEW_MAX_NODES_PER_LEVEL+1,
    select:{
     memberId:true,
     member:{select:{memberCode:true,name:true}},
     sponsor:{select:{memberCode:true}}
    }
   });
   const truncated=links.length>config.GENEALOGY_VIEW_MAX_NODES_PER_LEVEL;
   if(truncated)complete=false;
   const fresh=links.slice(0,config.GENEALOGY_VIEW_MAX_NODES_PER_LEVEL)
    .filter(link=>!seen.has(link.memberId));
   for(const link of fresh)seen.add(link.memberId);
   const members=fresh.map(link=>({
    memberCode:link.member.memberCode,
    name:link.member.name,
    sponsorCode:link.sponsor.memberCode
   }));
   levels.push({level,members,displayed:members.length,truncated});
   parents=fresh.map(link=>link.memberId);
   // Further levels may also be incomplete when an earlier level was capped.
  }
  return {
   root,
   levels,
   viewMaxLevel:config.GENEALOGY_VIEW_MAX_LEVEL,
   viewLimitPerLevel:config.GENEALOGY_VIEW_MAX_NODES_PER_LEVEL,
   complete
  };
 }
}
