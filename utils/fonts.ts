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

// Add bundled commercial-use fonts here after placing files under public/fonts/.
// Example:
// {
//   id: 'source-han-sans',
//   label: '思源黑体',
//   cssFamily: '"Source Han Sans SC", "Noto Sans CJK SC", sans-serif',
//   source: '/fonts/SourceHanSansSC-Regular.woff2',
// }
export const PROJECT_FONT_OPTIONS: FontOption[] = [];

export const FONT_OPTIONS: FontOption[] = [
  ...SYSTEM_FONT_OPTIONS,
  ...PROJECT_FONT_OPTIONS,
];

const getPrimaryFontFamily = (cssFamily: string): string => {
  const quotedFamily = cssFamily.match(/^"([^"]+)"/);
  if (quotedFamily) return quotedFamily[1];

  return cssFamily.split(',')[0].trim().replace(/^['"]|['"]$/g, '');
};

export async function loadProjectFonts(): Promise<void> {
  if (typeof document === 'undefined') return;

  const fontsWithSources = PROJECT_FONT_OPTIONS.filter((font) => font.source);
  if (fontsWithSources.length === 0) return;

  await Promise.all(
    fontsWithSources.map(async (font) => {
      const family = getPrimaryFontFamily(font.cssFamily);
      const face = new FontFace(family, `url("${font.source}")`);
      await face.load();
      document.fonts.add(face);
    })
  );
}
