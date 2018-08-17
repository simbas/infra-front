export interface Shareable {
    shared: any;
    owner: {
        userId: string;
        displayName: string;
    };
    myRights: any;
}
export declare class Rights<T extends Shareable> {
    private resource;
    constructor(resource: T);
    myRights: any;
    isOwner(): boolean;
    fromBehaviours(prefix?: string): Promise<any>;
    fromObject(obj: any, prefix: string): Promise<any>;
}
