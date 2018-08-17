export interface IModel {
    api: {
        get?: string;
        put?: string;
        post?: string;
        delete?: string;
    };
}
export declare class Model {
    constructor(data?: any);
}
export interface Model {
    build(): any;
    updateData(data: any, refreshView?: boolean): any;
    makeModel(ctr: any, mixin?: any, namespace?: any): any;
    makeModels(ctrList: any[] | any): any;
    sync(): any;
    saveModifications(): any;
    create(): any;
    save(): any;
    remove(): any;
    models: Model[];
    collection(ctr: any, mixin?: any): any;
    on(eventName: string, callback: (data?: any) => void): any;
    unbind(eventName: string, callback: () => void): any;
    one(eventName: string, callback: (data?: any) => void): any;
    trigger(eventName: string, eventData?: any): any;
    behaviours(serviceName: string): any;
    inherits(target: any, prototypeFn: any): any;
    selected: boolean;
    myRights: Map<string, boolean>;
}
export declare class BaseModel extends Model {
    me: any;
    calendar: any;
    widgets: any;
    mediaLibrary: any;
    bootstrapped: boolean;
    build(): void;
}
export declare var model: BaseModel;
export declare class Collection<T> {
    all: T[];
    obj: any;
    callbacks: {};
    constructor(obj: any);
}
export interface Collection<T> {
    sync: any;
    composer: any;
    model?: any;
    on(eventName: string, cb: (data?: any) => void): any;
    one(eventName: string, cb: (data?: any) => void): any;
    trigger: (eventName: string) => void;
    unbind(eventName: string, callback: () => void): any;
    forEach(callback: (item: T) => void): any;
    first(): T;
    select(predicate: (item: T) => boolean): any;
    deselect(predicate: (item: T) => boolean): any;
    selectAll(): any;
    deselectAll(): any;
    concat(col: Collection<T>): any;
    closeAll(): any;
    current: T;
    setCurrent(item: T): any;
    map: (filter: (item: T) => T) => void;
    filter: (filter: (item: T) => boolean) => T[];
    reject: (filter: (item: T) => boolean) => T[];
    findWhere: (filter: any) => T;
    find: (filter: (item: T) => boolean) => T;
    where: (filter: any) => T[];
    slice(index: number, nbItems: number): any;
    push: (item: T, refreshView?: boolean) => void;
    remove(item: T, refreshView?: boolean): any;
    removeAt(index: number): any;
    insertAt(index: number, item: T): any;
    moveUp(item: T): any;
    moveDown(item: T): any;
    getIndex(item: T): any;
    indexOf?: (item: T) => number;
    splice(...args: any[]): any;
    selectItem(item: T): any;
    selection: () => T[];
    removeSelection: () => void;
    addRange: (data: T[], cb?: (item: T) => void, refreshView?: boolean) => void;
    load: (data: T[], cb?: (item: T) => void, refreshView?: boolean) => void;
    empty: () => void;
    length(): number;
    request(httpMethod: string, path: string, cb?: (result: any) => void): any;
    contains(item: T): any;
    last(): T;
    removeAll(): any;
    toJSON(): any;
}
