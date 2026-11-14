import { useEffect } from 'react';
import { useStore } from '../store/useStore';

/** 操作结果通知（布设避让提示、审核/归档反馈），4 秒自动消失 */
export function Notice() {
  const notice = useStore((s) => s.notice);
  const setNotice = useStore((s) => s.setNotice);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(t);
  }, [notice, setNotice]);

  if (!notice) return null;
  return (
    <div className="notice" onClick={() => setNotice(null)}>
      <span>ℹ</span>
      <p>{notice}</p>
    </div>
  );
}
