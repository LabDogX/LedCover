import { CoverTemplate, CoverTemplateId, Platform } from '../types';

const BASE_WIDTH = 1080;

export const COVER_TEMPLATES: CoverTemplate[] = [
  {
    id: 'wechat-default',
    platform: Platform.WeChat,
    name: '公众号极简',
    description: '横版深色信息封面',
  },
  {
    id: 'xhs-bold-title',
    platform: Platform.Xiaohongshu,
    name: '高反差大标题',
    description: '黑框、强标题、大 Emoji',
  },
  {
    id: 'xhs-clean-solid',
    platform: Platform.Xiaohongshu,
    name: '纯色便签',
    description: '纯色背景、居中大字',
  },
  {
    id: 'xhs-soft-gradient',
    platform: Platform.Xiaohongshu,
    name: '简单渐变',
    description: '柔和渐变、卡片式文字',
  },
];

export function getDefaultTemplateId(platform: Platform): CoverTemplateId {
  return platform === Platform.WeChat ? 'wechat-default' : 'xhs-bold-title';
}

export function getTemplatesForPlatform(platform: Platform): CoverTemplate[] {
  return COVER_TEMPLATES.filter(template => template.platform === platform);
}

/**
 * 生成初始封面 HTML 模板
 * 用于从零开始创建封面
 */
export function generateInitialTemplate(
  platform: Platform,
  templateId: CoverTemplateId = getDefaultTemplateId(platform)
): string {
  if (platform === Platform.WeChat) {
    return generateWechatTemplate();
  }

  switch (templateId) {
    case 'xhs-clean-solid':
      return generateXhsCleanSolidTemplate();
    case 'xhs-soft-gradient':
      return generateXhsSoftGradientTemplate();
    case 'xhs-bold-title':
    default:
      return generateXhsBoldTitleTemplate();
  }
}

function generateWechatTemplate(): string {
  return `<div style="width:${BASE_WIDTH}px;height:460px;overflow:hidden;position:relative;display:flex;align-items:center;justify-content:center;padding:0 80px;background:#0f172a;font-family:'Noto Sans SC',sans-serif;box-sizing:border-box;">
  <!-- 背景层（可选） -->
  <div data-bg-layer="true" style="position:absolute;inset:0;z-index:0;pointer-events:none;"></div>

  <!-- 内容层 -->
  <div style="position:relative;z-index:10;display:flex;flex-direction:column;gap:24px;width:100%;">
    <!-- 标签 -->
    <div style="display:inline-flex;align-items:center;gap:8px;padding:8px 16px;border-radius:999px;background:#6366f1;width:fit-content;">
      <span data-editable-id="tag-0" style="font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#ffffff;text-align:center;">标签</span>
    </div>

    <!-- 主标题 -->
    <h1 data-editable-id="heading-0" style="font-size:72px;font-weight:900;color:#ffffff;line-height:1;margin:0;text-align:center;">在这里输入标题</h1>

    <!-- 副标题 -->
    <p data-editable-id="paragraph-0" style="font-size:24px;color:#94a3b8;font-weight:500;letter-spacing:1px;margin:0;text-align:center;">在这里输入副标题</p>
  </div>

  <!-- 装饰图标 -->
  <div style="position:absolute;right:60px;bottom:60px;z-index:5;opacity:0.1;">
    <span style="font-size:180px;line-height:1;">✦</span>
  </div>
</div>`;
}

function generateXhsBoldTitleTemplate(): string {
  return `<div style="width:${BASE_WIDTH}px;height:1440px;overflow:hidden;position:relative;display:flex;flex-direction:column;background:#fff7ed;border:18px solid #0f172a;font-family:'Noto Sans SC',sans-serif;box-sizing:border-box;">
  <div data-bg-layer="true" style="position:absolute;inset:0;z-index:0;pointer-events:none;"></div>

  <div style="position:relative;z-index:10;display:flex;justify-content:space-between;align-items:center;padding:42px 58px;">
    <span data-editable-id="tag-0" style="font-size:28px;font-weight:900;letter-spacing:2px;color:#ffffff;background:#ef4444;padding:10px 20px;border:5px solid #0f172a;border-radius:999px;text-align:center;">HOT</span>
    <div style="display:flex;gap:10px;">
      <div style="width:18px;height:18px;background:#0f172a;border-radius:50%;"></div>
      <div style="width:18px;height:18px;background:#0f172a;border-radius:50%;"></div>
      <div style="width:18px;height:18px;background:#0f172a;border-radius:50%;"></div>
    </div>
  </div>

  <div style="position:relative;z-index:10;flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:40px 72px;text-align:center;">
    <div data-editable-id="emoji-0" data-editable-type="emoji" style="font-size:150px;line-height:1;margin-bottom:34px;filter:drop-shadow(10px 12px 0 rgba(15,23,42,0.18));">🔥</div>
    <h1 data-editable-id="heading-0" style="font-size:116px;font-weight:900;color:#0f172a;line-height:1.02;margin:0 0 28px 0;text-align:center;">在这里输入标题</h1>
    <p data-editable-id="paragraph-0" style="font-size:34px;color:#334155;font-weight:800;margin:0;text-align:center;line-height:1.4;background:#ffffff;padding:18px 28px;border:4px solid #0f172a;box-shadow:8px 8px 0 #0f172a;">在这里输入副标题</p>
  </div>

  <div style="position:relative;z-index:10;padding:38px 58px;background:#0f172a;color:#ffffff;font-size:28px;font-weight:900;text-align:center;letter-spacing:4px;">
    小红书封面
  </div>
</div>`;
}

