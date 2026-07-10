import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { domToPng } from 'modern-screenshot';
import { EditableElement, Platform } from '../types';
import { Download, Edit2, AlertCircle, Maximize2, EyeOff } from 'lucide-react';

interface PreviewSectionProps {
  html: string | null;
  platform: Platform;
  isLoading: boolean;
  onEnterEditMode?: () => void;
  editableElements?: EditableElement[];
  onElementPositionChange?: (elementId: string, position: { x: number; y: number }) => void;
  onElementVisibilityChange?: (elementId: string, visible: boolean) => void;
  compact?: boolean;
}

interface ElementFrame {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

const BASE_WIDTH = 1080;
const RATIO_WECHAT = 2.35;
const RATIO_XHS = 3 / 4;
const SNAP_THRESHOLD = 18;

const PreviewSection: React.FC<PreviewSectionProps> = ({
  html,
  platform,
  isLoading,
  onEnterEditMode,
  editableElements = [],
  onElementPositionChange,
  onElementVisibilityChange,
  compact = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasShellRef = useRef<HTMLDivElement>(null);
  const renderRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);
  const [frames, setFrames] = useState<ElementFrame[]>([]);
  const [snapGuides, setSnapGuides] = useState({ vertical: false, horizontal: false });
  const dragStateRef = useRef<{
    id: string;
    element: HTMLElement;
    root: HTMLElement;
    offsetX: number;
    offsetY: number;
    width: number;
    height: number;
    x: number;
    y: number;
  } | null>(null);

  const targetHeight = platform === Platform.WeChat
    ? BASE_WIDTH / RATIO_WECHAT
    : BASE_WIDTH / RATIO_XHS;

  const visibleEditableIds = useMemo(
    () => new Set(
      editableElements
        .filter((element) => element.visible !== false)
        .map((element) => element.id)
    ),
    [editableElements]
  );

  const measureElementFrames = useCallback(() => {
    const rootElement = renderRef.current?.firstElementChild as HTMLElement | null;
    if (!rootElement || scale <= 0) {
      setFrames([]);
      return;
    }

    const rootRect = rootElement.getBoundingClientRect();
    const nextFrames: ElementFrame[] = [];

    rootElement.querySelectorAll<HTMLElement>('[data-editable-id]').forEach((node) => {
      const id = node.getAttribute('data-editable-id') || '';
      if (!visibleEditableIds.has(id)) return;
      if (node.offsetParent === null || node.style.display === 'none') return;

      const rect = node.getBoundingClientRect();
      nextFrames.push({
        id,
        x: (rect.left - rootRect.left) / scale,
        y: (rect.top - rootRect.top) / scale,
        width: rect.width / scale,
        height: rect.height / scale,
      });

      node.style.cursor = 'grab';
      node.style.touchAction = 'none';
      node.style.userSelect = 'none';
    });

    setFrames(nextFrames);
  }, [scale, visibleEditableIds]);

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;

      const parentWidth = containerRef.current.clientWidth;
      const parentHeight = containerRef.current.clientHeight;
      if (parentWidth === 0 || parentHeight === 0) return;

      const scaleX = parentWidth / BASE_WIDTH;
      const scaleY = parentHeight / targetHeight;
      setScale(Math.min(scaleX, scaleY) * (compact ? 0.98 : 0.95));
    };

