export declare const linker: {
    name: string;
    run: (instance: any) => {
        template: string;
        link: (scope: any, element: any, attributes: any) => void;
    };
};
export declare const unlink: {
    name: string;
    run: (instance: any) => {
        template: string;
        link: (scope: any, element: any, attributes: any) => void;
    };
};
