import type { BetaReviewItem, ReviewKind } from "@/domain/beta";

export type ReviewRating = "again" | "hard" | "good" | "easy";
const day=86_400_000;
export interface ReviewSchedule { intervalDays:number; ease:number; difficulty:number; nextReviewAt:string; }

export function scheduleReview(item:Pick<BetaReviewItem,"intervalDays"|"ease"|"difficulty"|"reviewCount">,rating:ReviewRating,now=new Date()):ReviewSchedule{
  const currentEase=item.ease??2.3;const currentDifficulty=item.difficulty??5;const currentInterval=item.intervalDays??0;const count=item.reviewCount??0;
  const ease=Math.min(3,Math.max(1.3,currentEase+(rating==="easy"?.15:rating==="hard"?-.15:rating==="again"?-.2:0)));
  const difficulty=Math.min(10,Math.max(1,currentDifficulty+(rating==="again"?1.2:rating==="hard"?.5:rating==="easy"?-.5:-.2)));
  let intervalDays=1;
  if(rating==="again")intervalDays=1;
  else if(rating==="hard")intervalDays=Math.max(1,Math.round(Math.max(1,currentInterval)*1.5));
  else if(rating==="good")intervalDays=count===0?2:count===1?5:Math.max(6,Math.round(currentInterval*ease));
  else intervalDays=count===0?4:count===1?9:Math.max(10,Math.round(currentInterval*ease*1.35));
  const next=new Date(now.getTime()+intervalDays*day);return{intervalDays,ease,difficulty,nextReviewAt:localKey(next)};
}

export function applyReviewRating(item:BetaReviewItem,rating:ReviewRating,now=new Date()){
  const next=scheduleReview(item,rating,now);item.intervalDays=next.intervalDays;item.ease=next.ease;item.difficulty=next.difficulty;
  item.dueDate=next.nextReviewAt;item.lastReviewedAt=now.toISOString();item.reviewCount=(item.reviewCount??0)+1;item.status=rating==="easy"&&item.reviewCount>=4?"mastered":"due";item.completedAt=now.toISOString();item.updatedAt=now.toISOString();
}

export function reviewDefaults(kind:ReviewKind):Pick<BetaReviewItem,"reviewCount"|"ease"|"difficulty"|"intervalDays"|"source">{
  return{reviewCount:0,ease:2.3,difficulty:kind==="question"?6:5,intervalDays:0,source:kind==="question"?"mistake":kind==="knowledge"?"knowledge":kind};
}
function localKey(date:Date){const shifted=new Date(date.getTime()-date.getTimezoneOffset()*60_000);return shifted.toISOString().slice(0,10);}
