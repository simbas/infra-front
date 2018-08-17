import { ImageView } from '../ImageView';
import { Tool } from '../Tool';
export declare class Crop implements Tool {
    imageView: ImageView;
    editingElement: any;
    handle: any;
    readonly outputWidth: number;
    readonly outputHeight: number;
    readonly outputLeft: number;
    readonly outputTop: number;
    stop(): void;
    apply(options?: any): Promise<any>;
    placeTools(): void;
    setHandle(): void;
    start(imageView: ImageView, editingElement: any): void;
}
