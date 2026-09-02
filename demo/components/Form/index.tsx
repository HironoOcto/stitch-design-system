import { useState, type CSSProperties } from 'react';
import {
  Form,
  Input,
  Select,
  Checkbox,
  Radio,
  Switch,
  Button,
} from '@octohirono/stitch-design-system';

export const meta = {
  title: 'Form',
  description:
    '表单容器（组合件）：Form + Form.Item 组织 Input/Select/Checkbox/Radio/Switch，含 3 布局（horizontal / vertical / inline）× 3 尺寸 + 校验（required / email / 自定义）+ 错误/帮助文案 + colon / requiredMark + 提交/重置。只读角色变量，随换肤变化。',
};

const rowLabel: CSSProperties = {
  fontSize: 'var(--stitch-font-size-sm)',
  color: 'var(--stitch-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  margin: '0 0 var(--stitch-spacing-sm)',
};
const section: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--stitch-spacing-xl)',
};
const panel: CSSProperties = {
  maxWidth: 480,
  padding: 'var(--stitch-spacing-lg)',
  border: 'var(--stitch-border-width) solid var(--stitch-border)',
  borderRadius: 'var(--stitch-radius-card)',
  background: 'var(--stitch-bg-card)',
};
const actions: CSSProperties = {
  display: 'flex',
  gap: 'var(--stitch-spacing-md)',
};
const result: CSSProperties = {
  fontSize: 'var(--stitch-font-size-sm)',
  color: 'var(--stitch-text-secondary)',
  fontFamily: 'var(--stitch-font-mono)',
};

const cityOptions = [
  { label: '北京', value: 'bj' },
  { label: '上海', value: 'sh' },
  { label: '广州', value: 'gz' },
];
const hobbyOptions = [
  { label: '阅读', value: 'read' },
  { label: '运动', value: 'sport' },
  { label: '音乐', value: 'music' },
];
const planOptions = [
  { label: '月付', value: 'monthly' },
  { label: '年付', value: 'yearly' },
];

/** 一个完整的受控校验表单：提交后展示 onFinish 拿到的值 */
function ValidatedForm() {
  const [form] = Form.useForm();
  const [submitted, setSubmitted] = useState<Record<string, unknown> | null>(
    null,
  );

  return (
    <div style={panel}>
      <Form
        form={form}
        layout="vertical"
        initialValues={{ plan: 'monthly', subscribe: true }}
        onFinish={(values) => setSubmitted(values)}
        onReset={() => setSubmitted(null)}
      >
        <Form.Item
          label="用户名"
          name="username"
          rules={[{ required: true, message: '请填写用户名' }]}
        >
          <Input placeholder="输入用户名" />
        </Form.Item>

        <Form.Item
          label="邮箱"
          name="email"
          rules={[
            { required: true, message: '请填写邮箱' },
            { type: 'email', message: '邮箱格式不正确' },
          ]}
        >
          <Input placeholder="you@example.com" />
        </Form.Item>

        <Form.Item
          label="城市"
          name="city"
          rules={[{ required: true, message: '请选择城市' }]}
        >
          <Select options={cityOptions} placeholder="请选择" />
        </Form.Item>

        <Form.Item label="套餐" name="plan">
          <Radio options={planOptions} />
        </Form.Item>

        <Form.Item label="爱好" name="hobbies" help="可多选">
          <Checkbox options={hobbyOptions} />
        </Form.Item>

        <Form.Item label="订阅通知" name="subscribe" valuePropName="checked">
          <Switch />
        </Form.Item>

        <div style={actions}>
          <Button htmlType="submit" type="primary">
            提交
          </Button>
          <Button htmlType="reset">重置</Button>
        </div>
      </Form>

      {submitted ? (
        <p style={result}>onFinish: {JSON.stringify(submitted)}</p>
      ) : null}
    </div>
  );
}

