"use client";

import { useCallback, useEffect, useRef } from "react";
import { CLOUD_SYNC_STATUS_EVENT, cloudPayload, hasPersonalData, mergeCloudStates, readCloudMetadata, writeCloudMetadata, type CloudSyncStatus } from "@/data/browser/cloud-state-sync";
import { useBetaData } from "@/providers";

export const CLOUD_SYNC_NOW_EVENT = "plos:cloud-sync-now";
const announce = (detail:CloudSyncStatus) => window.dispatchEvent(new CustomEvent(CLOUD_SYNC_STATUS_EVENT,{detail}));

export function CloudSyncAuto(){
  const {state,replaceState}=useBetaData(); const stateRef=useRef(state); const running=useRef(false);
  useEffect(()=>{stateRef.current=state;},[state]);
  const sync=useCallback(async()=>{if(running.current)return;running.current=true;announce({status:"syncing"});try{
    const session=await fetch("/api/account/session",{cache:"no-store",credentials:"same-origin"});const sessionBody=await session.json() as {connected?:boolean;accountId?:string};
    if(!session.ok||!sessionBody.connected||!sessionBody.accountId){announce({status:"disconnected"});return;}
    const remoteResponse=await fetch("/api/account/state",{cache:"no-store",credentials:"same-origin"});if(!remoteResponse.ok)throw new Error("cloud_state_unavailable");
    const remote=await remoteResponse.json() as {accountId:string;revision:number;state:unknown};const metadata=readCloudMetadata();
    const local=stateRef.current;let merged=metadata?.accountId===remote.accountId||hasPersonalData(local)?mergeCloudStates(local,remote.state):mergeCloudStates(remote.state,remote.state);
    const localJson=JSON.stringify(cloudPayload(merged));const remoteJson=JSON.stringify(remote.state);let revision=remote.revision;
    if(localJson!==remoteJson){let response=await fetch("/api/account/state",{method:"PUT",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify({baseRevision:revision,state:cloudPayload(merged),deviceId:metadata?.deviceId??crypto.randomUUID()})});
      if(response.status===409){const conflict=await response.json() as {latest?:{revision:number;state:unknown}};if(!conflict.latest)throw new Error("cloud_conflict_missing_state");merged=mergeCloudStates(merged,conflict.latest.state);revision=conflict.latest.revision;response=await fetch("/api/account/state",{method:"PUT",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify({baseRevision:revision,state:cloudPayload(merged),deviceId:metadata?.deviceId??crypto.randomUUID()})});}
      if(!response.ok)throw new Error("cloud_update_failed");revision=(await response.json() as {revision:number}).revision;
    }
    if(JSON.stringify(cloudPayload(local))!==JSON.stringify(cloudPayload(merged)))replaceState(merged);
    writeCloudMetadata({accountId:remote.accountId,deviceId:metadata?.deviceId??crypto.randomUUID(),revision});announce({status:"synced",revision});
  }catch(error){console.error("cloud_sync_failed",error instanceof Error?error.message:"unknown");announce({status:"failed"});}finally{running.current=false;}},[replaceState]);
  useEffect(()=>{const timer=window.setTimeout(()=>void sync(),1800);return()=>window.clearTimeout(timer);},[state,sync]);
  useEffect(()=>{const now=()=>void sync();const visible=()=>{if(document.visibilityState==="visible")void sync();};window.addEventListener(CLOUD_SYNC_NOW_EVENT,now);document.addEventListener("visibilitychange",visible);return()=>{window.removeEventListener(CLOUD_SYNC_NOW_EVENT,now);document.removeEventListener("visibilitychange",visible);};},[sync]);
  return null;
}
