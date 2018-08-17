/// <reference types="pixi.js" />
import { ImageView } from './ImageView';
import { Tool } from './Tool';
import { Document } from '../workspace';
export declare class ImageEditor {
    static loaded: boolean;
    static loading: boolean;
    imageView: ImageView;
    renderer: PIXI.CanvasRenderer | PIXI.WebGLRenderer;
    editingElement: any;
    tool: Tool;
    document: Document;
    constructor();
    destroy(): void;
    cancel(keepHistory?: boolean): Promise<void>;
    useTool(name: string, options?: any): Promise<void>;
    applyChanges(options?: any): Promise<void>;
    saveChanges(): Promise<void>;
    readonly hasHistory: boolean;
    readonly canApply: boolean;
    static init(): Promise<{}>;
    drawGl(): void;
    drawCanvas(): void;
    draw(el: any): void;
    drawDocument(document: Document): Promise<void>;
    restoreOriginal(): Promise<void>;
    undo(): Promise<void>;
}
