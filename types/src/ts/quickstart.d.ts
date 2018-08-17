export declare let quickstart: {
    steps: {};
    state: any;
    types: {
        ENSEIGNANT: string;
        ELEVE: string;
        PERSEDUCNAT: string;
        PERSRELELEVE: string;
    };
    mySteps: any[];
    assistantIndex: {};
    assistantStep: (index: any) => string;
    nextAssistantStep: () => void;
    seeAssistantLater(): void;
    nextAppStep: () => any;
    previousAppStep: () => any;
    goToAppStep: (index: any) => any;
    closeApp: () => void;
    appIndex: () => any;
    previousAssistantStep: () => void;
    save: (cb?: () => void) => void;
    goTo: (index: any) => void;
    loaded: boolean;
    awaiters: any[];
    load: (cb: any) => void;
};
