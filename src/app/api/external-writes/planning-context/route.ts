import { NextResponse } from "next/server";
import { learningMirrorEnvironment, mirrorConfigured } from "@/data/server/learning-mirror-store";
import { syncAuthorized } from "@/data/server/external-write-store";
import { savePlanningContext } from "@/data/server/planning-context-store";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function POST(request:Request){const env=await learningMirrorEnvironment();if(!mirrorConfigured(env)||!env.EXTERNAL_SYNC_TOKEN)return NextResponse.json({error:"not_configured"},{status:503});if(!await syncAuthorized(request,env.EXTERNAL_SYNC_TOKEN))return NextResponse.json({error:"unauthorized"},{status:401});let value:unknown;try{value=await request.json();}catch{return NextResponse.json({error:"invalid_json"},{status:400});}if(!value||typeof value!=="object"||JSON.stringify(value).length>300_000)return NextResponse.json({error:"invalid_context"},{status:422});try{return NextResponse.json(await savePlanningContext(env.EXTERNAL_INBOX_DB!,"local-owner",value));}catch(error){console.error("planning_context_sync_failed",error);return NextResponse.json({error:"storage_error"},{status:503});}}
