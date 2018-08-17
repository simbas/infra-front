export declare class Me {
    static preferences: any;
    static loading: any[];
    private static eventer;
    static readonly session: any;
    static savePreference(app: string): Promise<void>;
    static preference(app: string): Promise<any>;
}
