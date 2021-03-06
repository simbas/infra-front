
export class Controller {
    name: string;
    contents: any[];

    constructor(name: string, contents: any[]) {
        this.name = name;
        this.contents = contents;
    }
}

export class Directive {
    name: string;
    contents: any;

    constructor(name: string, contents: any) {
        this.name = name;
        this.contents = contents;
        if(this.contents.templateUrl){
            const split = document.getElementById('context').getAttribute('src').split('-');
            const hash = split[split.length - 1].split('.')[0];
            this.contents.templateUrl += '?hash=' + hash;
        }
    }
}

export class Filter {
    name: string;
    contents: any;

    constructor(name: string, contents: any) {
        this.name = name;
        this.contents = contents;
    }
}

export class Service {
    name: string;
    contents: any;

    constructor(name: string, contents: any) {
        this.name = name;
        this.contents = contents;
    }
}

export class Ng {
    controllers: Controller[];
    directives: Directive[];
    filters: Filter[];
    services: Service[];
    requiredModules: string[];
    cb: ((module) => void)[];

    constructor() {
        this.controllers = [];
        this.directives = [];
        this.filters = [];
        this.services = [];
        this.requiredModules = [];
        this.cb = [];
    }

    init(module) {
        this.directives.forEach((dir) => {
            module.directive(dir.name, dir.contents);
        });
        this.controllers.forEach((ctrl) => {
            module.controller(ctrl.name, ctrl.contents);
        });
        this.filters.forEach((fil) => {
            module.filter(fil.name, fil.contents);
        });
        this.services.forEach((s) => {
            module.service(s.name, s.contents);
        });
        this.requiredModules.forEach((m) => {
            module.requires.push(m);
        });

        this.cb.forEach(cb => cb(module));
    }

    directive(name: string, contents: any): Directive {
        return new Directive(name, contents);
    }

    service(name: string, contents: any): Directive {
        return new Service(name, contents);
    }

    controller (name: string, contents: any): Controller {
        return new Controller(name, contents);
    }

    filter(name: string, contents: any): Filter {
        return new Filter(name, contents);
    }

    addRequiredModule(moduleName: string) {
        this.requiredModules.push(moduleName);
    }

    onInit(cb: (module) => void){
        this.cb.push(cb);
    }
};

export var ng = new Ng();
if (!window.entcore) {
    window.entcore = {};
}
window.entcore.ng = ng;