function generateXhsCleanSolidTemplate(): string {
  return `<div style="width:${BASE_WIDTH}px;height:1440px;overflow:hidden;position:relative;display:flex;flex-direction:column;background:#d9f99d;font-family:'Noto Sans SC',sans-serif;box-sizing:border-box;">
  <div data-bg-layer="true" style="position:absolute;inset:0;z-index:0;pointer-events:none;"></div>

  <div style="position:relative;z-index:10;padding:58px 64px;display:flex;justify-content:space-between;align-items:center;">
    <span data-editable-id="tag-0" style="font-size:26px;font-weight:900;color:#0f172a;background:#ffffff;padding:12px 24px;border:4px solid #0f172a;border-radius:999px;text-align:center;">NOTE</span>
    <div data-editable-id="emoji-0" data-editable-type="emoji" style="font-size:76px;line-height:1;">✨</div>
  </div>

  <div style="position:relative;z-index:10;flex:1;display:flex;align-items:center;justify-content:center;padding:58px 72px;">
    <div style="width:100%;display:flex;flex-direction:column;gap:32px;align-items:center;text-align:center;">
      <h1 data-editable-id="heading-0" style="font-size:126px;font-weight:900;color:#0f172a;line-height:1.05;margin:0;text-align:center;">在这里输入标题</h1>
      <p data-editable-id="paragraph-0" style="font-size:36px;color:#0f172a;font-weight:800;line-height:1.45;margin:0;text-align:center;">在这里输入副标题</p>
    </div>
  </div>

  <div style="position:relative;z-index:10;padding:0 64px 58px;">
    <div style="height:14px;background:#0f172a;border-radius:999px;"></div>
  </div>
</div>`;
}

function generateXhsSoftGradientTemplate(): string {
  return `<div style="width:${BASE_WIDTH}px;height:1440px;overflow:hidden;position:relative;display:flex;flex-direction:column;background:linear-gradient(135deg,#dbeafe 0%,#fbcfe8 100%);font-family:'Noto Sans SC',sans-serif;box-sizing:border-box;padding:58px;">
  <div data-bg-layer="true" style="position:absolute;inset:0;z-index:0;pointer-events:none;"></div>

  <div style="position:relative;z-index:10;display:flex;justify-content:space-between;align-items:center;">
    <span data-editable-id="tag-0" style="font-size:24px;font-weight:900;color:#1e293b;background:rgba(255,255,255,0.72);padding:12px 24px;border-radius:999px;text-align:center;">收藏夹</span>
    <div data-editable-id="emoji-0" data-editable-type="emoji" style="font-size:82px;line-height:1;">💡</div>
  </div>

  <div style="position:relative;z-index:10;flex:1;display:flex;align-items:center;justify-content:center;">
    <div style="width:100%;background:rgba(255,255,255,0.78);border:5px solid rgba(15,23,42,0.9);box-shadow:16px 16px 0 rgba(15,23,42,0.9);padding:74px 58px;box-sizing:border-box;">
      <h1 data-editable-id="heading-0" style="font-size:104px;font-weight:900;color:#0f172a;line-height:1.08;margin:0 0 30px 0;text-align:left;">在这里输入标题</h1>
      <p data-editable-id="paragraph-0" style="font-size:34px;color:#475569;font-weight:800;line-height:1.45;margin:0;text-align:left;">在这里输入副标题</p>
    </div>
  </div>

  <div style="position:relative;z-index:10;text-align:center;font-size:28px;font-weight:900;color:#0f172a;">
    XIAOHONGSHU COVER
  </div>
</div>`;
}
