export declare class Controller {
    name: string;
    contents: any[];
    constructor(name: string, contents: any[]);
}
export declare class Directive {
    name: string;
    contents: any;
    constructor(name: string, contents: any);
}
export declare class Filter {
    name: string;
    contents: any;
    constructor(name: string, contents: any);
}
export declare class Service {
    name: string;
    contents: any;
    constructor(name: string, contents: any);
}
export declare class Ng {
    controllers: Controller[];
    directives: Directive[];
    filters: Filter[];
    services: Service[];
    requiredModules: string[];
    cb: ((module) => void)[];
    constructor();
    init(module: any): void;
    directive(name: string, contents: any): Directive;
    service(name: string, contents: any): Directive;
    controller(name: string, contents: any): Controller;
    filter(name: string, contents: any): Filter;
    addRequiredModule(moduleName: string): void;
    onInit(cb: (module) => void): void;
}
export declare var ng: Ng;
