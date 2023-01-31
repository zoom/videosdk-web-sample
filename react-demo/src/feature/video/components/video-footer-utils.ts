import { Button, Menu } from 'antd';
// eslint-disable-next-line no-duplicate-imports
import type { MenuProps } from 'antd';
export type MenuItem = Required<MenuProps>['items'][number];
export const getAntdItem = (
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: string
): MenuItem => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return {
    key,
    icon,
    children,
    label,
    type
  } as MenuItem;
};

export const getAntdDropdownMenu = (items: MenuItem[], onClick: (payload: { key: any }) => void): MenuProps => {
  return {
    items,
    onClick,
    theme: 'dark',
    className: 'vc-dropdown-menu'
  };
};
