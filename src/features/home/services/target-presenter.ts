import type { CoreLearningRepositories } from "@/data";
import type { StudyTargetRef, UserId } from "@/domain";
import type { HomeMessages } from "@/i18n";

export class StudyTargetPresenter {
  constructor(
    private readonly repositories: CoreLearningRepositories,
    private readonly userId: UserId,
    private readonly messages: HomeMessages,
  ) {}

  async resolve(target: StudyTargetRef): Promise<string> {
    if (
      target.type === "chapter" &&
      target.chapterId === "chapter-politics-marxism"
    ) {
      return this.messages.knownTargets.marxism;
    }
    if (
      target.type === "knowledgePoint" &&
      target.knowledgePointId === "knowledge-psych-demo-1"
    ) {
      return this.messages.knownTargets.generalPsychology;
    }

    switch (target.type) {
      case "subject":
        return this.subjectName(target.subjectId);
      case "chapter": {
        const chapter = await this.repositories.chapters.findById(
          this.userId,
          target.chapterId,
        );
        return chapter?.title ?? this.messages.targetType.chapter;
      }
      case "knowledgePoint": {
        const point = await this.repositories.knowledgePoints.findById(
          this.userId,
          target.knowledgePointId,
        );
        return point?.title.replace(/^Demo · /, "") ?? this.messages.targetType.knowledgePoint;
      }
      case "questionBank": {
        const bank = await this.repositories.questionBanks.findById(
          this.userId,
          target.questionBankId,
        );
        return bank?.title.replace(/^Demo · /, "") ?? this.messages.targetType.questionBank;
      }
      case "custom":
        return target.label;
      default:
        return this.messages.targetType[target.type];
    }
  }

  subjectName(subjectId: string): string {
    if (subjectId === "subject-psychology-312") return this.messages.subject.psychology;
    if (subjectId === "subject-politics") return this.messages.subject.politics;
    if (subjectId === "subject-english") return this.messages.subject.english;
    return this.messages.targetType.subject;
  }
}
