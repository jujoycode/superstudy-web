import clsx from 'clsx'
import { ButtonHTMLAttributes, HTMLAttributes } from 'react'
import { Link, LinkProps } from 'react-router'

interface TabsProps extends HTMLAttributes<HTMLElement> {}

export function Tabs({ className, ...props }: TabsProps) {
  return <nav className={clsx('tabs', className)} {...props} />
}

export interface TabsButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean
}

Tabs.Button = function TabsButton({ selected, className, ...props }: TabsButtonProps) {
  return <button className={clsx('tabs-item', selected && 'tabs-item-selected', className)} {...props} />
}

export interface TabsLinkProps extends LinkProps {
  selected?: boolean
}

Tabs.Link = function TabsLink({ selected, className, ...props }: TabsLinkProps) {
  return <Link className={clsx('tabs-item', selected && 'tabs-item-selected', className)} {...props} />
}
