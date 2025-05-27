import { Button, type ButtonProps } from '@/atoms/Button'
import { Flex } from '@/atoms/Flex'
import { Icon, type IconName, type IconProps } from '@/atoms/Icon'

interface IconButtonProps extends ButtonProps, Pick<IconProps, 'fill' | 'stroke' | 'strokeWidth' | 'customSize'> {
  iconName: IconName
  iconColor?: 'primary' | `${string}-${number}`
  iconSize?: 'sm' | 'md' | 'lg'
  position: 'front' | 'back'
}

/**
 * IconButton
 * @author jh.b.ryu
 * @returns 콘텐츠의 앞이나 뒤에 아이콘이 있는 버튼
 */
export function IconButton({
  children,
  iconName,
  iconColor,
  iconSize = 'sm',
  position,
  fill,
  stroke,
  strokeWidth,
  customSize,
  ...props
}: IconButtonProps) {
  const IconComponent = (
    <Icon
      name={iconName}
      color={iconColor}
      size={iconSize}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      customSize={customSize}
    />
  )
  const Content =
    position === 'front' ? (
      <Flex items="center" justify="center" gap="2">
        {IconComponent}
        {children}
      </Flex>
    ) : (
      <Flex items="center" justify="center" gap="2">
        {children}
        {IconComponent}
      </Flex>
    )

  return <Button {...props}>{Content}</Button>
}
