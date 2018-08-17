import { ImageView } from '../ImageView';
import { Tool } from '../Tool';
export declare class Resize implements Tool {
    imageView: ImageView;
    editingElement: any;
    handle: any;
    isResizing: boolean;
    initialSize: {
        width: number;
        height: number;
    };
    _scale: number;
    token: number;
    isInSetup: boolean;
    readonly ratio: number;
    readonly scale: number;
    readonly outputWidth: number;
    readonly outputHeight: number;
    stopResizing(): void;
    setWidth(width: number): void;
    setHeight(height: number): void;
    apply(options?: any): Promise<any>;
    placeTools(): void;
    resize(): void;
    setHandle(): void;
    lockOutput(): void;
    reset(): void;
    setup(): void;
    stop(): void;
    animate(): void;
    start(imageView: ImageView, editingElement: any): void;
}
