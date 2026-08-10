import { ImgHTMLAttributes, ReactNode, useState } from 'react';

interface ResilientImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
  fallback: ReactNode;
}

export default function ResilientImage({ src, fallback, onError, ...imageProps }: ResilientImageProps) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const usableSource = src?.trim();
  if (!usableSource || failedSource === usableSource) return <>{fallback}</>;

  return (
    <img
      {...imageProps}
      src={usableSource}
      onError={(event) => {
        setFailedSource(usableSource);
        onError?.(event);
      }}
    />
  );
}