    updateScale();

    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [compact, targetHeight, html]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(measureElementFrames);
    return () => window.cancelAnimationFrame(frame);
  }, [measureElementFrames, html]);

  const getCanvasPointer = (event: PointerEvent | React.PointerEvent, root: HTMLElement) => {
    const rootRect = root.getBoundingClientRect();
    return {
      x: (event.clientX - rootRect.left) / scale,
      y: (event.clientY - rootRect.top) / scale,
    };
  };

  const startDrag = (event: React.PointerEvent, frame: ElementFrame) => {
    if (!onElementPositionChange || event.button !== 0) return;

    const rootElement = renderRef.current?.firstElementChild as HTMLElement | null;
    if (!rootElement) return;

    const element = rootElement.querySelector(`[data-editable-id="${frame.id}"]`) as HTMLElement | null;
    if (!element) return;

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);

    const pointer = getCanvasPointer(event, rootElement);

    if (element.parentElement !== rootElement) {
      rootElement.appendChild(element);
    }

    element.style.position = 'absolute';
    element.style.left = `${Math.round(frame.x)}px`;
    element.style.top = `${Math.round(frame.y)}px`;
    element.style.right = '';
    element.style.bottom = '';
    element.style.margin = '0';
    element.style.zIndex = element.style.zIndex || '30';
    element.style.cursor = 'grabbing';
    element.style.touchAction = 'none';
    element.style.userSelect = 'none';

    dragStateRef.current = {
      id: frame.id,
      element,
      root: rootElement,
      offsetX: pointer.x - frame.x,
      offsetY: pointer.y - frame.y,
      width: frame.width,
      height: frame.height,
      x: frame.x,
      y: frame.y,
    };
  };

  const handleDragMove = (event: React.PointerEvent) => {
    const dragState = dragStateRef.current;
    if (!dragState) return;

    event.preventDefault();
    event.stopPropagation();

    const pointer = getCanvasPointer(event, dragState.root);
    let nextX = pointer.x - dragState.offsetX;
    let nextY = pointer.y - dragState.offsetY;

    nextX = Math.max(0, Math.min(BASE_WIDTH - dragState.width, nextX));
    nextY = Math.max(0, Math.min(targetHeight - dragState.height, nextY));

    const elementCenterX = nextX + dragState.width / 2;
    const elementCenterY = nextY + dragState.height / 2;
    const canvasCenterX = BASE_WIDTH / 2;
    const canvasCenterY = targetHeight / 2;
    const shouldSnapX = Math.abs(elementCenterX - canvasCenterX) <= SNAP_THRESHOLD;
    const shouldSnapY = Math.abs(elementCenterY - canvasCenterY) <= SNAP_THRESHOLD;

    if (shouldSnapX) {
      nextX = canvasCenterX - dragState.width / 2;
    }
    if (shouldSnapY) {
      nextY = canvasCenterY - dragState.height / 2;
    }

    dragState.x = Math.round(nextX);
    dragState.y = Math.round(nextY);
    dragState.element.style.left = `${dragState.x}px`;
    dragState.element.style.top = `${dragState.y}px`;
    setSnapGuides({ vertical: shouldSnapX, horizontal: shouldSnapY });
    setFrames((current) =>
      current.map((item) =>
        item.id === dragState.id
          ? { ...item, x: dragState.x, y: dragState.y }
          : item
      )
    );
  };

  const finishDrag = (event: React.PointerEvent) => {
    const dragState = dragStateRef.current;
    if (!dragState) return;

    event.preventDefault();
    event.stopPropagation();
    dragState.element.style.cursor = 'grab';
    onElementPositionChange?.(dragState.id, { x: dragState.x, y: dragState.y });
    dragStateRef.current = null;
    setSnapGuides({ vertical: false, horizontal: false });
    window.requestAnimationFrame(measureElementFrames);
  };

  const handleDownload = async () => {
    if (!html || isDownloading) return;
    setIsDownloading(true);

    const originalTransform = canvasShellRef.current?.style.transform || '';

    try {
      await document.fonts.ready;

      if (canvasShellRef.current) {
        canvasShellRef.current.style.transform = 'none';
      }

      await new Promise(resolve => requestAnimationFrame(() => resolve(undefined)));
      await new Promise(resolve => setTimeout(resolve, 200));

      const targetElement = renderRef.current?.firstElementChild as HTMLElement;
      if (!targetElement) {
        throw new Error('No content to capture');
      }

      const dataUrl = await domToPng(targetElement, {
        scale: 2,
        backgroundColor: null,
      });

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `led-cover-${platform === Platform.WeChat ? 'wechat' : 'xhs'}-${Date.now()}.png`;
      link.click();
    } catch (error) {
      console.error('Download failed:', error);
      alert('下载失败：' + (error as Error).message);
    } finally {
      if (canvasShellRef.current) {
        canvasShellRef.current.style.transform = originalTransform;
      }
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-3 md:mb-4 px-1">
        <h2 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2">
          设计预览
          <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full hidden sm:inline-block">
            {BASE_WIDTH}px × {Math.round(targetHeight)}px
          </span>
        </h2>
        {html && (
          <div className="flex gap-2">
            {onEnterEditMode && (
              <button
                onClick={onEnterEditMode}
                className="flex items-center gap-2 text-sm bg-white text-slate-700 border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50 transition-all shadow-sm active:scale-95"
              >
                <Edit2 className="w-4 h-4" />
                编辑
              </button>
            )}
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className={`flex items-center gap-2 text-sm bg-slate-900 text-white px-3 md:px-4 py-2 rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95 ${
                isDownloading ? 'opacity-70 cursor-wait' : ''
              }`}
            >
              {isDownloading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  处理中...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">下载高清 PNG</span>
                  <span className="sm:hidden">下载</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <div
        className="flex-grow bg-slate-100 rounded-xl md:rounded-2xl border border-slate-200 flex items-center justify-center p-2 md:p-8 overflow-hidden relative shadow-inner"
        style={{
          maxHeight: compact ? '68vh' : 'calc(100vh - 280px)',
          minHeight: compact ? '420px' : '400px',
        }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm z-50 rounded-2xl">
            <div className="flex flex-col items-center">
              <div className="animate-spin h-10 w-10 border-4 border-slate-900 border-t-transparent rounded-full mb-4" />
              <p className="text-slate-900 font-bold animate-pulse">AI 正在设计中...</p>
            </div>
          </div>
        )}

        {!html && !isLoading && (
          <div className="text-center text-slate-400 z-10">
            <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Maximize2 className="w-8 h-8 opacity-40" />
            </div>
            <p className="text-xl font-bold text-slate-500">等待生成...</p>
            <p className="text-sm opacity-70 mt-2">
              适配 {platform === Platform.WeChat ? '微信公众号 (2.35:1)' : '小红书 (3:4)'}
            </p>
          </div>
        )}

        <div
          ref={containerRef}
          className={`w-full h-full items-center justify-center relative ${html ? 'flex' : 'hidden'}`}
        >
          {html && (
            <div
              ref={canvasShellRef}
              style={{
                width: BASE_WIDTH,
                height: targetHeight,
                transform: `scale(${scale})`,
                transformOrigin: 'center center',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              }}
              className="transition-transform duration-200 flex-shrink-0 relative"
            >
              <div
                ref={renderRef}
                style={{ width: '100%', height: '100%' }}
                dangerouslySetInnerHTML={{ __html: html }}
              />

              {frames.map((frame) => (
                <div
                  key={frame.id}
                  className="absolute z-[10000] rounded-sm border border-transparent hover:border-indigo-500/80 hover:bg-indigo-500/5 cursor-grab active:cursor-grabbing touch-none"
                  style={{
                    left: frame.x,
                    top: frame.y,
                    width: Math.max(frame.width, 36),
                    height: Math.max(frame.height, 36),
                  }}
                  onPointerDown={(event) => startDrag(event, frame)}
                  onPointerMove={handleDragMove}
                  onPointerUp={finishDrag}
                  onPointerCancel={finishDrag}
                >
                  {onElementVisibilityChange && (
                    <button
                      type="button"
                      onPointerDown={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                      }}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        onElementVisibilityChange(frame.id, false);
                      }}
                      className="absolute -right-4 -top-4 w-9 h-9 rounded-full bg-slate-950/90 text-white border border-white/70 shadow-lg flex items-center justify-center hover:bg-indigo-600 transition-colors"
                      title="隐藏元素"
                      aria-label="隐藏元素"
                    >
                      <EyeOff className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}

              {snapGuides.vertical && (
                <div className="pointer-events-none absolute top-0 bottom-0 left-1/2 border-l-2 border-dashed border-indigo-500/80 z-[9999]" />
              )}
              {snapGuides.horizontal && (
                <div className="pointer-events-none absolute left-0 right-0 top-1/2 border-t-2 border-dashed border-indigo-500/80 z-[9999]" />
              )}
            </div>
          )}
        </div>
      </div>

      {html && !compact && (
        <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-xs rounded-xl flex gap-3 items-start border border-blue-100">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="leading-relaxed opacity-90">
            <strong>预览已自适应缩放。</strong> 下载时将输出 {BASE_WIDTH}px × {Math.round(targetHeight)}px 原始高清图。
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviewSection;
