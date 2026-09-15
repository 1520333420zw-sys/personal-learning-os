import type { EntityId } from "@/domain/common/entity";

export type StudyTargetRef =
  | { type: "subject"; subjectId: EntityId }
  | { type: "chapter"; subjectId: EntityId; chapterId: EntityId }
  | {
      type: "knowledgePoint";
      subjectId: EntityId;
      chapterId: EntityId;
      knowledgePointId: EntityId;
    }
  | { type: "vocabulary"; vocabularyItemId: EntityId }
  | {
      type: "recitation";
      recitationMaterialId: EntityId;
      recitationSectionId?: EntityId;
    }
  | {
      type: "questionBank";
      questionBankId: EntityId;
      subjectId?: EntityId;
    }
  | {
      type: "question";
      questionId: EntityId;
      subjectId: EntityId;
    }
  | { type: "reading"; articleId: EntityId }
  | { type: "book"; bookId: EntityId }
  | { type: "custom"; label: string };
