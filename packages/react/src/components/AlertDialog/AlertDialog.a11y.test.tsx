import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { AlertDialog } from './AlertDialog';

describe('AlertDialog a11y', () => {
  it('打开态无 axe 违规', async () => {
    const { baseElement } = render(
      <AlertDialog open title="确认删除">
        <p>此操作不可撤销，确定继续吗？</p>
      </AlertDialog>,
    );
    // portal 挂到 body，用 baseElement 覆盖整棵含 portal 的树
    expect(await axe(baseElement)).toHaveNoViolations();
  });

  it('role="alertdialog" + aria-describedby 关联正文', () => {
    render(
      <AlertDialog open title="确认删除">
        <p>此操作不可撤销。</p>
      </AlertDialog>,
    );
    const dialog = screen.getByRole('alertdialog');
    const describedBy = dialog.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy!)).toHaveTextContent(
      '此操作不可撤销。',
    );
    expect(dialog).toHaveAccessibleName('确认删除');
  });
});
