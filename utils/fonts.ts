export interface FontOption {
  id: string;
  label: string;
  cssFamily: string;
  source?: string;
}

export const SYSTEM_FONT_OPTIONS: FontOption[] = [
  {
    id: 'system-sans',
    label: '系统黑体',
    cssFamily: '"PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif',
  },
  {
    id: 'title-heavy',
    label: '高反差粗黑',
    cssFamily: '"Arial Black", "PingFang SC", "Microsoft YaHei", sans-serif',
  },
  {
    id: 'rounded-sans',
    label: '圆润黑体',
    cssFamily: '"Microsoft YaHei UI", "PingFang SC", "Hiragino Sans GB", sans-serif',
  },
  {
    id: 'system-serif',
    label: '系统宋体',
    cssFamily: '"Noto Serif CJK SC", "Songti SC", "SimSun", serif',
  },
  {
    id: 'clean-latin',
    label: '英文无衬线',
    cssFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
  },
];

// Keep this list intentionally small. Files in public/fonts are copied into
// production builds, so bundled fonts should be curated for cover design use.
export const PROJECT_FONT_OPTIONS: FontOption[] = [
  {
    id: 'source-han-sans-cn-bold',
    label: '思源黑体 Bold',
    cssFamily: '"Source Han Sans CN Bold", "Noto Sans CJK SC", sans-serif',
    source: '/assets/fonts/source-han-sans-cn-bold.otf',
  },
  {
    id: 'source-han-serif-cn',
    label: '思源宋体',
    cssFamily: '"Source Han Serif CN", "Noto Serif CJK SC", serif',
    source: '/assets/fonts/source-han-serif-cn-regular.otf',
  },
  {
    id: 'youshe-titlehei',
    label: '优设标题黑',
    cssFamily: '"YouShe TitleHei", "PingFang SC", sans-serif',
    source: '/assets/fonts/youshe-titlehei.ttf',
  },
  {
    id: 'pangmen-title',
    label: '庞门正道标题体',
    cssFamily: '"PangMen Title", "PingFang SC", sans-serif',
    source: '/assets/fonts/pangmen-title.ttf',
  },
  {
    id: 'ruizi-zhenyan',
    label: '锐字真言体',
    cssFamily: '"RuiZi ZhenYan", "PingFang SC", sans-serif',
    source: '/assets/fonts/ruizi-zhenyan.ttf',
  },
  {
    id: 'pangmen-qingsong',
    label: '庞门正道轻松体',
    cssFamily: '"PangMen QingSong", "PingFang SC", sans-serif',
    source: '/assets/fonts/pangmen-qingsong.otf',
  },
  {
    id: 'azhu-paopao',
    label: '阿朱泡泡体',
    cssFamily: '"Azhu Paopao", "PingFang SC", sans-serif',
    source: '/assets/fonts/azhu-paopao.ttf',
  },
  {
    id: 'kangkang',
    label: '素材集市康康体',
    cssFamily: '"Kangkang", "PingFang SC", sans-serif',
    source: '/assets/fonts/kangkang.ttf',
  },
  {
    id: 'muyao-softbrush',
    label: '沐瑶软笔手写体',
    cssFamily: '"Muyao Softbrush", "PingFang SC", sans-serif',
    source: '/assets/fonts/muyao-softbrush.ttf',
  },
  {
    id: 'ipix-chinese-pixel',
    label: 'IPix 中文像素',
    cssFamily: '"IPix Chinese Pixel", "PingFang SC", sans-serif',
    source: '/assets/fonts/ipix-chinese-pixel.ttf',
  },
];

export const FONT_OPTIONS: FontOption[] = [
  ...SYSTEM_FONT_OPTIONS,
  ...PROJECT_FONT_OPTIONS,
];

const getPrimaryFontFamily = (cssFamily: string): string => {
  const quotedFamily = cssFamily.match(/^"([^"]+)"/);
  if (quotedFamily) return quotedFamily[1];

  return cssFamily.split(',')[0].trim().replace(/^['"]|['"]$/g, '');
};

const loadedFontIds = new Set<string>();

const resolveFontSource = (source: string): string => {
  if (/^(https?:|data:|blob:)/i.test(source)) {
    return source;
  }

  const meta = import.meta as ImportMeta & { env?: { BASE_URL?: string } };
  const base = meta.env?.BASE_URL || '/';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  const normalizedSource = source.replace(/^\/+/, '');

  return new URL(normalizedSource, `${window.location.origin}${normalizedBase}`).toString();
};

export async function loadFontOption(font: FontOption): Promise<void> {
  if (typeof document === 'undefined' || !font.source || loadedFontIds.has(font.id)) return;

  const family = getPrimaryFontFamily(font.cssFamily);
  const fontUrl = resolveFontSource(font.source);
  const response = await fetch(fontUrl, { cache: 'force-cache' });

  if (!response.ok) {
    throw new Error(`字体文件请求失败：HTTP ${response.status}\n${fontUrl}`);
  }

  const fontData = await response.arrayBuffer();
  const face = new FontFace(family, fontData);
  await face.load();
  document.fonts.add(face);
  loadedFontIds.add(font.id);
}
