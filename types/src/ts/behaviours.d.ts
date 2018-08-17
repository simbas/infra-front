import { Shareable } from './rights';
export declare var Behaviours: {
    storedRights: any;
    sharingRights: () => Promise<any>;
    appSharingRights: (prefix: string) => Promise<any>;
    copyRights: (params: {
        provider: {
            resource: Shareable;
            application: string;
        };
        target: {
            resources: Shareable[];
            application: string;
        };
    }) => Promise<any>;
    register: (application: any, appBehaviours: any) => void;
    findRights: (serviceName: any, resource: any) => Promise<any>;
    findBehaviours: (serviceName: any, resource: any) => void;
    loadBehaviours: (serviceName: any, callback: any) => {
        error: (cb: any) => void;
    };
    load: (serviceName: string) => Promise<any>;
    findWorkflow: (serviceName: any) => Promise<any>;
    workflowsFrom: (obj: any, dependencies: any) => {};
    applicationsBehaviours: any;
};