export default function FormDemo() {
  return (
    <div style={section}>
      {/* 完整校验表单 */}
      <section>
        <p style={rowLabel}>校验表单（required / email / 提交 / 重置）</p>
        <ValidatedForm />
      </section>

      {/* horizontal 布局 + labelCol/wrapperCol */}
      <section>
        <p style={rowLabel}>横排布局（horizontal · labelCol / wrapperCol）</p>
        <div style={panel}>
          <Form
            layout="horizontal"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
          >
            <Form.Item label="姓名" name="name" required>
              <Input placeholder="姓名" />
            </Form.Item>
            <Form.Item label="城市" name="city">
              <Select options={cityOptions} placeholder="请选择" />
            </Form.Item>
          </Form>
        </div>
      </section>

      {/* inline 布局 */}
      <section>
        <p style={rowLabel}>行内布局（inline）</p>
        <div style={panel}>
          <Form layout="inline">
            <Form.Item label="关键词" name="q">
              <Input placeholder="搜索…" />
            </Form.Item>
            <Form.Item label="城市" name="city">
              <Select options={cityOptions} placeholder="城市" />
            </Form.Item>
            <Form.Item>
              <Button htmlType="submit" type="primary">
                查询
              </Button>
            </Form.Item>
          </Form>
        </div>
      </section>

      {/* 尺寸：驱动控件高度（32 / 40 / 48），透传给 Input/Select；label 字号不随 size 变。
          三档并排,直接对比控件高度差（Ant v5：size 管控件尺寸,不动 label 字号）。 */}
      <section>
        <p style={rowLabel}>
          尺寸（size 驱动控件高度 32 / 40 / 48px，透传子控件；label 字号不随
          size 变）
        </p>
        <div
          style={{
            ...panel,
            display: 'flex',
            gap: 'var(--stitch-spacing-lg)',
            alignItems: 'flex-end',
          }}
        >
          {(
            [
              ['small', 32],
              ['middle', 40],
              ['large', 48],
            ] as const
          ).map(([size, h]) => (
            <Form key={size} layout="vertical" size={size} style={{ flex: 1 }}>
              <Form.Item label={`${size}（高 ${h}px）`} name={size}>
                <Input placeholder={size} />
              </Form.Item>
            </Form>
          ))}
        </div>
      </section>

      {/* 语义校验态：validateStatus 手动指定 success / warning / validating + hasFeedback 反馈图标 */}
      <section>
        <p style={rowLabel}>
          校验态（validateStatus：success / warning / validating +
          error·hasFeedback）
        </p>
        <div style={panel}>
          <Form layout="vertical">
            <Form.Item
              label="用户名"
              name="vs-success"
              validateStatus="success"
              help="该用户名可用"
            >
              <Input defaultValue="linling" />
            </Form.Item>
            <Form.Item
              label="密码强度"
              name="vs-warning"
              validateStatus="warning"
              help="强度偏弱，建议加入符号"
            >
              <Input defaultValue="123456" />
            </Form.Item>
            <Form.Item
              label="昵称"
              name="vs-validating"
              validateStatus="validating"
              help="正在校验是否重复…"
            >
              <Input defaultValue="检查中" />
            </Form.Item>
            <Form.Item
              label="邮箱"
              name="vs-error"
              validateStatus="error"
              hasFeedback
              help="该邮箱已被占用"
            >
              <Input defaultValue="taken@example.com" status="error" />
            </Form.Item>
          </Form>
        </div>
      </section>

      {/* colon / requiredMark / disabled */}
      <section>
        <p style={rowLabel}>colon=false · requiredMark 关 · 整表禁用</p>
        <div style={panel}>
          <Form layout="vertical" colon={false} requiredMark={false} disabled>
            <Form.Item label="不带冒号且禁用" name="d1" required>
              <Input placeholder="disabled" />
            </Form.Item>
            <Form.Item label="选择也禁用" name="d2">
              <Select options={cityOptions} placeholder="disabled" />
            </Form.Item>
          </Form>
        </div>
      </section>
    </div>
  );
}
