import { describe, it, expect } from 'vitest';
import { render, act } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Form } from './index';
import { Input } from '../Input';

describe('Form a11y', () => {
  it('带 label 关联的字段无 axe 违规', async () => {
    const { container } = render(
      <Form layout="vertical">
        <Form.Item label="姓名" name="name">
          <Input />
        </Form.Item>
        <Form.Item label="邮箱" name="email">
          <Input />
        </Form.Item>
      </Form>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('校验错误态（aria-invalid + aria-errormessage）无 axe 违规', async () => {
    const { container } = render(
      <Form layout="vertical">
        <Form.Item
          label="用户名"
          name="username"
          rules={[{ required: true, message: '用户名必填' }]}
        >
          <Input />
        </Form.Item>
      </Form>,
    );
    const form = container.querySelector('form') as HTMLFormElement;
    await act(async () => {
      fireEvent.submit(form);
    });
    expect(await axe(container)).toHaveNoViolations();
  });
});
