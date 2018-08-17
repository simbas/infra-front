import { Eventer, Selection, Selectable } from 'entcore-toolkit';
import { Rights, Shareable } from './rights';
export declare class Quota {
    max: number;
    used: number;
    unit: string;
    constructor();
    appropriateDataUnit(bytes: number): {
        nb: number;
        order: any;
    };
    refresh(): Promise<void>;
}
export declare let quota: Quota;
export declare class Revision {
}
export declare enum DocumentStatus {
    initial = "initial",
    loaded = "loaded",
    failed = "failed",
    loading = "loading",
}
export declare class Document implements Selectable, Shareable {
    title: string;
    _id: string;
    created: any;
    path: string;
    metadata: {
        'content-type'?: string;
        role?: string;
        extension?: string;
        filename?: string;
        size?: number;
    };
    newProperties: {
        name?: string;
        legend?: string;
        alt?: string;
    };
    version: number;
    link: string;
    icon: string;
    owner: {
        userId: string;
        displayName: string;
    };
    eventer: Eventer;
    revisions: Revision[];
    status: DocumentStatus;
    selected: boolean;
    currentQuality: number;
    hiddenBlob: Blob;
    rights: Rights<Document>;
    private xhr;
    shared: any;
    alt: string;
    legend: string;
    name: string;
    toJSON(): {
        title: string;
        _id: string;
        created: any;
        path: string;
        metadata: {
            'content-type'?: string;
            role?: string;
            extension?: string;
            filename?: string;
            size?: number;
        };
        version: number;
        link: string;
        icon: string;
        owner: {
            userId: string;
            displayName: string;
        };
    };
    readonly myRights: any;
    delete(): Promise<void>;
    abort(): void;
    readonly size: string;
    loadProperties(): Promise<void>;
    readonly differentProperties: boolean;
    saveChanges(): Promise<void>;
    applyBlob(): Promise<void>;
    resetNewProperties(): void;
    fromJSON(data: any): void;
    refreshHistory(): Promise<void>;
    readonly isEditableImage: boolean;
    upload(file: File | Blob, visibility?: 'public' | 'protected' | 'owner'): Promise<any>;
    role(): string;
    protectedDuplicate(callback?: (document: Document) => void): Promise<Document>;
    publicDuplicate(callback?: (document: Document) => void): Promise<{}>;
    update(blob: Blob): Promise<void>;
    static role(fileType: any): string;
    trash(): Promise<any>;
}
export declare class Folder implements Selectable {
    selected: boolean;
    folders: Selection<Folder>;
    documents: Selection<Document>;
    folder: string;
    owner: string;
    deselectAll(): void;
    closeFolder(): void;
    addFolders(): void;
    isOpened(currentFolder: Folder): any;
    sync(): Promise<void>;
}
export declare class MyDocuments extends Folder {
    sync(): Promise<void>;
}
export declare class SharedDocuments extends Folder {
    sync(): Promise<void>;
}
export declare class AppDocuments extends Folder {
    sync(): Promise<void>;
}
export declare class PublicDocuments extends Folder {
    sync(): Promise<void>;
}
export declare class MediaLibrary {
    static myDocuments: MyDocuments;
    static sharedDocuments: SharedDocuments;
    static appDocuments: AppDocuments;
    static publicDocuments: PublicDocuments;
    static eventer: Eventer;
    static foldersStore: any[];
    static thumbnails: string;
    static deselectAll(): void;
    static upload(file: File | Blob, visibility?: 'public' | 'protected'): Promise<Document>;
}
