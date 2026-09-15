import {
  Badge,
  Button,
  Card,
  Divider,
  Input,
  Progress,
  SectionHeader,
  Textarea,
} from "@/components/ui";

const colors = [
  { name: "Canvas", className: "bg-canvas" },
  { name: "Surface", className: "bg-surface" },
  { name: "Soft beige", className: "bg-surface-muted" },
  { name: "Accent", className: "bg-accent" },
  { name: "Success", className: "bg-success" },
  { name: "Warning", className: "bg-warning" },
];

export function DesignSystemPreview() {
  return (
    <main className="app-container">
      <div className="page-container section-stack">
        <header className="max-w-3xl pt-4 tablet:pt-8">
          <Badge variant="accent" size="md">
            Phase 1B
          </Badge>
          <h1 className="type-display mt-5 text-primary">
            Quiet tools for
            <br />
            thoughtful learning.
          </h1>
          <p className="type-body mt-6 max-w-2xl text-secondary">
            Personal Learning OS 的基础设计语言：温和、清晰、留有呼吸感，
            让中文与 English content 都适合长时间阅读。
          </p>
        </header>

        <section aria-labelledby="colors-title">
          <SectionHeader
            titleId="colors-title"
            eyebrow="Foundation"
            title="Semantic colors"
            description="低饱和的暖色中性色构成主要界面，状态色仅在需要表达意义时出现。"
          />
          <div
            className="mt-6 grid grid-cols-2 gap-3 tablet:grid-cols-4 desktop:grid-cols-6"
          >
            {colors.map((color) => (
              <Card key={color.name} padding="sm">
                <div
                  className={"mb-4 aspect-[4/3] rounded-md border border-border " + color.className}
                />
                <p className="type-small font-medium text-secondary">{color.name}</p>
              </Card>
            ))}
          </div>
        </section>

        <section aria-labelledby="typography-title">
          <SectionHeader
            titleId="typography-title"
            eyebrow="Typography"
            title="A calm, readable hierarchy"
            description="字重保持克制，以字号、行高和留白建立层级。"
          />
          <Card className="mt-6 overflow-hidden" padding="lg">
            <div className="grid gap-7">
              <div>
                <span className="type-caption text-muted">DISPLAY</span>
                <p className="type-display mt-2">专注，也是一种节奏。</p>
              </div>
              <Divider />
              <div>
                <span className="type-caption text-muted">H1</span>
                <h2 className="type-h1 mt-2">Build a life of learning.</h2>
              </div>
              <div className="grid gap-6 tablet:grid-cols-2">
                <div>
                  <span className="type-caption text-muted">H2</span>
                  <h3 className="type-h2 mt-2">今天的学习</h3>
                </div>
                <div>
                  <span className="type-caption text-muted">H3</span>
                  <h4 className="type-h3 mt-2">Reading notes</h4>
                </div>
              </div>
              <div className="reading-container ml-0">
                <span className="type-caption text-muted">BODY</span>
                <p className="type-body mt-2 text-secondary">
                  好的学习界面不需要争夺注意力。它应该让内容成为主角，让操作自然发生，
                  并在一天结束时留下清晰、可信的学习记录。
                </p>
              </div>
              <div className="flex flex-wrap items-baseline gap-x-8 gap-y-3">
                <span className="type-small text-secondary">Small text · 辅助说明</span>
                <span className="type-caption text-muted">Caption · 12px</span>
                <span className="type-label text-primary">LABEL · 表单标签</span>
              </div>
            </div>
          </Card>
        </section>

        <section aria-labelledby="controls-title">
          <SectionHeader
            titleId="controls-title"
            eyebrow="Primitives"
            title="Controls and feedback"
            description="交互目标适合触控，状态变化轻微但清楚，并保留可见的键盘焦点。"
            action={<Button variant="secondary">Secondary action</Button>}
          />
          <div
            className="mt-6 grid gap-5 desktop:grid-cols-[1.05fr_0.95fr]"
          >
            <Card padding="lg">
              <h3 className="type-h3">Buttons & badges</h3>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Delete</Button>
                <Button disabled>Disabled</Button>
              </div>
              <div className="mt-7 flex flex-wrap gap-2">
                <Badge>Neutral</Badge>
                <Badge variant="accent">In progress</Badge>
                <Badge variant="success">Complete</Badge>
                <Badge variant="warning">Review soon</Badge>
                <Badge variant="error">Needs attention</Badge>
              </div>
              <Divider className="my-8" />
              <div className="grid gap-5">
                <Progress label="Daily progress" value={68} showValue />
                <Progress label="Quiet progress" value={42} size="sm" />
              </div>
            </Card>

            <Card variant="elevated" padding="lg">
              <h3 className="type-h3">Form fields</h3>
              <form className="mt-6 grid gap-5">
                <Input
                  label="Title"
                  placeholder="写下一个清晰的标题"
                  hint="中英文内容都保持舒适的输入节奏。"
                />
                <Textarea
                  label="Notes"
                  placeholder="Capture a thought..."
                  rows={4}
                />
                <Input label="Disabled field" value="Unavailable" disabled readOnly />
              </form>
            </Card>
          </div>
        </section>

        <section aria-labelledby="surfaces-title">
          <SectionHeader
            titleId="surfaces-title"
            eyebrow="Surfaces"
            title="Lightweight content layers"
            description="边框、底色与阴影共同表达层级，不依赖强烈色块。"
          />
          <div
            className="mt-6 grid gap-4 tablet:grid-cols-3"
          >
            <Card>
              <Badge>Default</Badge>
              <h3 className="type-h3 mt-5">Clear boundary</h3>
              <p className="type-small mt-2 text-secondary">
                适合大多数内容区和信息卡片。
              </p>
            </Card>
            <Card variant="muted">
              <Badge variant="accent">Muted</Badge>
              <h3 className="type-h3 mt-5">Gentle grouping</h3>
              <p className="type-small mt-2 text-secondary">
                用柔和底色组织次级信息。
              </p>
            </Card>
            <Card variant="elevated">
              <Badge variant="success">Elevated</Badge>
              <h3 className="type-h3 mt-5">Focused moment</h3>
              <p className="type-small mt-2 text-secondary">
                只在需要强调当前操作时使用。
              </p>
            </Card>
          </div>
        </section>

        <section aria-labelledby="spacing-title">
          <SectionHeader
            titleId="spacing-title"
            eyebrow="Rhythm"
            title="Spacing scale"
            description="统一间距让页面保持秩序，也为不同设备保留恰当的呼吸空间。"
          />
          <Card className="mt-6" padding="lg">
            <div className="grid gap-4">
              {[
                ["8", "w-8"],
                ["16", "w-16"],
                ["24", "w-24"],
                ["32", "w-32"],
                ["48", "w-48"],
              ].map(([label, width]) => (
                <div key={label} className="flex min-w-0 items-center gap-4">
                  <span className="type-caption w-8 shrink-0 text-muted">{label}</span>
                  <div className={"h-3 max-w-full rounded-full bg-accent " + width} />
                </div>
              ))}
            </div>
          </Card>
        </section>

        <footer className="border-t border-border pt-8">
          <p className="type-caption text-muted">
            Personal Learning OS · Design System Preview
          </p>
        </footer>
      </div>
    </main>
  );
}
