// 撤销/重做栈:快照式
export function createHistory(limit = 100) {
  let undoStack = [];
  let redoStack = [];
  return {
    push(snapshot) {
      undoStack.push(JSON.stringify(snapshot));
      if (undoStack.length > limit) undoStack.shift();
      redoStack = [];
    },
    undo(current) {
      if (!undoStack.length) return null;
      redoStack.push(JSON.stringify(current));
      return JSON.parse(undoStack.pop());
    },
    redo(current) {
      if (!redoStack.length) return null;
      undoStack.push(JSON.stringify(current));
      return JSON.parse(redoStack.pop());
    },
    canUndo: () => undoStack.length > 0,
    canRedo: () => redoStack.length > 0,
    clear() { undoStack = []; redoStack = []; }
  };
}
