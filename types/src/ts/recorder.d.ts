export declare var recorder: {
    elapsedTime: number;
    loadComponents: () => void;
    isCompatible: () => boolean;
    stop: () => void;
    flush: () => void;
    record: () => void;
    pause: () => void;
    play: () => void;
    state: (callback: any) => void;
    title: string;
    status: string;
    save: () => void;
    mute: (mute: any) => void;
};
