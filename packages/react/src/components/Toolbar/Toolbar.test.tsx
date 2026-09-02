import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toolbar } from './Toolbar';
import { Icon } from '../Icon';
import styles from './toolbar.module.less';

// 测试重点 = 我们写的那部分：子组件（Button / Link / Separator / ToggleGroup）组合渲染 +
// role="toolbar" + Less 皮（含复用 Button 族皮 / ToggleGroup 皮）+ ToggleGroup 值归一。
// 键盘（方向键 roving）/ 焦点 / ARIA 归底层 Radix，冒烟即可、不重测。

describe('Toolbar', () => {
  it('Button + Separator + ToggleGroup 混排渲染 + role="toolbar"（新行为，核心 case）', () => {
    render(
      <Toolbar aria-label="格式工具栏">
        <Toolbar.Button>撤销</Toolbar.Button>
        <Toolbar.Separator />
        <Toolbar.ToggleGroup
          type="multiple"
          aria-label="文本格式"
          items={[
            { value: 'bold', label: '加粗' },
            { value: 'italic', label: '斜体' },
          ]}
        />
      </Toolbar>,
    );

    // 容器给 role="toolbar" + 可及名（Radix 挂，冒烟即在）
    const toolbar = screen.getByRole('toolbar', { name: '格式工具栏' });
    expect(toolbar).toBeInTheDocument();
    expect(toolbar).toHaveClass(styles.root);

    // 三类子组件都在这一条工具栏里混排渲染
    expect(screen.getByRole('button', { name: '撤销' })).toBeInTheDocument();
    expect(screen.getByRole('separator')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '加粗' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '斜体' })).toBeInTheDocument();
  });

  it('Toolbar.Button 走工具栏安静命令皮（styles.button）+ 点击触发 onClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Toolbar aria-label="栏">
        <Toolbar.Button onClick={onClick}>保存</Toolbar.Button>
      </Toolbar>,
    );
    const btn = screen.getByRole('button', { name: '保存' });
    // 工具栏自有安静控件皮（非复用 Button 药丸皮）
    expect(btn).toHaveClass(styles.button);
    await user.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('Toolbar.Button danger 挂 danger 类（文字走 --stitch-danger）', () => {
    render(
      <Toolbar aria-label="栏">
        <Toolbar.Button danger>删除</Toolbar.Button>
      </Toolbar>,
    );
    expect(screen.getByRole('button', { name: '删除' })).toHaveClass(
      styles.buttonDanger,
    );
  });

  it('Toolbar.Button icon 经插槽渲染（走 <Icon>，非裸 svg）', () => {
    render(
      <Toolbar aria-label="栏">
        <Toolbar.Button icon={<Icon name="search" />}>搜索</Toolbar.Button>
      </Toolbar>,
    );
    const btn = screen.getByRole('button', { name: /搜索/ });
    expect(btn.querySelector(`.${styles.buttonIcon}`)).not.toBeNull();
  });

  it('Toolbar.Link 渲染成 <a>（带 href）+ 链接皮', () => {
    render(
      <Toolbar aria-label="栏">
        <Toolbar.Link href="/help">帮助</Toolbar.Link>
      </Toolbar>,
    );
    const link = screen.getByRole('link', { name: '帮助' });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/help');
    expect(link).toHaveClass(styles.link);
  });

  it('Toolbar.Separator 渲染成 role="separator" + 分隔线皮', () => {
    render(
      <Toolbar aria-label="栏">
        <Toolbar.Button>甲</Toolbar.Button>
        <Toolbar.Separator />
        <Toolbar.Button>乙</Toolbar.Button>
      </Toolbar>,
    );
    const sep = screen.getByRole('separator');
    expect(sep).toHaveClass(styles.separator);
  });

  it('Toolbar.ToggleGroup 值归一：底层 onValueChange → 我们的 onChange（multiple 回数组）', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Toolbar aria-label="栏">
        <Toolbar.ToggleGroup
          type="multiple"
          aria-label="文本格式"
          onChange={onChange}
          items={[
            { value: 'bold', label: '加粗' },
            { value: 'italic', label: '斜体' },
          ]}
        />
      </Toolbar>,
    );
    await user.click(screen.getByRole('button', { name: '加粗' }));
    // multiple → 回数组
    expect(onChange).toHaveBeenCalledWith(['bold']);
  });

  it('Toolbar.ToggleGroup 分段项走工具栏皮（styles.toggleItem）+ 按下态 data-state=on', async () => {
    const user = userEvent.setup();
    render(
      <Toolbar aria-label="栏">
        <Toolbar.ToggleGroup
          type="single"
          aria-label="对齐"
          items={[
            { value: 'left', label: '左' },
            { value: 'center', label: '中' },
          ]}
        />
      </Toolbar>,
    );
    // single → 项为 role="radio"（同独立 ToggleGroup，ARIA 归 Radix）
    const left = screen.getByRole('radio', { name: '左' });
    expect(left).toHaveClass(styles.toggleItem);
    // 按下前 off、按下后 on（复用 .item[data-state='on'] ink 填充皮）
    expect(left).toHaveAttribute('data-state', 'off');
    await user.click(left);
    expect(left).toHaveAttribute('data-state', 'on');
  });

  it('orientation="vertical" 时容器挂 data-orientation=vertical（皮据此纵排）', () => {
    render(
      <Toolbar aria-label="栏" orientation="vertical">
        <Toolbar.Button>甲</Toolbar.Button>
      </Toolbar>,
    );
    expect(screen.getByRole('toolbar')).toHaveAttribute(
      'data-orientation',
      'vertical',
    );
  });

  it('className 透传到工具栏根（与 root 基础类共存）', () => {
    render(
      <Toolbar aria-label="栏" className="custom-bar">
        <Toolbar.Button>甲</Toolbar.Button>
      </Toolbar>,
    );
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar).toHaveClass(styles.root);
    expect(toolbar).toHaveClass('custom-bar');
  });
});
