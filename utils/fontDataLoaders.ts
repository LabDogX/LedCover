export const FONT_DATA_LOADERS = {
  "source-han-sans-cn-bold": () => import("./fontData/source-han-sans-cn-bold").then((module) => module.default),
  "source-han-serif-cn-regular": () => import("./fontData/source-han-serif-cn-regular").then((module) => module.default),
  "youshe-titlehei": () => import("./fontData/youshe-titlehei").then((module) => module.default),
  "pangmen-title": () => import("./fontData/pangmen-title").then((module) => module.default),
  "ruizi-zhenyan": () => import("./fontData/ruizi-zhenyan").then((module) => module.default),
  "pangmen-qingsong": () => import("./fontData/pangmen-qingsong").then((module) => module.default),
  "azhu-paopao": () => import("./fontData/azhu-paopao").then((module) => module.default),
  "kangkang": () => import("./fontData/kangkang").then((module) => module.default),
  "muyao-softbrush": () => import("./fontData/muyao-softbrush").then((module) => module.default),
  "ipix-chinese-pixel": () => import("./fontData/ipix-chinese-pixel").then((module) => module.default),
} satisfies Record<string, () => Promise<string>>;
