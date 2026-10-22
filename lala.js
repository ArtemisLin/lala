// 拉拉概率鉴定：按谷雨的规则，从四柱算出物证、牌、概率、毒舌、宜忌。
// 只看原局，不看大运流年；同一个盘永远同一个结果。网页和测试脚本共用这一份。
(function (root) {
  const GAN = '甲乙丙丁戊己庚辛壬癸';
  const ZHI = '子丑寅卯辰巳午未申酉戌亥';
  const WX = '木火土金水';
  const ganWx = g => Math.floor(GAN.indexOf(g) / 2);
  const ganYang = g => GAN.indexOf(g) % 2 === 0;

  // 藏干：本气在前
  const CANG = { 子: '癸', 丑: '己癸辛', 寅: '甲丙戊', 卯: '乙', 辰: '戊乙癸', 巳: '丙庚戊', 午: '丁己', 未: '己丁乙', 申: '庚壬戊', 酉: '辛', 戌: '戊辛丁', 亥: '壬甲' };
  const LIUHE = { 子: '丑', 丑: '子', 寅: '亥', 亥: '寅', 卯: '戌', 戌: '卯', 辰: '酉', 酉: '辰', 巳: '申', 申: '巳', 午: '未', 未: '午' };
  const chong = (a, b) => (ZHI.indexOf(a) + 6) % 12 === ZHI.indexOf(b);

  // 十二长生：火土同宫，阳顺阴逆
  const CS = '长生 沐浴 冠带 临官 帝旺 衰 病 死 墓 绝 胎 养'.split(' ');
  const CS_START = { 甲: '亥', 乙: '午', 丙: '寅', 丁: '酉', 戊: '寅', 己: '酉', 庚: '巳', 辛: '子', 壬: '申', 癸: '卯' };
  function changsheng(g, z) {
    const s = ZHI.indexOf(CS_START[g]), b = ZHI.indexOf(z);
    return CS[ganYang(g) ? (b - s + 12) % 12 : (s - b + 12) % 12];
  }

  // 十神
  function shishen(dm, g) {
    const d = ganWx(dm), x = ganWx(g), same = ganYang(dm) === ganYang(g);
    if (x === d) return same ? '比肩' : '劫财';
    if (x === (d + 1) % 5) return same ? '食神' : '伤官';
    if (x === (d + 2) % 5) return same ? '偏财' : '正财';
    if (d === (x + 2) % 5) return same ? '七杀' : '正官';
    return same ? '偏印' : '正印';
  }

  // 孤辰寡宿（按年支）
  function guchenGuasu(yz) {
    if ('亥子丑'.includes(yz)) return ['寅', '戌'];
    if ('寅卯辰'.includes(yz)) return ['巳', '丑'];
    if ('巳午未'.includes(yz)) return ['申', '辰'];
    return ['亥', '未'];
  }

  const ZIZUO_BIJIAN = ['甲寅', '乙卯', '戊辰', '戊戌', '己丑', '己未', '庚申', '辛酉'];
  const POS = ['年', '月', '日', '时'];

  // 牌：概率区间 [下限, 上限]
  const CARDS = [
    { n: '天选拉拉', r: '0', p: [120, 120] },
    { n: '弯成蚊香', r: 'I', p: [93, 99] },
    { n: '掰弯闺蜜', r: 'II', p: [85, 95] },
    { n: '万人迷', s: '（仅限女生）', r: 'III', p: [80, 92] },
    { n: '男人只会影响我拔刀的速度', r: 'IV', p: [85, 95] },
    { n: '反骨拉拉', r: 'V', p: [78, 90] },
    { n: '富婆联盟', r: 'VI', p: [70, 85] },
    { n: '成年人不做选择', r: 'VII', p: [55, 75] },
    { n: '精神拉拉', r: 'VIII', p: [55, 70] },
    { n: '薛定谔的直女', r: 'IX', p: [45, 60] },
    { n: '百合嗑学家', r: 'X', p: [35, 50] },
    { n: '家长最放心的直', r: 'XI', p: [15, 30] },
    { n: '绝望直女', r: 'XII', p: [8, 15] },
    { n: '天选孤寡', r: 'XIII', p: [50, 50] },
    { n: '大器晚弯', r: 'XIV', p: [66, 82] },
  ];

  // 毒舌、宜、忌：每张牌几版，按八字挑一版。{dm} 日主（庚金）{dz} 日柱 {ri} 日支 {shi} 时支
  const TEXT = [
    { s: ['物证多到鉴定所装不下，建议直接颁发终身成就奖。', '这盘不用鉴定，建议裱起来挂在鉴定所门口。', '鉴定员看完沉默了三秒，然后起立鼓掌。'],
      y: ['请全场姐妹喝奶茶', '当众宣布自己是天选之人', '把这张牌设成头像'], j: ['低调', '假装看不懂这张牌', '去相亲'] },
    { s: ['配偶宫{ri}、性宫{shi}，长得一模一样，这盘的弯度，量角器量不出来。', '{ri}{shi}相见，配偶宫和性宫穿了情侣装。', '一圈又一圈，弯得很有规律，像极了夏天的蚊香。'],
      y: ['去游乐园坐旋转木马', '把头像换成情侣头像', '买一盘蚊香留作纪念'], j: ['走直线', '说「我是直的」', '坐直行电梯'] },
    { s: ['{dz}日，配偶宫坐着比肩，你未来的对象，现在可能还是你的闺蜜。', '配偶宫里坐着一个和你一模一样的姐妹，你品，你细品。', '比肩坐镇配偶宫：掰弯闺蜜，你只需要一个周末。'],
      by: { A8: ['比肩{bj}个，姐妹成群：你身边从来不缺姐妹，缺的是捅破那层窗户纸。', '比肩扎堆的盘：闺蜜群里聊着聊着，就聊成了一对。', '姐妹多到能组一支球队，迟早有一个会变成你的人。'] },
      y: ['约闺蜜看一场电影', '和闺蜜合买一对耳环', '帮闺蜜挑一支口红'], j: ['给闺蜜介绍男朋友', '说「我们只是朋友」', '让闺蜜一个人回家'] },
    { s: ['{dm}坐沐浴，桃花开得满街都是，可惜只开给女生。', '沐浴是桃花，你的桃花自带滤镜：只对女生可见。', '走在路上回头看你的都是女生，男生只配帮你们拍照。'],
      y: ['去女生多的咖啡店坐坐', '收下姐妹塞来的小纸条', '今天出门化个全妆'], j: ['一次回所有姐妹的消息', '解释「我对你没那个意思」', '素颜见暗恋你的姐妹'] },
    { s: ['伤官当道，官星见了你都要绕路走。', '伤官一出手，男人就退场，姐妹，刀收一收。', '这把刀磨了二十多年，不是为了砍男人，是男人自己不敢靠近。'],
      by: { A9: ['七杀刚到门口，比肩就把它挡了回去：男人连你家门都进不来。', '比肩扛杀，姐妹们站成一排，替你把男人挡在外面。', '七杀想靠近，先过比肩这一关，至今没人过关。'] },
      y: ['报名一节拳击课', '带女朋友去吃烤肉', '一个人把柜子搬上楼'], j: ['给男同事好脸色', '回前任的消息', '让男生帮你拧瓶盖'] },
    { s: ['偏印当头，主流的路你一步都不想走，主流的恋爱也是。', '偏印孤高：别人排队的地方，你连看都不看一眼。', '小众到这个程度，你的爱情也是限量款。'],
      y: ['去 livehouse 听一场乐队', '染一缕挑染', '逛一家没人知道的书店'], j: ['随大流', '去相亲角', '听长辈的恋爱建议'] },
    { s: ['官杀一个都没透，财星堆了一屋子：男人不配，只配搞钱。', '财多无官：你要找的不是老公，是能一起搞钱的富婆姐姐。', '你的配偶栏写着：合伙人，女，有钱。'],
      y: ['和姐妹合伙开一家店', '看一眼账户余额', '请富婆姐姐吃顿饭'], j: ['借钱给男人', '为爱情放弃年终奖', 'AA 制'] },
    { s: ['拉拉铁证有，官杀也透着，你的爱情是自助餐。', '鉴定所判了半天，结论是：成年人不做选择。', '左手官杀，右手姐妹，鉴定员只能写「都要」。'],
      y: ['吃一顿自助餐', '两个约会都赴', '奶茶点两杯'], j: ['做单选题', '回答「你到底喜欢谁」', '只点一个菜'] },
    { s: ['拉拉的心，正印的命：心里在蹦迪，身体在相亲。', '正印坐镇，你的叛逆全写在收藏夹里。', '精神上已经出柜三次，现实里还在给妈妈报平安。'],
      y: ['偷偷关注一个女明星', '在评论区喊「老婆」', '把百合漫画藏进收藏夹'], j: ['让妈妈看你的收藏夹', '删掉百合漫画', '跟长辈聊感情'] },
    { s: ['盒子没打开之前，你既直又弯，鉴定所不敢打开。', '伤官探了个头，官杀又把你拉回来，你在直和弯之间反复横跳。', '你的取向和薛定谔的猫一样：要看谁先敲门。'],
      y: ['和姐妹手挽手逛街', '把决定权交给天意', '抛一次硬币'], j: ['打开盒子', '给自己下定义', '回答这道题'] },
    { s: ['自己不一定弯，但嗑别人的百合，你能嗑到凌晨三点。', '全场的百合 CP，都靠你养活。', '苗头已现，但你更喜欢坐在第一排看别人谈。'],
      y: ['给全场姐妹拉一次 CP', '追一部百合剧', '在 CP 超话签到'], j: ['只看不说', '把 CP 嗑到自己身上', '拆别人的 CP'] },
    { s: ['正印坐镇，相亲角的阿姨看了你的盘，当场要了你的微信。', '标准得像教科书，爸妈看了都想给鉴定所送锦旗。', '你的盘写着：根正苗红，直得让人放心。'],
      by: { G: ['官杀{n}个，追你的人能从相亲角排到地铁站。', '官杀扎堆：男人缘好到爸妈每周都在帮你挑女婿。', '这么多官杀，鉴定所只能宣布：直得明明白白，家长特别放心。'] },
      y: ['回家吃一顿饭', '给妈妈发一个红包', '陪长辈逛一次公园'], j: ['带女朋友回家', '让家长看到这张牌', '错过相亲'] },
    { s: ['姐妹暗示了你三年，你以为她只是眼睛不舒服。', '鉴定所翻遍了你的盘，连一根弯的头发丝都没找到。', '女生给你送奶茶，你问她是不是买多了。'],
      y: ['认真回一次姐妹的暗示', '请闺蜜吃顿火锅', '把姐妹送的奶茶喝完'], j: ['说「女生之间不会的」', '把情书当成作业', '问她是不是买多了'] },
    { s: ['男的被伤官克走，女的被冲散，鉴定所只好给你发一张单人票。', '孤辰寡宿双双到场：不是不弯，是谁都追不上你。', '你的爱情不分男女，主要是不分对象：因为没有对象。'],
      y: ['一个人吃火锅点双人份', '养一只猫', '给自己买束花'], j: ['许愿脱单', '算桃花', '看别人秀恩爱'] },
    { s: ['早年的大运替你选了男人，现在的大运替你改了答案。', '{dy}运一到，前半生的直路，在这里拐了个弯。', '不是晚，是刚好：走到{dy}运，才遇见对的姐妹。'],
      y: ['换一个新发型', '答应姐妹的周末邀约', '把头像换成新的'], j: ['回头走直路', '跟亲戚解释人生规划', '翻旧相册'] },
  ];

  // 送检备注：按日主五行 × 生月季节。{dm} 日主（庚金）{yue} 月支
  const NOTE = {
    木: { 春: '{dm}生在{yue}月，满盘春意，样本袋里冒出了新芽。', 夏: '{dm}生在{yue}月，枝叶晒得发烫，鉴定员先给样本浇了点水。', 秋: '{dm}生在{yue}月，秋风一吹，样本掉了两片叶子。', 冬: '{dm}生在{yue}月，木在雪里等春天，鉴定员先把暖气开了。' },
    火: { 春: '{dm}生在{yue}月，木来添柴，样本袋有点烫手。', 夏: '{dm}生在{yue}月，火上加火，鉴定员戴上了隔热手套。', 秋: '{dm}生在{yue}月，秋日余晖，样本发着暖光。', 冬: '{dm}生在{yue}月，冬夜里的一盏灯，鉴定员凑过来烤了烤手。' },
    土: { 春: '{dm}生在{yue}月，春泥松软，样本袋里能种花。', 夏: '{dm}生在{yue}月，地气蒸腾，样本按土方计量。', 秋: '{dm}生在{yue}月，秋收时节，样本沉甸甸的。', 冬: '{dm}生在{yue}月，冻土一块，鉴定员拿锤子才敲开。' },
    金: { 春: '{dm}生在{yue}月，刀锋初露，鉴定员小心翼翼地拆封。', 夏: '{dm}生在{yue}月，金在炉里炼，样本还冒着热气。', 秋: '{dm}生在{yue}月，金气逼人，鉴定员戴上了墨镜。', 冬: '{dm}生在{yue}月，金寒水冷，样本摸上去冰凉。' },
    水: { 春: '{dm}生在{yue}月，春水初生，样本袋在轻轻晃。', 夏: '{dm}生在{yue}月，夏天里的一口井，鉴定员先喝了一口。', 秋: '{dm}生在{yue}月，秋水长天，样本清得能照见人。', 冬: '{dm}生在{yue}月，水势滔滔，鉴定员穿上了雨靴。' },
  };
  const season = z => '寅卯辰'.includes(z) ? '春' : '巳午未'.includes(z) ? '夏' : '申酉戌'.includes(z) ? '秋' : '冬';

  // 你的天菜：看她自己的配偶宫（日支）——本气是什么十神、属什么五行，模糊地画出对象的样子
  const TIANCAI = {
    who: { 比肩: '同龄的搭子，跟你旗鼓相当', 劫财: '同龄的冤家，嘴上不饶人', 食神: '比你小的妹妹，软乎乎很会撒娇', 伤官: '比你小的妹妹，才华横溢还毒舌', 正财: '比你小一点，务实顾家会过日子',
      偏财: '大方会玩的社交达人', 正官: '比你成熟的姐姐，正经靠谱', 七杀: '气场很强的姐姐，飒到你腿软', 正印: '比你大的姐姐，温柔会照顾人', 偏印: '神秘的姐姐，小众又有点玄' },
    look: { 木: '高挑清瘦，文艺气质', 火: '明艳热情，笑起来很亮', 土: '温厚踏实，让人安心', 金: '利落飒爽，穿西装好看', 水: '温柔灵动，眼睛会说话' },
    meet: { 子: '深夜的小酒馆', 丑: '图书馆的角落', 寅: '爬山徒步的路上', 卯: '花店或书店', 辰: '一场大型展会', 巳: '演唱会现场', 午: '健身房或球场', 未: '甜品店或烘焙课', 申: '出差的高铁上', 酉: '美甲店或首饰店', 戌: '猫咖或宠物医院', 亥: '海边旅行的时候' },
    mode: { 比肩: '一起搞钱一起拼', 劫财: '又相爱又较劲', 食神: '一起吃遍整座城', 伤官: '吵架吵到笑场', 正财: '过日子过得很甜', 偏财: '说走就走去旅行', 正官: '纪念日一个都不会忘', 七杀: '她管着你，你还挺乐意', 正印: '她宠你像宠小孩', 偏印: '话不多，但特别懂对方' },
  };
  // 稀有度：1960–2015 年随机出生的三万个女命，各张牌抽到的比例（规则改了要重算）
  const ODDS = [2.1, 3.2, 5.3, 4.9, 3.7, 1.5, 7.4, 9.1, 4.5, 17.5, 5.6, 18.7, 5.7, 3.1, 7.7];
  const tierOf = (c, p) => c === 0 ? 'UR' : p <= 3 ? 'SSR' : p <= 6 ? 'SR' : p <= 10 ? 'R' : 'N';

  // 解析：'辛未丙申庚辰癸未'（八个字），没有时柱可以六个字
  function parse(b) {
    b = String(b || '').replace(/[\s,，、|]/g, '');
    if (b.length !== 8 && b.length !== 6) return null;
    const p = [];
    for (let i = 0; i < b.length; i += 2) {
      const g = b[i], z = b[i + 1];
      if (GAN.indexOf(g) < 0 || ZHI.indexOf(z) < 0) return null;
      if (GAN.indexOf(g) % 2 !== ZHI.indexOf(z) % 2) return null; // 阴阳不配，不成柱
      p.push(g + z);
    }
    return p;
  }

  // opts.dayun：[{ gz: '辛巳', startYear: 2022 }, …]，opts.year：按哪一年看「现在」的大运
  function judge(b, sex, opts) {
    opts = opts || {};
    const P = parse(b);
    if (!P) return { error: '八字看不懂：要四柱八个字连写，例如 辛未丙申庚辰癸未' };
    const male = /男|乾|^m/i.test(String(sex || ''));
    const hasHour = P.length === 4;
    const G = P.map(x => x[0]), Z = P.map(x => x[1]);
    const dm = G[2];
    const dmName = dm + WX[ganWx(dm)];

    // 每个字的十神（天干不含日主；地支拆藏干）
    const tg = G.map((g, i) => i === 2 ? null : shishen(dm, g));
    const cg = Z.map(z => CANG[z].split('').map(g => ({ g, ss: shishen(dm, g) })));
    const all = tg.filter(Boolean).concat(...cg.map(l => l.map(x => x.ss)));
    const count = ss => all.filter(x => x === ss).length;
    const touIdx = ss => tg.map((t, i) => t === ss ? i : -1).filter(i => i >= 0);
    const tou = ss => touIdx(ss).length > 0;
    const benqi = i => cg[i][0].ss;
    const anyCang = wx => cg.some(l => l.some(x => ganWx(x.g) === wx));
    const anyBenqi = wx => cg.some(l => ganWx(l[0].g) === wx);
    const wxOf = ss => { // 某类十神的五行
      const d = ganWx(dm);
      return { 比肩: d, 劫财: d, 食神: (d + 1) % 5, 伤官: (d + 1) % 5, 偏财: (d + 2) % 5, 正财: (d + 2) % 5, 七杀: (d + 3) % 5, 正官: (d + 3) % 5, 偏印: (d + 4) % 5, 正印: (d + 4) % 5 }[ss];
    };
    const xingyun = Z.map(z => changsheng(dm, z));
    const zizuo = G.map((g, i) => changsheng(g, Z[i]));
    const gw = i => G[i] + WX[ganWx(G[i])];

    const E = {}; // 物证：{ hit, why }
    const set = (k, hit, why) => { E[k] = { hit: !!hit, why: hit ? why : '' }; };

    set('A1', hasHour && Z[2] === Z[3], Z[2] + Z[3] + '相见：配偶宫＝性宫');
    set('A2', hasHour && P[2] === P[3], '日时伏吟：' + P[2] + '见' + P[3]);
    set('A3', ZIZUO_BIJIAN.includes(P[2]), P[2] + '日：配偶宫坐比肩');
    {
      const r = xingyun[2] === '沐浴', h = hasHour && xingyun[3] === '沐浴';
      set('A4', r || h, r && h ? '日时双沐浴：桃花开两朵' : r ? '日坐沐浴：' + P[2] : '时逢沐浴：' + Z[3] + '时');
    }
    {
      const why = [];
      if (benqi(1) === '伤官') why.push('月令' + Z[1] + '：伤官当令');
      if (tou('伤官') && anyBenqi(wxOf('伤官'))) why.push(gw(touIdx('伤官')[0]) + '伤官透干、根深');
      if (count('伤官') >= 3) why.push('伤官' + count('伤官') + '个，数量超标');
      const cs = touIdx('伤官').find(i => zizuo[i] === '长生');
      if (cs !== undefined) why.push('伤官' + G[cs] + '坐长生');
      if (tou('伤官') && count('正官') >= 1 && count('正官') + count('七杀') <= 2) why.push('伤官见官，官星微弱');
      set('A5', why.length, why[0]);
      E.A5.all = why;
    }
    {
      const why = [];
      if (tou('偏印') && anyBenqi(wxOf('偏印'))) why.push(gw(touIdx('偏印')[0]) + '偏印透干，根深蒂固');
      if (count('偏印') >= 3) why.push('偏印' + count('偏印') + '个，孤高成性');
      if (tou('偏印') && tou('伤官')) why.push('偏印、伤官双双透出');
      set('A6', why.length, why[0]);
    }
    {
      const n = count('正财') + count('偏财');
      set('A7', !tou('正官') && !tou('七杀') && n >= 3, '官杀不透，财星' + n + '个');
    }
    // 比肩那两条：年干、年支的比劫不算（谷雨 10-21）
    const bjN = tg.filter((t, i) => i > 0 && t === '比肩').length + cg.slice(1).reduce((n, l) => n + l.filter(x => x.ss === '比肩').length, 0);
    set('A8', bjN >= 3, '比肩' + bjN + '个，姐妹成群');
    {
      const b = touIdx('比肩').filter(i => i > 0)[0], k = touIdx('七杀')[0];
      set('A9', b !== undefined && k !== undefined, gw(b ?? 0) + '比肩扛住' + gw(k ?? 0) + '七杀');
    }
    // 顺序就是判牌时的优先顺序
    const aHits = ['A1', 'A2', 'A3', 'A4', 'A7', 'A5', 'A6', 'A9', 'A8'].filter(k => E[k].hit);
    const aKinds = aHits.filter(k => k !== 'A2').length; // 伏吟算 A1 的加强，不单算一类
    const aKinds6 = aHits.filter(k => !['A2', 'A7', 'A8', 'A9'].includes(k)).length; // 隐藏款只数配偶宫、沐浴、伤官、偏印这几类
    // 食神制杀（天干上食神、七杀都有）或食神过旺：异性缘淡，算弯弯苗头
    const zhisha = tou('食神') && tou('七杀');
    set('F', zhisha || count('食神') >= 3, zhisha ? gw(touIdx('食神')[0]) + '食神制住' + gw(touIdx('七杀')[0]) + '七杀' : '食神' + count('食神') + '个，异性缘淡');
    {
      const n = count('伤官') + count('偏印');
      const why = tou('伤官') ? '伤官透出：苗头已现' : tou('偏印') ? '偏印透出：苗头已现' : E.F.hit ? E.F.why : '伤官偏印藏了' + n + '个';
      set('B', !aHits.length && (tou('伤官') || tou('偏印') || E.F.hit), why);
    }
    {
      // 七杀被食神制住，就不算官杀旺
      const guan = zhisha ? ['正官'] : ['正官', '七杀'];
      const gs = guan.flatMap(x => touIdx(x)).find(i => anyBenqi(ganWx(G[i])));
      const yl = guan.includes(benqi(1));
      set('C1', gs !== undefined || yl, gs !== undefined ? gw(gs) + tg[gs] + '透干有根' : '月令' + Z[1] + '：官杀当令');
    }
    {
      let hit = false, why = '';
      if (hasHour) for (let i = 0; i < 3; i++) {
        if (LIUHE[Z[3]] === Z[i] && ['正官', '七杀'].includes(benqi(i))) { hit = true; why = '时支' + Z[3] + '合' + Z[i] + '：性宫合官杀'; break; }
      }
      set('C2', hit, why);
    }
    {
      const why = [];
      if (benqi(1) === '正印') why.push('月令' + Z[1] + '：正印当令');
      if (tou('正印') && anyCang(wxOf('正印'))) why.push(gw(touIdx('正印')[0]) + '正印透干有根');
      if (count('正印') >= 3) why.push('正印' + count('正印') + '个，家教森严');
      set('C3', why.length, why[0]);
    }
    {
      const [gu, gua] = guchenGuasu(Z[0]);
      const z13 = Z.slice(1);
      const d1 = z13.find(z => z === gu || z === gua);
      const gName = [z13.includes(gu) ? '孤辰' + gu : '', z13.includes(gua) ? '寡宿' + gua : ''].filter(Boolean);
      const d1why = gName.length === 2 ? gName.join('、') + '齐到' : gName[0] + '坐镇';
      const d2 = tou('伤官') || count('伤官') >= 2;
      const bj = count('比肩') + count('劫财');
      let d3 = bj === 0, d3why = '盘上一个姐妹都没有';
      if (!d3) {
        for (const i of [...touIdx('比肩'), ...touIdx('劫财')]) {
          for (const j of [i - 1, i + 1]) {
            if (j < 0 || j > 3 || j === i || (j === 3 && !hasHour)) continue;
            if (ganWx(G[i]) === (ganWx(G[j]) + 2) % 5) { d3 = true; d3why = gw(i) + tg[i] + '被' + gw(j) + '克'; break; }
          }
          if (d3) break;
        }
      }
      if (!d3) {
        for (let i = 0; i < Z.length && !d3; i++) {
          if (!['比肩', '劫财'].includes(benqi(i))) continue;
          for (let j = 0; j < Z.length; j++) if (j !== i && chong(Z[i], Z[j])) { d3 = true; d3why = Z[j] + Z[i] + '相冲：比劫被冲'; break; }
        }
      }
      const hit = d1 && d2 && d3;
      set('D', hit, d1why);
      if (hit) E.D.all = [d1why, '伤官克夫', d3why];
    }

    {
      // 只数盘面上看得见的：天干＋地支本气
      const n = tg.filter(t => t === '正官' || t === '七杀').length + cg.filter(l => ['正官', '七杀'].includes(l[0].ss)).length;
      set('G', n >= 3, '官杀透出' + n + '个，异性缘爆棚');
      E.G.n = n;
    }
    {
      const LU = { 甲: '寅', 乙: '卯', 丙: '巳', 丁: '午', 戊: '巳', 己: '午', 庚: '申', 辛: '酉', 壬: '亥', 癸: '子' };
      const REN = { 甲: '卯', 丙: '午', 戊: '午', 庚: '酉', 壬: '子' }; // 羊刃格只看阳干
      const jl = LU[dm] === Z[1], yr = REN[dm] === Z[1];
      set('E', jl || yr, (jl ? '建禄格' : '羊刃格') + '（' + P[1] + '月）：概率加成 4%');
    }

    // 大运：看现在这一步。天干是比劫、伤官算弯运，是官杀、正印、财算直运
    let late = null;
    set('Y', false, ''); set('Z', false, '');
    const dy = opts.dayun, now = opts.year || new Date().getFullYear();
    if (dy && dy.length) {
      let k = -1;
      dy.forEach((d, i) => { if (d.startYear <= now) k = i; });
      if (k >= 0) {
        const cur = dy[k], ts = shishen(dm, cur.gz[0]), zs = shishen(dm, CANG[cur.gz[1]][0]);
        const label = ts === zs ? ts : ts + '＋' + zs;
        const head = '当前大运' + cur.gz + '（' + cur.startYear + '–' + (cur.startYear + 9) + '）：' + label;
        const bend = ['比肩', '劫财', '伤官'].includes(ts), straight = ['正官', '七杀', '正印', '正财', '偏财'].includes(ts);
        set('Y', bend, head + '，正在弯');
        set('Z', straight, head + '，正在直');
        E.Y.cur = cur.gz;
        if (!bend && !straight) E.Y.info = head + '，不弯不直';
        // 先直后弯：现在走弯运，以前走过官杀运或正印运，盘里本来也有弯的物证
        const zhi = ['正官', '七杀', '正印'];
        for (let i = 0; i < k && bend && (aKinds || E.E.hit); i++) {
          const d = dy[i], a = shishen(dm, d.gz[0]), z = shishen(dm, CANG[d.gz[1]][0]);
          if (zhi.includes(a) || zhi.includes(z)) late = '早年走过' + d.gz + '运：' + (zhi.includes(a) ? a : d.gz[1] + '是' + z);
        }
      }
    }

    // 判牌：从上往下，中了就停
    const anyC = E.C1.hit || E.C2.hit || E.C3.hit;
    let c;
    // 组合着看：中两类以上弯的物证、或中了最强的配偶宫两条，才算「够弯」；
    // 只中一类普通的，盘里只要有直的物证（官杀、正印、直运）就落到中间的牌
    const strong = aKinds >= 2 || E.A1.hit || E.A3.hit;
    const weak = aKinds === 1 && !strong;
    const guan = E.C1.hit || E.C2.hit;
    if (E.G.hit) c = 11; // 官杀过旺：一定是直女
    else if (aKinds6 >= 3 && (E.A1.hit || E.A3.hit)) c = 0; // 隐藏款：三类以上，且配偶宫有物证
    else if (E.D.hit) c = 13;
    else if (late && (strong || E.E.hit)) c = 14; // 大器晚弯：盘里本来够弯（或建禄、羊刃，比劫当令），被早年的直运压住
    else if (strong && guan) c = E.Z.hit && aKinds === 1 ? 9 : 7; // 成年人不做选择；只有一类又走直运就降成薛定谔
    else if (strong && E.C3.hit && aKinds === 1) c = 8;
    else if (strong) c = ({ A1: 1, A2: 1, A3: 2, A4: 3, A5: 4, A9: 4, A8: 2, A6: 5, A7: 6 })[aHits[0]];
    else if (weak && E.Z.hit) c = 9; // 一点弯，正走直运
    else if (weak && guan) c = 7; // 一点弯，又喜欢男人
    else if (weak && E.C3.hit) c = 8;
    else if (weak) c = ({ A4: 3, A5: 4, A9: 4, A8: 2, A6: 5, A7: 6 })[aHits[0]];
    else if (E.Z.hit && !E.C3.hit) c = 12; // 盘里没有够格的弯物证，还正走直运
    else if (E.Y.hit) c = 10; // 盘里不弯，但正走弯运：最近特别爱嗑
    else if (E.B.hit && (anyC || E.Z.hit)) c = 9;
    else if (E.B.hit) c = 10;
    else if (E.C3.hit) c = 11;
    else c = 12;

    // 概率：下限 +（日干序号 + 时支序号）除以区间宽的余数；小数 = 月干序号 − 1
    const [lo, hi] = CARDS[c].p;
    const gi = g => GAN.indexOf(g) + 1, zi = z => ZHI.indexOf(z) + 1;
    let pct = lo;
    if (hi > lo) pct = lo + (gi(G[2]) + (hasHour ? zi(Z[3]) : 0)) % (hi - lo + 1) + (gi(G[1]) - 1) / 10;
    if (hi > lo) {
      if (E.E.hit) pct += 4; // 建禄、羊刃格：加一点点
      if (E.Y.hit) pct += 8; // 弯运
      if (E.Z.hit) pct -= 8; // 直运
      pct = Math.max(5, Math.min(pct, 99.9));
    }
    const pctText = c === 0 ? '120' : c === 13 ? '50' : pct.toFixed(1);

    // 铁证：挑跟这张牌有关的，最多三条
    const w = k => E[k].why;
    let ev;
    if (c === 13) ev = E.D.all;
    else if (c === 14) ev = [w('Y').replace(/（.*?）/, ''), late, aHits.map(w)[0]];
    else if (c === 7) ev = [...aHits.map(w).slice(0, 2), E.C1.hit ? w('C1') : w('C2')];
    else if (c === 8) ev = [...aHits.map(w).slice(0, 2), w('C3')];
    else if (c === 9) ev = [aHits.length ? w(aHits[0]) : w('B'), ...['C1', 'C2', 'C3'].filter(k => E[k].hit).map(w)];
    else if (c === 10) ev = [w('B'), '官杀、正印都没来拦'];
    else if (c === 11) ev = E.G.hit ? [w('G'), ...['C1', 'C3'].filter(k => E[k].hit).map(w), '弯弯物证一律作废'] : [w('C3'), '弯弯物证：零'];
    else if (c === 12) ev = [...['C1', 'C2'].filter(k => E[k].hit).map(w), '全盘未检出弯曲迹象'];
    else if (c === 4 && E.A5.hit) ev = E.A5.all.concat(aHits.filter(k => k !== 'A5').map(w));
    else ev = aHits.map(w);
    ev = ev.filter(Boolean).slice(0, 3);
    if (E.E.hit && c !== 11 && c !== 13 && ev.length < 3) ev.push(w('E').replace('：概率加成 4%', '：加成 4%'));
    const wan = [0, 1, 2, 3, 4, 5, 6, 7, 8].includes(c);
    if (ev.length < 3 && wan && E.Y.hit) ev.push(w('Y').replace(/（.*?）/, ''));
    if (ev.length < 3 && !wan && E.Z.hit) ev.push(w('Z').replace(/（.*?）/, ''));

    // 毒舌、宜、忌：按八字挑一版
    const seed = G.concat(Z).reduce((s, x, i) => s + (GAN.indexOf(x) + ZHI.indexOf(x) + 2) * (i + 1), 0);
    const T = TEXT[c];
    const trigger = c === 11 ? (E.G.hit ? 'G' : 'C3') : aHits[0];
    const S = (T.by && T.by[trigger]) || T.s;
    const fill = s => s.replace('{dy}', E.Y.cur || '').replace('{n}', E.G.n).replace('{bj}', count('比肩')).replace('{dm}', dmName).replace('{dz}', P[2]).replace('{ri}', Z[2]).replace('{shi}', hasHour ? Z[3] : '');

    // 天菜
    const pz = Z[2], ps = shishen(dm, CANG[pz][0]), pw = WX[ganWx(CANG[pz][0])];
    const tiancai = { who: TIANCAI.who[ps], look: TIANCAI.look[pw], meet: TIANCAI.meet[pz], mode: TIANCAI.mode[ps] };
    // 属性面板：从盘里的十神数出来
    const cap = v => Math.max(5, Math.min(99, Math.round(v)));
    const tao = Z.filter(z => '子午卯酉'.includes(z)).length;
    const jieN = tg.filter((t, i) => i > 0 && (t === '比肩' || t === '劫财')).length + cg.slice(1).reduce((n, l) => n + l.filter(x => x.ss === '比肩' || x.ss === '劫财').length, 0);
    const shi = tou('食神') || tou('伤官');
    const stats = [
      ['弯度', c === 0 ? 100 : c === 13 ? 50 : Math.min(99, Math.round(pct))],
      ['桃花', cap(28 + tao * 14 + (E.A4.hit ? 20 : 0) + (shi ? 8 : 0))],
      ['姐妹缘', cap(22 + jieN * 13)],
      ['掌控欲', cap(25 + count('七杀') * 12 + count('伤官') * 9 + (E.E.hit ? 12 : 0))],
      ['搞钱力', cap(20 + (count('正财') + count('偏财')) * 12 + (shi ? 6 : 0))],
    ];
    const odds = ODDS[c] || 0;

    return {
      tiancai, stats, rarity: { tier: tierOf(c, odds), p: odds },
      male, pillars: P, hasHour, dm: dmName,
      tg, cg, xingyun, zizuo, evidence: E,
      card: c, cardInfo: CARDS[c], pct: pctText,
      quote: fill(S[seed % S.length]),
      yi: T.y[(seed + 1) % T.y.length], ji: T.j[(seed + 2) % T.j.length],
      ev,
      note: NOTE[WX[ganWx(dm)]][season(Z[1])].replace('{dm}', dmName).replace('{yue}', Z[1]),
      match: LIUHE[Z[2]],
    };
  }

  const api = { judge, parse, CARDS, TEXT, NOTE, GAN, ZHI, POS, shishen, changsheng };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Lala = api;
})(this);
