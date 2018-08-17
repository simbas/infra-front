/// <reference types="pixi.js" />
import { ImageView } from '../ImageView';
import { Tool } from '../Tool';
export declare class Blur implements Tool {
    widthRatio: number;
    heightRatio: number;
    imageView: ImageView;
    mouse: {
        x: number;
        y: number;
    };
    isBlurring: boolean;
    editingElement: any;
    drawBrush(): PIXI.Graphics;
    readonly outputLeft: number;
    readonly outputTop: number;
    apply(options?: any): Promise<void>;
    blurAt(): void;
    placeTools(): void;
    stop(): void;
    start(imageView: ImageView, editingElement: any): void;
}
