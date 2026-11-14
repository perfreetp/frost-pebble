// Canvas2D 矢量层:叠加在 three.js 视口上,绘制同音线/分区/调查点/差异高亮
export function createVectorLayer(container, terrain) {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.inset = '0';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '5';
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = container.clientWidth * window.devicePixelRatio;
    canvas.height = container.clientHeight * window.devicePixelRatio;
    canvas.style.width = container.clientWidth + 'px';
    canvas.style.height = container.clientHeight + 'px';
  }
  resize();
  window.addEventListener('resize', resize);

  function P(x, y) {
    const [sx, sy] = terrain.worldToScreen(x, y);
    return [sx * window.devicePixelRatio, sy * window.devicePixelRatio];
  }

  function pathMultiPolygon(mp) {
    for (const poly of mp) {
      for (const ring of poly) {
        ctx.beginPath();
        ring.forEach(([x, y], i) => {
          const [sx, sy] = P(x, y);
          i === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy);
        });
        ctx.closePath();
      }
    }
  }

  // state: { zones, isoglosses, points, draft, snapTarget, diff }
  function draw(state) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2 * window.devicePixelRatio;

    // 差异高亮(版本比对模式)
    if (state.diff) {
      if (state.diff.added && state.diff.added.length) {
        ctx.fillStyle = 'rgba(46, 204, 113, 0.35)';
        ctx.strokeStyle = '#2ecc71';
        ctx.beginPath(); pathMultiPolygon(state.diff.added); ctx.fill('evenodd'); ctx.stroke();
      }
      if (state.diff.removed && state.diff.removed.length) {
        ctx.fillStyle = 'rgba(231, 76, 60, 0.35)';
        ctx.strokeStyle = '#e74c3c';
        ctx.beginPath(); pathMultiPolygon(state.diff.removed); ctx.fill('evenodd'); ctx.stroke();
      }
    }

    // 分区
    for (const z of state.zones || []) {
      ctx.fillStyle = (z.color || '#3498db') + '55';
      ctx.strokeStyle = z.color || '#3498db';
      ctx.beginPath(); pathMultiPolygon(z.geom); ctx.fill('evenodd'); ctx.stroke();
      // 标签
      const ring = z.geom[0] && z.geom[0][0];
      if (ring) {
        let cx = 0, cy = 0;
        for (let i = 0; i < ring.length - 1; i++) { cx += ring[i][0]; cy += ring[i][1]; }
        cx /= (ring.length - 1); cy /= (ring.length - 1);
        const [sx, sy] = P(cx, cy);
        ctx.fillStyle = '#fff';
        ctx.font = `${13 * window.devicePixelRatio}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(z.name, sx, sy);
      }
    }

    // 同音线
    ctx.strokeStyle = '#e67e22';
    ctx.setLineDash([8 * window.devicePixelRatio, 5 * window.devicePixelRatio]);
    for (const line of state.isoglosses || []) {
      ctx.beginPath();
      line.points.forEach(([x, y], i) => {
        const [sx, sy] = P(x, y);
        i === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy);
      });
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // 调查点
    for (const p of state.points || []) {
      const [sx, sy] = P(p.x, p.y);
      ctx.beginPath();
      ctx.arc(sx, sy, 5 * window.devicePixelRatio, 0, Math.PI * 2);
      ctx.fillStyle = p.id === state.selectedPointId ? '#f1c40f' : '#ecf0f1';
      ctx.fill();
      ctx.strokeStyle = '#2c3e50';
      ctx.lineWidth = 1.5 * window.devicePixelRatio;
      ctx.stroke();
    }

    // 绘制中的草稿
    if (state.draft && state.draft.length) {
      ctx.strokeStyle = '#9b59b6';
      ctx.beginPath();
      state.draft.forEach(([x, y], i) => {
        const [sx, sy] = P(x, y);
        i === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy);
      });
      ctx.stroke();
      for (const [x, y] of state.draft) {
        const [sx, sy] = P(x, y);
        ctx.beginPath();
        ctx.arc(sx, sy, 3.5 * window.devicePixelRatio, 0, Math.PI * 2);
        ctx.fillStyle = '#9b59b6';
        ctx.fill();
      }
    }

    // 吸附指示
    if (state.snapTarget) {
      const [sx, sy] = P(state.snapTarget[0], state.snapTarget[1]);
      ctx.beginPath();
      ctx.arc(sx, sy, 9 * window.devicePixelRatio, 0, Math.PI * 2);
      ctx.strokeStyle = state.snapTarget.kind === 'boundary' ? '#1abc9c' : '#3498db';
      ctx.lineWidth = 2.5 * window.devicePixelRatio;
      ctx.stroke();
    }
  }

  return { draw, resize, canvas };
}
