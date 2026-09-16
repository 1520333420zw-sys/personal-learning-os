import type { CoreLearningDataContext } from "@/data";
import type { ISODateString, TaskStatus } from "@/domain";
import type { Dictionary } from "@/i18n";

import type {
  StudyPlanDayData,
  StudyPlanTaskViewModel,
  StudyTaskDraft,
} from "./types";

const ACTIVE_PLAN_ID = "plan-current-study-cycle";

export class StudyPlanService {
  constructor(
    private readonly context: CoreLearningDataContext,
    private readonly dictionary: Dictionary,
  ) {}

  async getDay(date: ISODateString): Promise<StudyPlanDayData> {
    const { repositories, userId } = this.context;
    const [tasks, subjects] = await Promise.all([
      repositories.tasks.listByDate(userId, date),
      repositories.subjects.list(userId),
    ]);
    const subjectNames = new Map(
      subjects.map((subject) => [subject.id, this.subjectName(subject.id, subject.name)]),
    );
    const viewTasks = tasks
      .filter((task) => task.status !== "cancelled")
      .map((task): StudyPlanTaskViewModel => ({
        id: task.id,
        ...this.presentTask(task.id, task.title, task.description),
        subjectId: task.subjectId,
        subjectName: task.subjectId ? (subjectNames.get(task.subjectId) ?? "") : "",
        date: task.scheduledDate,
        plannedMinutes: task.estimatedMinutes,
        priority: task.priority,
        status: task.status,
      }))
      .sort((a, b) => {
        const statusOrder = { in_progress: 0, todo: 1, completed: 2, cancelled: 3 };
        return statusOrder[a.status] - statusOrder[b.status];
      });

    return {
      date,
      tasks: viewTasks,
      subjects: subjects.map(({ id, name }) => ({
        id,
        name: subjectNames.get(id) ?? name,
      })),
      summary: {
        total: viewTasks.length,
        completed: viewTasks.filter((task) => task.status === "completed").length,
        remaining: viewTasks.filter((task) => task.status !== "completed").length,
        plannedMinutes: viewTasks.reduce(
          (total, task) => total + task.plannedMinutes,
          0,
        ),
      },
    };
  }

  async createTask(draft: StudyTaskDraft) {
    const title = draft.title.trim();
    if (!title) throw new Error("TITLE_REQUIRED");
    this.validateDuration(draft.plannedMinutes);

    return this.context.repositories.tasks.create(this.context.userId, {
      planId: ACTIVE_PLAN_ID,
      title,
      description: draft.description?.trim() || undefined,
      subjectId: draft.subjectId || undefined,
      scheduledDate: draft.date,
      estimatedMinutes: draft.plannedMinutes,
      priority: draft.priority,
      sourceType: "manual",
      target: draft.subjectId
        ? { type: "subject", subjectId: draft.subjectId }
        : { type: "custom", label: title },
    });
  }

  async updateTask(id: string, draft: StudyTaskDraft) {
    const title = draft.title.trim();
    if (!title) throw new Error("TITLE_REQUIRED");
    this.validateDuration(draft.plannedMinutes);

    return this.context.repositories.tasks.update(this.context.userId, id, {
      title,
      description: draft.description?.trim() || undefined,
      subjectId: draft.subjectId || undefined,
      scheduledDate: draft.date,
      estimatedMinutes: draft.plannedMinutes,
      priority: draft.priority,
      target: draft.subjectId
        ? { type: "subject", subjectId: draft.subjectId }
        : { type: "custom", label: title },
    });
  }

  deleteTask(id: string) {
    return this.context.repositories.tasks.delete(this.context.userId, id);
  }

  setStatus(id: string, status: TaskStatus) {
    return this.context.repositories.tasks.update(this.context.userId, id, {
      status,
      completedAt: status === "completed" ? new Date().toISOString() : undefined,
    });
  }

  private validateDuration(minutes: number) {
    if (!Number.isInteger(minutes) || minutes < 5 || minutes > 480) {
      throw new Error("DURATION_INVALID");
    }
  }

  private subjectName(id: string, fallback: string) {
    if (id === "subject-psychology-312") return this.dictionary.home.subject.psychology;
    if (id === "subject-politics") return this.dictionary.home.subject.politics;
    if (id === "subject-english") return this.dictionary.home.subject.english;
    return fallback;
  }

  private presentTask(id: string, title: string, description?: string) {
    const demoKey = {
      "task-psychology-today": "psychology",
      "task-politics-today": "politics",
      "task-vocabulary-today": "vocabulary",
      "task-reading-tomorrow": "reading",
    }[id] as keyof Dictionary["studyPlan"]["demoTasks"] | undefined;

    return demoKey
      ? this.dictionary.studyPlan.demoTasks[demoKey]
      : { title: title.replace(/^Demo · /, ""), description };
  }
}
