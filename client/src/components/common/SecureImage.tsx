import { useEffect, useState, type ImgHTMLAttributes } from 'react';
import api from '../../services/api';
import { toAssetPath } from '../../utils/assets';

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src?: string | null;
};

/** Fetches private assets with Authorization and renders via blob URL. */
export function SecureImage({ src, alt, ...rest }: Props) {
  const [blobUrl, setBlobUrl] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    let objectUrl = '';
    const path = toAssetPath(src);
    if (!path) {
      setBlobUrl('');
      return undefined;
    }

    (async () => {
      try {
        const relative = path.replace(/^\/api\//, '');
        const { data } = await api.get(relative, { responseType: 'blob' });
        objectUrl = URL.createObjectURL(data);
        if (!cancelled) setBlobUrl(objectUrl);
      } catch {
        if (!cancelled) setBlobUrl('');
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  if (!blobUrl) return null;
  return <img src={blobUrl} alt={alt || ''} {...rest} />;
}
