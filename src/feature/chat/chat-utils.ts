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

export const getAntdDropdownMenu = (
  items: MenuItem[],
  onClick: (payload: { key: any }) => void,
  clzName?: string
): MenuProps => {
  return {
    items,
    onClick,
    className: clzName ?? 'vc-dropdown-menu'
  };
};
export const isImageFile = (fileName: string) => {
  const [ext] = fileName.split('.').reverse();
  return ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext);
};
export const isExcelFile = (fileName: string) => {
  const [ext] = fileName.split('.').reverse();
  return ['xls', 'xlsx'].includes(ext);
};
export const isWordFile = (fileName: string) => {
  const [ext] = fileName.split('.').reverse();
  return ['doc', 'docx'].includes(ext);
};
export const isPPTFile = (fileName: string) => {
  const [ext] = fileName.split('.').reverse();
  return ['ppt', 'pptxx'].includes(ext);
};
export const isPdfFile = (fileName: string) => {
  const [ext] = fileName.split('.').reverse();
  return ['pdf'].includes(ext);
};
export const isZipFile = (fileName: string) => {
  const [ext] = fileName.split('.').reverse();
  return ['zip', 'gz', 'rar'].includes(ext);
};
