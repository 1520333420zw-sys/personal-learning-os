"use client";

import { useState } from "react";
import { Badge, Card } from "@/components/ui";
import type { Locale } from "@/i18n/config";
import { useBetaData } from "@/providers";
import { BetaPage, fieldClass, Field } from "./shared";
import { QuestionEngine } from "./question-engine";

export function QuestionCenter({ locale, wrongOnly = false }: { locale: Locale; wrongOnly?: boolean }) {
  const { state } = useBetaData(); const [subjectId, setSubjectId] = useState("all"); const en = locale === "en";
  const activeWrong = state.wrongQuestions.filter((item) => !item.mastered);
  const attempts = state.questionAttempts;
  const title = wrongOnly ? (en ? "Mistake Review" : "错题本") : (en ? "Unified Question Bank" : "统一题库");
  const description = wrongOnly
    ? (en ? "Retry questions answered incorrectly and mark them mastered after review." : "集中重做答错的系统练习，并在复习后标记掌握。")
    : (en ? "Practice every subject through one question, attempt, mistake and review workflow." : "所有科目共用题目、作答、错题与复习记录。系统内容均标记为系统练习。不可冒充真题。" );
  return <BetaPage title={title} description={description}>
    <div className="grid grid-cols-2 gap-3 tablet:max-w-xl"><Card padding="sm"><p className="type-caption text-muted">{en ? "Attempts" : "作答次数"}</p><p className="type-h2 mt-1 text-primary">{attempts.length}</p></Card><Card padding="sm"><p className="type-caption text-muted">{en ? "Unmastered mistakes" : "待掌握错题"}</p><p className="type-h2 mt-1 text-primary">{activeWrong.length}</p></Card></div>
    <div className="flex flex-col gap-3 tablet:flex-row tablet:items-end tablet:justify-between"><Field label={en ? "Subject" : "科目"} className="tablet:w-72"><select className={fieldClass} value={subjectId} onChange={(event) => setSubjectId(event.target.value)}><option value="all">{en ? "All subjects" : "全部科目"}</option>{state.subjects.map((subject) => <option key={subject.id} value={subject.id}>{en ? subject.nameEn : subject.name}</option>)}</select></Field><Badge variant="warm">{en ? "Original system practice" : "系统原创练习"}</Badge></div>
    <QuestionEngine key={`${subjectId}-${wrongOnly}`} locale={locale} subjectId={subjectId === "all" ? undefined : subjectId} wrongOnly={wrongOnly}/>
  </BetaPage>;
}
