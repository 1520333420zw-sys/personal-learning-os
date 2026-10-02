import { getPlanningContext } from "@/data/server/planning-context-store";
import { authorizeLearningRead, json, ownerId } from "../shared";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(request:Request){const auth=await authorizeLearningRead(request);if(auth.response)return auth.response;try{const context=await getPlanningContext(auth.env.EXTERNAL_INBOX_DB!,ownerId);return context?json(context):json({error:"planning_context_not_synced"},404);}catch(error){console.error("planning_context_read_failed",error);return json({error:"storage_error"},503);}}
