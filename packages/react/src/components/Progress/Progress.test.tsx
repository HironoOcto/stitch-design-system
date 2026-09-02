import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Progress } from './Progress';
import styles from './progress.module.less';

describe('Progress', () => {
  describe('渲染与边界', () => {
    it('role=progressbar，负值 clamp 到 0', () => {
      render(<Progress percent={-10} />);
      const bar = screen.getByRole('progressbar');
      expect(bar).toBeInTheDocument();
      expect(bar).toHaveAttribute('aria-valuemin', '0');
      expect(bar).toHaveAttribute('aria-valuemax', '100');
      expect(bar).toHaveAttribute('aria-valuenow', '0');
    });

    it('超过 100 clamp 到 100', () => {
      render(<Progress percent={150} />);
      expect(screen.getByRole('progressbar')).toHaveAttribute(
        'aria-valuenow',
        '100',
      );
    });

    it('非整数 percent 四舍五入到 aria-valuenow', () => {
      render(<Progress percent={33.7} />);
      expect(screen.getByRole('progressbar')).toHaveAttribute(
        'aria-valuenow',
        '34',
      );
    });

    it('NaN 时安全回退为 0', () => {
      render(<Progress percent={Number.NaN} />);
      expect(screen.getByRole('progressbar')).toHaveAttribute(
        'aria-valuenow',
        '0',
      );
    });

    it('透传 className 与 style', () => {
      const { container } = render(
        <Progress
          percent={50}
          className="custom-class"
          style={{ width: 320 }}
        />,
      );
      const root = container.firstChild as HTMLElement;
      expect(root).toHaveClass('custom-class');
      expect(root).toHaveStyle({ width: '320px' });
    });
  });

  describe('a11y 契约', () => {
    it('aria-label 提供可及名', () => {
      render(<Progress percent={50} aria-label="任务进度" />);
      const bar = screen.getByRole('progressbar');
      expect(bar).toHaveAccessibleName('任务进度');
    });

    it('aria-labelledby 关联外部标题', () => {
      render(
        <>
          <span id="external-title-id">下载进度</span>
          <Progress percent={50} aria-labelledby="external-title-id" />
        </>,
      );
      expect(screen.getByRole('progressbar')).toHaveAccessibleName('下载进度');
    });
  });

  describe('百分比文字', () => {
    it('默认显示 percent + %', () => {
      render(<Progress percent={42} />);
      expect(screen.getByText('42%')).toBeInTheDocument();
    });

    it('showInfo=false 隐藏文字', () => {
      const { container } = render(<Progress percent={50} showInfo={false} />);
      expect(container.textContent).not.toMatch(/\d+%/);
    });

    it('format 接收 percent 并渲染自定义内容', () => {
      render(<Progress percent={7} format={(p) => `${Math.round(p)}/10`} />);
      expect(screen.getByText('7/10')).toBeInTheDocument();
    });

    it('infoPosition=right 把文字放在 track 右侧', () => {
      const { container } = render(
        <Progress percent={50} infoPosition="right" />,
      );
      expect(screen.getByText('50%')).toBeInTheDocument();
      expect(container.querySelector(`.${styles.row}`)).toBeInTheDocument();
    });
  });

  describe('尺寸 → class 映射', () => {
    for (const [size, cls] of [
      ['small', 'size-small'],
      ['middle', 'size-middle'],
      ['large', 'size-large'],
    ] as const) {
      it(`size=${size} 给 track 加 ${cls}`, () => {
        const { container } = render(
          <Progress percent={50} size={size as never} />,
        );
        expect(container.querySelector(`.${styles[cls]}`)).toBeInTheDocument();
      });
    }

    it('默认 size=middle', () => {
      const { container } = render(<Progress percent={50} />);
      expect(
        container.querySelector(`.${styles['size-middle']}`),
      ).toBeInTheDocument();
    });
  });

  describe('动画', () => {
    it('duration=0 给 fill 加 noTransition', () => {
      const { container } = render(<Progress percent={50} duration={0} />);
      expect(
        container.querySelector(`.${styles.noTransition}`),
      ).toBeInTheDocument();
    });

    it('duration 作为 transition-duration 内联到 fill', () => {
      const { container } = render(<Progress percent={50} duration={1.2} />);
      const fillEl = container.querySelector(`.${styles.fill}`) as HTMLElement;
      expect(fillEl.style.transitionDuration).toBe('1.2s');
    });
  });

  describe('fill 宽度', () => {
    it('percent 转成 fill 的内联宽度', () => {
      const { container } = render(<Progress percent={42} />);
      const fillEl = container.querySelector(`.${styles.fill}`) as HTMLElement;
      expect(fillEl.style.width).toBe('42%');
    });
  });

  describe('inside 低占比回退', () => {
    it('percent < 18% 时文字退到 fill 外侧（infoOutside，用 track 文字色）', () => {
      const { container } = render(
        <Progress percent={10} infoPosition="inside" />,
      );
      const infoNodes = container.querySelectorAll(`.${styles.infoInside}`);
      expect(infoNodes.length).toBe(1);
      expect(infoNodes[0]!.textContent).toBe('10%');
      expect(infoNodes[0]).toHaveClass(styles.infoOutside);
    });

    it('percent >= 18% 时文字在 fill 内（无 infoOutside）', () => {
      const { container } = render(
        <Progress percent={50} infoPosition="inside" />,
      );
      const infoNodes = container.querySelectorAll(`.${styles.infoInside}`);
      expect(infoNodes.length).toBe(1);
      expect(infoNodes[0]!.textContent).toBe('50%');
      expect(infoNodes[0]).not.toHaveClass(styles.infoOutside);
    });
  });
});
