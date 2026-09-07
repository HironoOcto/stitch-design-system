// @octohirono/stitch-design-system —— 包根桶文件。
//
// 组件按四件套建在 src/components/<X>/，每个组件在这里显式一双 export
// （`export { X }` + `export type { XProps }`，不用 `export *`——见
// docs/contributing/component-authoring.md §3.6）。

// 主题 :root 进 bundle —— 排在组件 css 前，作默认兜底（构建时由
// vite-plugin-stitch-theme 读 activeSite 合并出单份 :root，见 packaging.md）。
import 'virtual:stitch-theme';

// ============================================
// 基础 UI 组件（general）
// ============================================
export { Button } from './components/Button';
export type {
  ButtonProps,
  ButtonType,
  ButtonSize,
  ButtonHTMLType,
} from './components/Button';

export { Icon, ICON_LIST } from './components/Icon';
export type { IconProps, IconName } from './components/Icon';

export { Toggle } from './components/Toggle';
export type { ToggleProps } from './components/Toggle';

export { ToggleGroup } from './components/ToggleGroup';
export type {
  ToggleGroupProps,
  ToggleGroupSingleProps,
  ToggleGroupMultipleProps,
  ToggleGroupItem,
} from './components/ToggleGroup';

export { Image } from './components/Image';
export type { ImageProps, ImageColor } from './components/Image';

// ============================================
// 布局（layout）
// ============================================
export { Card } from './components/Card';
export type { CardProps, CardVariant, CardColor } from './components/Card';

export { Divider } from './components/Divider';
export type {
  DividerProps,
  DividerType,
  DividerVariant,
  DividerOrientation,
} from './components/Divider';

export { Collapse } from './components/Collapse';
export type { CollapseProps } from './components/Collapse';

export { Tabs } from './components/Tabs';
export type { TabsProps, TabItem } from './components/Tabs';

export { Accordion } from './components/Accordion';
export type { AccordionProps, AccordionItem } from './components/Accordion';

export { AspectRatio } from './components/AspectRatio';
export type { AspectRatioProps } from './components/AspectRatio';

export { Avatar } from './components/Avatar';
export type { AvatarProps, AvatarSize, AvatarShape } from './components/Avatar';

// ============================================
// 表单控件（form-controls）
// ============================================
export { Input } from './components/Input';
export type { InputProps, InputSize } from './components/Input';

export { PasswordInput } from './components/PasswordInput';
export type { PasswordInputProps } from './components/PasswordInput';

export { OtpField } from './components/OtpField';
export type { OtpFieldProps } from './components/OtpField';

export { Checkbox } from './components/Checkbox';
export type {
  CheckboxProps,
  CheckboxOption,
  CheckboxSize,
} from './components/Checkbox';

export { Radio } from './components/Radio';
export type { RadioProps, RadioOption, RadioSize } from './components/Radio';

export { Switch } from './components/Switch';
export type { SwitchProps, SwitchSize } from './components/Switch';

export { Slider } from './components/Slider';
export type { SliderProps, SliderOrientation } from './components/Slider';

export { Label } from './components/Label';
export type { LabelProps } from './components/Label';

export { Select } from './components/Select';
export type {
  SelectProps,
  SelectOption,
  SelectSize,
} from './components/Select';

export { Form } from './components/Form';
export type {
  FormProps,
  FormItemProps,
  FormInstance,
  FormLayout,
  FormLabelAlign,
  FormSize,
  FormItemLayout,
  RequiredMark,
  ValidateStatus,
  RuleObject,
  RuleRender,
  RuleType,
  Rules,
  NamePath,
  ColProps,
  FieldData,
  ValidateError,
  ValidateInfo,
  ScrollOptions,
  StoreValue,
  FormProviderProps,
} from './components/Form';

// ============================================
// 数据展示（data-display）
// ============================================
export { Tag } from './components/Tag';
export type { TagProps, TagSize, TagVariant, TagColor } from './components/Tag';

export { Table } from './components/Table';
export type { TableProps, TableColumn } from './components/Table';

export { CodeBlock } from './components/CodeBlock';
export type { CodeBlockProps } from './components/CodeBlock';

// ============================================
// 数据可视化（data-viz）
// ============================================
export { LineChart } from './components/LineChart';
export type { LineChartProps, LineChartSeries } from './components/LineChart';

// ============================================
// 反馈（feedback）
// ============================================
export { Loading } from './components/Loading';
export type { LoadingProps, LoadingSize } from './components/Loading';

export { Progress } from './components/Progress';
export type {
  ProgressProps,
  ProgressSize,
  ProgressInfoPosition,
} from './components/Progress';

export { Skeleton } from './components/Skeleton';
export type {
  SkeletonProps,
  SkeletonVariant,
  SkeletonButtonProps,
  SkeletonInputProps,
  SkeletonAvatarProps,
} from './components/Skeleton';

export { Notification } from './components/Notification';
export type {
  NotificationStatic,
  NotificationConfig,
  NotificationType,
  NotificationPosition,
  NotificationPlacement,
} from './components/Notification';

// ============================================
// 浮层（overlays）
// ============================================
export { Modal } from './components/Modal';
export type { ModalProps } from './components/Modal';

export { AlertDialog } from './components/AlertDialog';
export type { AlertDialogProps } from './components/AlertDialog';

export { Drawer } from './components/Drawer';
export type { DrawerProps, DrawerPlacement } from './components/Drawer';

export { Tooltip } from './components/Tooltip';
export type {
  TooltipProps,
  TooltipPlacement,
  TooltipTrigger,
} from './components/Tooltip';

export { Popover } from './components/Popover';
export type { PopoverProps } from './components/Popover';

export { HoverCard } from './components/HoverCard';
export type { HoverCardProps } from './components/HoverCard';

export { DropdownMenu } from './components/DropdownMenu';
export type {
  DropdownMenuProps,
  DropdownMenuItem,
} from './components/DropdownMenu';

export { ContextMenu } from './components/ContextMenu';
export type {
  ContextMenuProps,
  ContextMenuItem,
} from './components/ContextMenu';

export { Menubar } from './components/Menubar';
export type {
  MenubarProps,
  MenubarMenu,
  MenubarMenuItem,
} from './components/Menubar';

export { Toolbar } from './components/Toolbar';
export type {
  ToolbarProps,
  ToolbarButtonProps,
  ToolbarLinkProps,
  ToolbarSeparatorProps,
  ToolbarToggleGroupProps,
  ToolbarToggleGroupSingleProps,
  ToolbarToggleGroupMultipleProps,
} from './components/Toolbar';

export { NavigationMenu } from './components/NavigationMenu';
export type { NavigationMenuProps, NavItem } from './components/NavigationMenu';

export { ScrollArea } from './components/ScrollArea';
export type {
  ScrollAreaProps,
  ScrollAreaOrientation,
} from './components/ScrollArea';
