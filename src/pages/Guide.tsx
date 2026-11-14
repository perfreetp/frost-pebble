import { Card } from '../components/ui';
import { Icon } from '../components/Icon';

export default function GuidePage() {
  return (
    <div class="grid" style={{ gap: '16px' }}>
      <Card title="作业规范与判定口径" sub="系统内所有计算与判定均遵循以下口径">
        <div class="grid cols-2" style={{ gap: '16px' }}>
          <div>
            <h4 style={{ 'font-size': '12px', color: 'var(--accent)', 'letter-spacing': '1px', margin: '0 0 6px' }}>一、建档</h4>
            <ul style={{ margin: 0, 'padding-left': '18px', 'font-size': '12px', 'line-height': 1.85, color: 'var(--ink-2)' }}>
              <li>每批苗一个编号，格式 <code class="mono">MC-年份-品种-序号</code>，同批多张样苗照片共用编号。</li>
              <li>记录品种、品系、苗龄、地径区间、苗高区间、出圃数量与苗床。</li>
              <li>区间用于后续逐株判定，务必按本批出圃标准填写。</li>
            </ul>
          </div>
          <div>
            <h4 style={{ 'font-size': '12px', color: 'var(--accent)', 'letter-spacing': '1px', margin: '0 0 6px' }}>二、拍照</h4>
            <ul style={{ margin: 0, 'padding-left': '18px', 'font-size': '12px', 'line-height': 1.85, color: 'var(--ink-2)' }}>
              <li>竖构图，主体居中、主干垂直，占画面 70% 以上。</li>
              <li>背景尽量纯净（白墙、净板、遮阳网），与枝叶有明显色差。</li>
              <li>每批建议 3–5 株代表性样苗，标注行位便于回溯。</li>
            </ul>
          </div>
          <div>
            <h4 style={{ 'font-size': '12px', color: 'var(--accent)', 'letter-spacing': '1px', margin: '0 0 6px' }}>三、加工</h4>
            <ul style={{ margin: 0, 'padding-left': '18px', 'font-size': '12px', 'line-height': 1.85, color: 'var(--ink-2)' }}>
              <li>自动初抠以照片左右边缘底色建模，按色距容差判定前景；容差小保留更多枝叶。</li>
              <li>初抠切掉的枝叶用绿色画笔补回，背景杂物（花盆、石块）用红色橡皮擦除。</li>
              <li>换背景按场景匹配色温：清晨圃地约 4600K 偏暖、阴天约 7000K 偏冷。</li>
              <li>投影方向随场景光位，强度可在 0–100% 调节，落地接触阴影与轮廓投影同步变化。</li>
              <li>规格图 1200×1600，查验图同尺寸但叠加 10cm 网格、高度刻度与地径卡尺。</li>
            </ul>
          </div>
          <div>
            <h4 style={{ 'font-size': '12px', color: 'var(--accent)', 'letter-spacing': '1px', margin: '0 0 6px' }}>四、版本</h4>
            <ul style={{ margin: 0, 'padding-left': '18px', 'font-size': '12px', 'line-height': 1.85, color: 'var(--ink-2)' }}>
              <li>每改一次（换背景、调投影、补笔、改尺寸）保存一个版本，版本号递增。</li>
              <li>版本记录参数、笔触路径与成图，可随时调出叠加、分割或差异比对。</li>
              <li>差异视图红色区域即相对基准版的改动部位。</li>
            </ul>
          </div>
          <div>
            <h4 style={{ 'font-size': '12px', color: 'var(--accent)', 'letter-spacing': '1px', margin: '0 0 6px' }}>五、抽检判定</h4>
            <ul style={{ margin: 0, 'padding-left': '18px', 'font-size': '12px', 'line-height': 1.85, color: 'var(--ink-2)' }}>
              <li>逐株录入地径（cm）与苗高（cm），任一项超出批次区间即该株不达标。</li>
              <li>批次达标率 = 达标株数 / 抽检株数，默认阈值 90%。</li>
              <li>达标率低于阈值判为不达标，须填写批注原因，不出圃、不可归档。</li>
            </ul>
          </div>
          <div>
            <h4 style={{ 'font-size': '12px', color: 'var(--accent)', 'letter-spacing': '1px', margin: '0 0 6px' }}>六、报告与归档</h4>
            <ul style={{ margin: 0, 'padding-left': '18px', 'font-size': '12px', 'line-height': 1.85, color: 'var(--ink-2)' }}>
              <li>出圃报告包含批次信息、规格图 + 查验图、抽检明细、版本沿革与三方签名位。</li>
              <li>归档条件：已有合成版本 + 抽检达标；归档后记录出圃月份。</li>
              <li>档案检索支持品种、苗龄、达标状态、出圃月份组合筛选，并可调出同批历史版本。</li>
            </ul>
          </div>
        </div>
      </Card>

      <div class="grid cols-3" style={{ gap: '16px' }}>
        <Card tight title="色温对照">
          <table class="table">
            <thead><tr><th>场景</th><th>色温</th><th>倾向</th></tr></thead>
            <tbody>
              <tr><td>清晨圃地</td><td class="mono">4600K</td><td>暖调</td></tr>
              <tr><td>温室苗床</td><td class="mono">5200K</td><td>微暖</td></tr>
              <tr><td>标准棚拍</td><td class="mono">5600K</td><td>中性</td></tr>
              <tr><td>阴天户外</td><td class="mono">7000K</td><td>冷调</td></tr>
            </tbody>
          </table>
        </Card>
        <Card tight title="成图规格">
          <div class="grid" style={{ gap: '8px', 'font-size': '12px' }}>
            <div class="row between"><span style={{ color: 'var(--ink-3)' }}>规格图</span><span class="mono">1200 × 1600 px</span></div>
            <div class="row between"><span style={{ color: 'var(--ink-3)' }}>查验图</span><span class="mono">1200 × 1600 px</span></div>
            <div class="row between"><span style={{ color: 'var(--ink-3)' }}>查验网格</span><span class="mono">10 cm</span></div>
            <div class="row between"><span style={{ color: 'var(--ink-3)' }}>高度刻度</span><span class="mono">2 / 5 / 10 cm</span></div>
            <div class="row between"><span style={{ color: 'var(--ink-3)' }}>缩略图</span><span class="mono">300 × 400 px</span></div>
          </div>
        </Card>
        <Card tight title="快捷键与提示">
          <div class="grid" style={{ gap: '8px', 'font-size': '12px' }}>
            <div class="row between"><span style={{ color: 'var(--ink-3)' }}>切换画笔 / 橡皮</span><span class="kbd">空格</span></div>
            <div class="row between"><span style={{ color: 'var(--ink-3)' }}>撤销一笔</span><span>右侧面板按钮</span></div>
            <div class="row between"><span style={{ color: 'var(--ink-3)' }}>自动存版</span><span>停顿 4 秒</span></div>
            <div class="row between"><span style={{ color: 'var(--ink-3)' }}>叠加比对</span><span>勾选上一版</span></div>
            <div class="row between"><span style={{ color: 'var(--ink-3)' }}>数据存储</span><span>本机 IndexedDB</span></div>
          </div>
        </Card>
      </div>

      <Card tight>
        <div class="row" style={{ gap: '10px', 'align-items': 'flex-start' }}>
          <Icon name="warn" size={18} />
          <div style={{ 'font-size': '12px', 'line-height': 1.75, color: 'var(--ink-2)' }}>
            <b>注意：</b>本系统用于苗圃内部出圃档案的加工与留存，成图为规格示意，不作为法定检验依据。
            自动初抠基于颜色边缘模型，遇到与背景同色的枝叶或强逆光照片时，请配合画笔手工修补后再存版。
          </div>
        </div>
      </Card>
    </div>
  );
}
