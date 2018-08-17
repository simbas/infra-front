import { ImageView } from '../ImageView';
import { Tool } from '../Tool';
export declare class Rotate implements Tool {
    imageView: ImageView;
    editingElement: any;
    apply(options?: any): Promise<any>;
    placeTools(): void;
    stop(): void;
    start(imageView: ImageView, editingElement: any): void;
}
