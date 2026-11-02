import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors } from './theme';

type IconProps = {
  size?: number;
};

export function IconPlus({ size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M13 22L12.2002 22L12.2002 3L13 3L13 22Z" fill={colors.ink} />
      <Path d="M3 13L3 12.2002L22 12.2002L22 13L3 13Z" fill={colors.ink} />
    </Svg>
  );
}

export function IconVoice({ size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4.7998 15H4V9H4.7998V15Z" fill={colors.ink} />
      <Path d="M19.7998 15H19V9H19.7998V15Z" fill={colors.ink} />
      <Path d="M14.7998 17H14V7H14.7998V17Z" fill={colors.ink} />
      <Path d="M9.7998 21H9L9 3H9.7998L9.7998 21Z" fill={colors.ink} />
    </Svg>
  );
}

export function IconFont({ size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21.8397 4.10059H20.7373V3.05927C20.7373 2.86092 20.5688 2.70508 20.3545 2.70508C20.1401 2.70508 19.9717 2.86092 19.9717 3.05927V4.10059H3.31255V3.05927C3.31255 2.86092 3.14412 2.70508 2.92975 2.70508C2.71539 2.70508 2.54696 2.86092 2.54696 3.05927V4.10059H1.59764C1.38327 4.10059 1.21484 4.25644 1.21484 4.45478C1.21484 4.65313 1.38327 4.80897 1.59764 4.80897H2.54696V7.44416C2.54696 7.6425 2.71539 7.79835 2.92975 7.79835C3.14412 7.79835 3.31255 7.6425 3.31255 7.44416V4.80897H11.4048C11.3588 4.86564 11.3282 4.9294 11.3282 5.00732V19.9967H8.48025C8.26588 19.9967 8.09745 20.1525 8.09745 20.3509C8.09745 20.5492 8.26588 20.7051 8.48025 20.7051H14.9418C15.1561 20.7051 15.3246 20.5492 15.3246 20.3509C15.3246 20.1525 15.1561 19.9967 14.9418 19.9967H12.0938V5.00732C12.0938 4.9294 12.0632 4.86564 12.0173 4.80897H19.964V7.44416C19.964 7.6425 20.1325 7.79835 20.3468 7.79835C20.5612 7.79835 20.7296 7.6425 20.7296 7.44416V4.80897H21.8321C22.0464 4.80897 22.2148 4.65313 22.2148 4.45478C22.2148 4.25644 22.0464 4.10059 21.8321 4.10059H21.8397Z"
        fill={colors.ink}
      />
    </Svg>
  );
}

export function IconArrow({ size = 16 }: IconProps) {
  return (
    <View style={{ width: size, height: size, transform: [{ rotate: '-90deg' }] }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M11.3711 21.707L11.3711 2.5L12.1709 2.5L12.1719 21.707L11.3711 21.707Z" fill={colors.ink} />
        <Path
          d="M12.043 1.70605L18.543 7.70605L18 8.29395L11.7715 2.54395L5.54297 8.29395L5 7.70605L11.5 1.70605L11.7715 1.45605L12.043 1.70605Z"
          fill={colors.ink}
        />
      </Svg>
    </View>
  );
}
