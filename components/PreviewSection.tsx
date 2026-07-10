
import React, { useRef, useEffect, useState } from 'react';
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

// Standard HD dimensions
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
  const [snapGuides, setSnapGuides] = useState({ vertical: false, horizontal: false });
  const [activeControl, setActiveControl] = useState<{ id: string; x: number; y: number } | null>(null);

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

  // Auto-scale calculation
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const parentWidth = containerRef.current.clientWidth;
        const parentHeight = containerRef.current.clientHeight;

        if (parentWidth === 0 || parentHeight === 0) return;

        const scaleX = parentWidth / BASE_WIDTH;
        const scaleY = parentHeight / targetHeight;
        const newScale = Math.min(scaleX, scaleY) * 0.95;

        setScale(newScale);
      }
    };

    updateScale();

    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [platform, targetHeight, html]);

  useEffect(() => {
    if (!html || (!onElementPositionChange && !onElementVisibilityChange)) return;

    const renderElement = renderRef.current;
    const rootElement = renderElement?.firstElementChild as HTMLElement | null;
    if (!renderElement || !rootElement) return;

    const editableIds = new Set(editableElements.filter((element) => element.visible !== false).map((element) => element.id));
    const editableNodes = rootElement.querySelectorAll<HTMLElement>('[data-editable-id]');
    editableNodes.forEach((node) => {
      if (editableIds.has(node.getAttribute('data-editable-id') || '')) {
        node.style.cursor = 'grab';
        node.style.touchAction = 'none';
      }
    });

    const updateActiveControl = (node: HTMLElement) => {
      if (!onElementVisibilityChange || dragStateRef.current) return;

      const elementId = node.getAttribute('data-editable-id') || '';
      if (!editableIds.has(elementId)) return;

      const rootRect = rootElement.getBoundingClientRect();
      const elementRect = node.getBoundingClientRect();
      setActiveControl({
        id: elementId,
        x: (elementRect.right - rootRect.left) / scale,
        y: (elementRect.top - rootRect.top) / scale,
      });
    };

    const handlePointerOver = (event: PointerEvent) => {
      const target = event.target as HTMLElement;
      const editableNode = target.closest<HTMLElement>('[data-editable-id]');
      if (!editableNode || !rootElement.contains(editableNode)) return;
      updateActiveControl(editableNode);
    };

    const handleHoverMove = (event: PointerEvent) => {
      if (dragStateRef.current) return;
      const target = event.target as HTMLElement;
      const editableNode = target.closest<HTMLElement>('[data-editable-id]');
      if (!editableNode || !rootElement.contains(editableNode)) return;
      updateActiveControl(editableNode);
    };

    const getPointerPosition = (event: PointerEvent, rootRect: DOMRect) => ({
      x: (event.clientX - rootRect.left) / scale,
      y: (event.clientY - rootRect.top) / scale,
    });

    const handlePointerMove = (event: PointerEvent) => {
      const dragState = dragStateRef.current;
      if (!dragState) return;

      event.preventDefault();

      const rootRect = dragState.root.getBoundingClientRect();
      const pointer = getPointerPosition(event, rootRect);
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
    };

    const handlePointerUp = () => {
      const dragState = dragStateRef.current;
      if (!dragState) return;

      dragState.element.style.cursor = 'grab';
      onElementPositionChange?.(dragState.id, { x: dragState.x, y: dragState.y });
      dragStateRef.current = null;
      setSnapGuides({ vertical: false, horizontal: false });
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointercancel', handlePointerUp);
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;

      const target = event.target as HTMLElement;
      const editableNode = target.closest<HTMLElement>('[data-editable-id]');
      if (!editableNode || !rootElement.contains(editableNode)) return;

      const elementId = editableNode.getAttribute('data-editable-id') || '';
      if (!editableIds.has(elementId)) return;

      event.preventDefault();
      event.stopPropagation();

      const rootRect = rootElement.getBoundingClientRect();
      const elementRect = editableNode.getBoundingClientRect();
      const pointer = getPointerPosition(event, rootRect);
      const currentX = (elementRect.left - rootRect.left) / scale;
      const currentY = (elementRect.top - rootRect.top) / scale;
      const width = elementRect.width / scale;
      const height = elementRect.height / scale;

      if (editableNode.parentElement !== rootElement) {
        rootElement.appendChild(editableNode);
      }

      editableNode.style.position = 'absolute';
      editableNode.style.left = `${Math.round(currentX)}px`;
      editableNode.style.top = `${Math.round(currentY)}px`;
      editableNode.style.right = '';
      editableNode.style.bottom = '';
      editableNode.style.margin = '0';
      editableNode.style.zIndex = editableNode.style.zIndex || '30';
      editableNode.style.cursor = 'grabbing';

      dragStateRef.current = {
        id: elementId,
        element: editableNode,
        root: rootElement,
        offsetX: pointer.x - currentX,
        offsetY: pointer.y - currentY,
        width,
        height,
        x: Math.round(currentX),
        y: Math.round(currentY),
      };

      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp);
      document.addEventListener('pointercancel', handlePointerUp);
    };

    rootElement.addEventListener('pointerdown', handlePointerDown);
    rootElement.addEventListener('pointerover', handlePointerOver);
    rootElement.addEventListener('pointermove', handleHoverMove);

    return () => {
      rootElement.removeEventListener('pointerdown', handlePointerDown);
      rootElement.removeEventListener('pointerover', handlePointerOver);
      rootElement.removeEventListener('pointermove', handleHoverMove);
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [editableElements, html, onElementPositionChange, onElementVisibilityChange, scale, targetHeight]);

  const handleDownload = async () => {
    if (!html || isDownloading) return;
    setIsDownloading(true);

    // Store original styles
    const originalTransform = canvasShellRef.current?.style.transform || '';

    try {
      // Wait for fonts
      await document.fonts.ready;

      // Temporarily remove scale for full-resolution capture
      if (canvasShellRef.current) {
        canvasShellRef.current.style.transform = 'none';
      }

      // Wait for repaint
      await new Promise(resolve => requestAnimationFrame(() => resolve(undefined)));
      await new Promise(resolve => setTimeout(resolve, 200));

      // Get the AI-generated element
      const targetElement = renderRef.current?.firstElementChild as HTMLElement;
      if (!targetElement) {
        throw new Error('No content to capture');
      }

      // Capture with modern-screenshot
      const dataUrl = await domToPng(targetElement, {
        scale: 2,
        backgroundColor: null,
      });

      // Download
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `led-cover-${platform === Platform.WeChat ? 'wechat' : 'xhs'}-${Date.now()}.png`;
      link.click();

    } catch (error) {
      console.error('Download failed:', error);
      alert('下载失败：' + (error as Error).message);
    } finally {
      // Restore transform
      if (canvasShellRef.current) {
        canvasShellRef.current.style.transform = originalTransform;
      }
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4 px-1">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          设计预览
          <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full hidden sm:inline-block">
            {BASE_WIDTH}px × {Math.round(targetHeight)}px
          </span>
        </h2>
        {html && (
          <div className="flex gap-2">
            {/* Edit Button */}
            {onEnterEditMode && (
              <button
                onClick={onEnterEditMode}
                className="flex items-center gap-2 text-sm bg-white text-slate-700 border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50 transition-all shadow-sm active:scale-95"
              >
                <Edit2 className="w-4 h-4" />
                编辑
              </button>
            )}
            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className={`flex items-center gap-2 text-sm bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95 ${
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
                  下载高清 PNG
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Preview Area */}
      <div
        className="flex-grow bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center p-4 md:p-8 overflow-hidden relative shadow-inner"
        style={{
          maxHeight: compact ? '52vh' : 'calc(100vh - 280px)',
          minHeight: compact ? '280px' : '400px',
        }}
      >
        {/* Loading */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm z-50 rounded-2xl">
            <div className="flex flex-col items-center">
              <div className="animate-spin h-10 w-10 border-4 border-slate-900 border-t-transparent rounded-full mb-4" />
              <p className="text-slate-900 font-bold animate-pulse">AI 正在设计中...</p>
            </div>
          </div>
        )}

        {/* Empty */}
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

        {/* Render */}
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
              onMouseLeave={() => setActiveControl(null)}
            >
              <div
                ref={renderRef}
                style={{
                  width: '100%',
                  height: '100%',
                }}
                dangerouslySetInnerHTML={{ __html: html }}
              />
              {snapGuides.vertical && (
                <div className="pointer-events-none absolute top-0 bottom-0 left-1/2 border-l-2 border-dashed border-indigo-500/80 z-[9999]" />
              )}
              {snapGuides.horizontal && (
                <div className="pointer-events-none absolute left-0 right-0 top-1/2 border-t-2 border-dashed border-indigo-500/80 z-[9999]" />
              )}
              {activeControl && onElementVisibilityChange && (
                <button
                  type="button"
                  onPointerDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                  }}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onElementVisibilityChange(activeControl.id, false);
                    setActiveControl(null);
                  }}
                  className="absolute z-[10000] w-9 h-9 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-950/90 text-white border border-white/70 shadow-lg flex items-center justify-center hover:bg-indigo-600 transition-colors"
                  style={{
                    left: activeControl.x,
                    top: activeControl.y,
                  }}
                  title="隐藏元素"
                  aria-label="隐藏元素"
                >
                  <EyeOff className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
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
