import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import clsx from 'classnames';
import { lottieUrls } from '../../app/lottie-preload';

type Variant =
  | 'intro'
  | 'loading'
  | 'welcome'
  | 'hint'
  | 'notFound'
  | 'error'
  | 'successLove'
  | 'successCheck';

type Size = 'sm' | 'md' | 'lg' | number;

const sizeMap: Record<Exclude<Size, number>, number> = {
  sm: 84,
  md: 140,
  lg: 220
};

type Props = {
  variant: Variant;
  size?: Size;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
};

export function CatLottie({ variant, size = 'md', loop, autoplay = true, className }: Props) {
  const resolvedSize = typeof size === 'number' ? size : sizeMap[size];
  const url = lottieUrls[variant];
  const defaultLoop =
    loop ??
    (variant === 'loading'
      ? true
      : variant === 'successLove' || variant === 'successCheck'
        ? false
        : true);

  return (
    <div className={clsx('cat-lottie', className)} style={{ width: resolvedSize, height: resolvedSize }}>
      <DotLottieReact
        src={url}
        autoplay={autoplay}
        loop={defaultLoop}
        style={{ width: '100%', height: '100%', background: 'transparent' }}
      />
    </div>
  );
}
