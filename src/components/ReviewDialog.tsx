import { useState } from 'react';

interface Props {
  mode: 'submit' | 'reject';
  onClose: () => void;
  onSubmit: (reviewer: string, comment: string) => void;
}

export function ReviewDialog({ mode, onClose, onSubmit }: Props) {
  const [reviewer, setReviewer] = useState(mode === 'reject' ? '李矿长' : '张工');
  const [comment, setComment] = useState('');

  return (
    <div className="modal-mask" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{mode === 'reject' ? '驳回设计（审核未过将不能归档）' : '提交审核'}</h3>
        <label className="modal-label">人员
          <input value={reviewer} onChange={(e) => setReviewer(e.target.value)} />
        </label>
        <label className="modal-label">{mode === 'reject' ? '驳回意见（必填）' : '送审说明'}
          <textarea rows={4} value={comment} onChange={(e) => setComment(e.target.value)}
            placeholder={mode === 'reject' ? '请说明不通过原因，设计员将据此修改' : '可填写本次设计要点'} />
        </label>
        <div className="modal-actions">
          <button className="btn" onClick={onClose}>取消</button>
          <button
            className={`btn ${mode === 'reject' ? 'danger' : 'primary'}`}
            disabled={mode === 'reject' && comment.trim() === ''}
            onClick={() => onSubmit(reviewer, comment || (mode === 'submit' ? '送审' : ''))}
          >
            确认{mode === 'reject' ? '驳回' : '提交'}
          </button>
        </div>
      </div>
    </div>
  );
}
