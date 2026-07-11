import { CustomTemplate, Platform } from '../types';

const STORAGE_KEY = 'led_cover_custom_templates';

function isCustomTemplate(value: unknown): value is CustomTemplate {
  if (!value || typeof value !== 'object') return false;

  const template = value as Partial<CustomTemplate>;
  return (
    typeof template.id === 'string' &&
    typeof template.name === 'string' &&
    typeof template.html === 'string' &&
    (template.platform === Platform.WeChat || template.platform === Platform.Xiaohongshu) &&
    typeof template.createdAt === 'number' &&
    typeof template.updatedAt === 'number'
  );
}

export function loadCustomTemplates(): CustomTemplate[] {
  try {
    const savedTemplates = localStorage.getItem(STORAGE_KEY);
    if (!savedTemplates) return [];

    const parsedTemplates: unknown = JSON.parse(savedTemplates);
    if (!Array.isArray(parsedTemplates)) return [];

    return parsedTemplates
      .filter(isCustomTemplate)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

export function saveCustomTemplates(templates: CustomTemplate[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

export function createCustomTemplate(
  name: string,
  platform: Platform,
  html: string
): CustomTemplate {
  const now = Date.now();
  const id = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `template-${now}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    id,
    name: name.trim() || '未命名模板',
    platform,
    html,
    createdAt: now,
    updatedAt: now,
  };
}
