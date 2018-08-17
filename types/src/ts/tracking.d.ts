/**
 * public APIs
 */
export declare namespace tracking {
    const globalProperties: {};
    interface TrackingManager {
        enable(enable: boolean): any;
        logEvent(event: string, params?: any): Promise<any>;
        identify(user: {
            userid: string;
        }): Promise<any>;
    }
    interface TrackingConfig {
        type?: "mixpanel";
        apikey?: string;
    }
    interface RuleCondition {
        and?: RuleCondition;
        ruleType: RuleType;
        urlMatch?: RegExp;
        elementClicked?: string;
        formSubmitted?: string;
        ajaxRequestUri?: string;
        ajaxResponseCode?: number;
        lastEvent?: string;
    }
    type RuleType = "click" | "load-page" | "form-submit" | "ajax-response" | "last-event";
    interface Rule {
        when: RuleCondition;
        then: {
            event: string;
            params?: any;
        } | string;
    }
    function init(config: TrackingConfig, enabled?: any): void;
    function enable(enable: boolean): Promise<void>;
    function logEvent(event: string, params?: any): Promise<void>;
    function identify(user: {
        userid: string;
    }): Promise<void>;
}
