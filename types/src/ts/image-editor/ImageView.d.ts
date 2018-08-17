/// <reference types="pixi.js" />
import { Eventer } from 'entcore-toolkit';
export declare class ImageView {
    sprite: PIXI.Sprite;
    stage: PIXI.Container;
    renderer: PIXI.CanvasRenderer | PIXI.WebGLRenderer;
    history: Blob[];
    editingElement: any;
    historyIndex: number;
    eventer: Eventer;
    originalImage: Blob;
    appliedIndex: number;
    pendingChanges: boolean;
    format: string;
    private paint(image);
    render(): void;
    resetHistory(): void;
    readonly hasHistory: boolean;
    loadImage(image: HTMLImageElement, repaint?: boolean): Promise<any>;
    setOverlay(): void;
    load(image: string, editingElement: any, format: string): Promise<any>;
    loadBlob(blob: Blob, repaint?: boolean): Promise<any>;
    setStage(): void;
    undo(): Promise<any>;
    backup(repaint?: boolean, updateHistory?: boolean): Promise<any>;
}
