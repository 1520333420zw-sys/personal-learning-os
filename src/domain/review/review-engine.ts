import type { BetaReviewItem, ReviewKind } from "@/domain/beta";

export type ReviewRating = "again" | "hard" | "good" | "easy";
const day=86_400_000;
export const EBBINGHAUS_INTERVALS = [0, 1, 2, 4, 7, 15, 30] as const;
export interface ReviewSchedule { intervalDays:number; ease:number; difficulty:number; nextReviewAt:string; scheduleStep:number; scheduleReason:string; }

export function scheduleReview(item:Pick<BetaReviewItem,"intervalDays"|"ease"|"difficulty"|"reviewCount"|"scheduleStep">,rating:ReviewRating,now=new Date()):ReviewSchedule{
  const currentEase=item.ease??2.3;const currentDifficulty=item.difficulty??5;const currentInterval=item.intervalDays??0;const count=item.reviewCount??0;
  const ease=Math.min(3,Math.max(1.3,currentEase+(rating==="easy"?.15:rating==="hard"?-.15:rating==="again"?-.2:0)));
  const difficulty=Math.min(10,Math.max(1,currentDifficulty+(rating==="again"?1.2:rating==="hard"?.5:rating==="easy"?-.5:-.2)));
  const currentStep=Math.min(item.scheduleStep??count,EBBINGHAUS_INTERVALS.length-1);
  let scheduleStep=currentStep;
  if(rating==="again")scheduleStep=Math.max(0,currentStep-1);
  else if(rating==="hard")scheduleStep=Math.max(1,currentStep);
  else scheduleStep=Math.min(EBBINGHAUS_INTERVALS.length-1,currentStep+1+(rating==="easy"?1:0));
  const baseline=EBBINGHAUS_INTERVALS[scheduleStep];
  let intervalDays:number=baseline;
  if(rating==="again")intervalDays=currentStep<=1?0:Math.max(1,Math.floor(currentInterval/2));
  else if(rating==="hard")intervalDays=Math.max(1,Math.min(baseline,Math.ceil(Math.max(1,currentInterval)*.75)));
  else if(rating==="easy")intervalDays=Math.max(baseline,Math.round(Math.max(1,baseline)*1.35));
  const scheduleReason=rating==="again"?"回忆失败，提前重现":rating==="hard"?"回忆困难，缩短间隔":rating==="easy"?"回忆轻松，适度延长":"按艾宾浩斯节点复习";
  const next=new Date(now.getTime()+intervalDays*day);return{intervalDays,ease,difficulty,nextReviewAt:localKey(next),scheduleStep,scheduleReason};
}

export function applyReviewRating(item:BetaReviewItem,rating:ReviewRating,now=new Date()){
  const next=scheduleReview(item,rating,now);item.intervalDays=next.intervalDays;item.ease=next.ease;item.difficulty=next.difficulty;
  item.scheduleStep=next.scheduleStep;item.scheduleReason=next.scheduleReason;item.dueDate=next.nextReviewAt;item.lastReviewedAt=now.toISOString();item.reviewCount=(item.reviewCount??0)+1;item.status=rating==="easy"&&item.reviewCount>=4?"mastered":"due";item.completedAt=now.toISOString();item.updatedAt=now.toISOString();
}

export function reviewDefaults(kind:ReviewKind):Pick<BetaReviewItem,"reviewCount"|"ease"|"difficulty"|"intervalDays"|"scheduleStep"|"scheduleReason"|"source">{
  return{reviewCount:0,ease:2.3,difficulty:kind==="question"?6:5,intervalDays:0,scheduleStep:0,scheduleReason:"首次学习后的短时回顾",source:kind==="question"?"mistake":kind==="knowledge"?"knowledge":kind};
}
function localKey(date:Date){const shifted=new Date(date.getTime()-date.getTimezoneOffset()*60_000);return shifted.toISOString().slice(0,10);}
