import { Me } from "./me";
import { skin } from "./skin";
import { model } from "./modelDefinitions";
import { Map } from "core-js";

/**
 * private variables
 */
let _manager = null;
let _enable = false;
let _promiseResolver: (t: tracking.TrackingManager) => void;
let _promise: Promise<tracking.TrackingManager> = new Promise((resolve, reject) => {
    _promiseResolver = resolve;
})

/**
 * private functions
 */
function getManager(): tracking.TrackingManager {
    if (_manager == null) {
        throw "Tracking Manager not initialized! Please use tracking.init(config)";
    }
    return _manager;
}

function managerFactory(config: tracking.TrackingConfig) {
    const type = config.type || "mixpanel";//Mix panel by default
    switch (type) {
        case "mixpanel":
            let clazz = mixpanelClazz(config);
            _manager = new clazz;
            break;
        default:
            throw "Tracking Manager initialization failed: unknown type " + type;
    }
    return _manager;
}



/**
 * MIX PANEL IMPLEMENTATIONS
 */
declare var mixpanel;
declare var window;
declare var MIXPANEL_CUSTOM_LIB_URL;
let TrackingManagerMixPanelClazz = null;
function mixpanelClazz(config: tracking.TrackingConfig) {
    if (TrackingManagerMixPanelClazz == null) {
        // @ts-ignore
        (function (e, a) { if (!a.__SV) { var b = window; try { var c, l, i, j = b.location, g = j.hash; c = function (a, b) { return (l = a.match(RegExp(b + "=([^&]*)"))) ? l[1] : null }; g && c(g, "state") && (i = JSON.parse(decodeURIComponent(c(g, "state"))), "mpeditor" === i.action && (b.sessionStorage.setItem("_mpcehash", g), history.replaceState(i.desiredHash || "", e.title, j.pathname + j.search))) } catch (m) { } var k, h; window.mixpanel = a; a._i = []; a.init = function (b, c, f) { function e(b, a) { var c = a.split("."); 2 == c.length && (b = b[c[0]], a = c[1]); b[a] = function () { b.push([a].concat(Array.prototype.slice.call(arguments, 0))) } } var d = a; "undefined" !== typeof f ? d = a[f] = [] : f = "mixpanel"; d.people = d.people || []; d.toString = function (b) { var a = "mixpanel"; "mixpanel" !== f && (a += "." + f); b || (a += " (stub)"); return a }; d.people.toString = function () { return d.toString(1) + ".people (stub)" }; k = "disable time_event track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user".split(" "); for (h = 0; h < k.length; h++)e(d, k[h]); a._i.push([b, c, f]) }; a.__SV = 1.2; b = e.createElement("script"); b.type = "text/javascript"; b.async = !0; b.src = "undefined" !== typeof MIXPANEL_CUSTOM_LIB_URL ? MIXPANEL_CUSTOM_LIB_URL : "file:" === e.location.protocol && "//cdn4.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\/\//) ? "https://cdn4.mxpnl.com/libs/mixpanel-2-latest.min.js" : "//cdn4.mxpnl.com/libs/mixpanel-2-latest.min.js"; c = e.getElementsByTagName("script")[0]; c.parentNode.insertBefore(b, c) } })(document, window.mixpanel || []);
        mixpanel.init(config.apikey, { opt_out_tracking_by_default: true });
        TrackingManagerMixPanelClazz = class TrackingManagerMixPanel implements tracking.TrackingManager {
            _enable = false;
            _needOptin = true;
            private optin() {
                if (this._needOptin) {
                    if (this._enable) {
                        const has_opted_in = mixpanel.has_opted_in_tracking();
                        !has_opted_in && mixpanel.opt_in_tracking();
                    } else {
                        const has_opted_out = mixpanel.has_opted_out_tracking();
                        !has_opted_out && mixpanel.opt_out_tracking();
                    }
                }
                this._needOptin = false;
            }
            logEvent(event: "string", params: any) {
                this.optin();//optin only when needed
                return new Promise((resolve, reject) => {
                    mixpanel.track(event, params, _ => {
                        resolve();
                    });
                })
            }
            identify(user: { userid: string }) {
                this.optin();//optin only when needed
                return new Promise((resolve, reject) => {
                    mixpanel.alias(user.userid, _ => {
                        resolve();
                    })
                });
            }
            enable(enable: boolean) {
                this._enable = enable;
                //this.optin();//optin every time? => else not working
            }
        }
    }
    return TrackingManagerMixPanelClazz;
}

/**
 * event history
 */

class TrackingHistory {
    static MAX_AGE = 10;
    eventHistory: Map<string, number> = null;
    constructor() {
        try {
            let history = window.localStorage.getItem("tracking.events.history");
            if (history) {
                this.eventHistory = new Map(JSON.parse(history));
            }
            //
            if (!(this.eventHistory instanceof Map)) {
                this.eventHistory = new Map();
            }
            this.eventHistory.forEach((_, key) => {
                //increase age of event
                let age = this.eventHistory.get(key) + 1;
                this.eventHistory.set(key, age)
                if (age > TrackingHistory.MAX_AGE) {
                    this.eventHistory.delete(key);
                }
            });
            this.save();
        } catch (e) {
            console.error("[TrackingHistory] failed to load: ", e)
        }
    }

    private save() {
        try {
            window.localStorage.setItem("tracking.events.history", JSON.stringify(this.eventHistory));
        } catch (e) {
            console.warn("[TrackingHistory] localStorage is not available")
        }
    }

    push(event: string) {
        try {
            this.eventHistory.set(event, 0);
            this.save();
        } catch (e) {
            console.error("[TrackingHistory] failed to push event: " + event, e)
        }
    }
    getAge(event: string) {
        return this.eventHistory.has(event) ? this.eventHistory.get(event) : -1;
    }
}
const _trackingHistory = new TrackingHistory;


/**
 * session history
 */
type sessionState = "notexists" | "exists";
type sessionTransition = "disconnected" | "connected" | "still-connected" | "still-disconnected";
class SessionHistory {
    sessionHistory: { previous: sessionState, current: sessionState } = null;
    constructor() {
        try {
            let history = window.localStorage.getItem("tracking.session.history");
            if (history) {
                this.sessionHistory = JSON.parse(history);
            }
            //
            if (!this.sessionHistory) {
                this.sessionHistory = { current: "notexists", previous: "notexists" };
            }
        } catch (e) {
            console.error("[SessionHistory] failed to load: ", e)
        }
    }

    private save() {
        try {
            window.localStorage.setItem("tracking.session.history", JSON.stringify(this.sessionHistory));
        } catch (e) {
            console.warn("[SessionHistory] localStorage is not available")
        }
    }

    setCurrent(event: sessionState) {
        try {
            this.sessionHistory.previous = this.sessionHistory.current;
            this.sessionHistory.current = event;
            this.save();
        } catch (e) {
            console.error("[SessionHistory] failed to push event: " + event, e)
        }
    }
    get transition(): sessionTransition {
        switch (this.sessionHistory.current) {
            case "exists":
                {
                    switch (this.sessionHistory.previous) {
                        case "exists":
                            return "still-connected";
                        case "notexists":
                            return "connected";
                    }
                }
            case "notexists":
                {
                    switch (this.sessionHistory.previous) {
                        case "notexists":
                            return "still-disconnected";
                        case "exists":
                            return "disconnected";
                    }
                }
        }
    }
}
const _sessionHistory = new SessionHistory;

/**
 * public APIs
 */
export namespace tracking {

    export const globalProperties = {};

    export interface TrackingManager {
        enable(enable: boolean);
        logEvent(event: string, params?: any): Promise<any>;
        identify(user: { userid: string }): Promise<any>;
    }

    export interface TrackingConfig {
        type?: "mixpanel";//today only mixpanel
        apikey?: string
    }

    export interface RuleCondition {
        and?: RuleCondition;
        ruleType: RuleType;
        urlMatch?: RegExp;
        elementClicked?: string;
        formSubmitted?: string;
        ajaxRequestUri?: RegExp;
        ajaxRequestMethod?: RegExp;
        ajaxRequestBodyJson?: string;
        lastEvent?: string;
        sessionTransition?: sessionTransition;
    }

    export type RuleType = "click" | "url-changed" | "form-submit" | "ajax-request" | "last-event" | "session-changed";

    export interface Rule {
        onlyOnPage?: RegExp;
        notOnPage?: RegExp;
        when: RuleCondition
        then: { event: string, params?: any } | string
    }

    export function init(config: TrackingConfig, enabled = null) {
        if (_manager != null) {
            console.warn("Tracking Manager already initialized!");
            return;
        }
        managerFactory(config);
        if (enabled !== null) {
            tracking.enable(enabled);
        }
    }

    export async function enable(enable: boolean) {
        _enable = enable;
        await _promise;
        getManager().enable(enable);
    }

    export async function logEvent(event: string, params: any = {}) {
        if (_enable) {
            await _promise;
            _trackingHistory.push(event);
            await getManager().logEvent(event, { ...globalProperties, ...params });
        }
    }
    export async function identify(user: { userid: string }) {
        await _promise
        await getManager().identify(user);
    }
}


/**
 * rule filters
 */
declare var jQuery;
interface RuleFilter {
    (rule: tracking.RuleCondition, args?: any): Boolean
}

function ruleFilterURLChanged(rule: tracking.RuleCondition) {
    let url = window.location.href;
    return rule.urlMatch.test(url);
}

function ruleFilterClickElement(rule: tracking.RuleCondition, event) {
    let trackingName = jQuery(event.target).attr("data-tracking");
    if (!trackingName) {
        console.warn("Tracking name is not setted on clicked element : ", event)
        return false;
    }
    return rule.elementClicked == trackingName;
}

function ruleFilterFormSubmit(rule: tracking.RuleCondition, event) {
    let trackingName = jQuery(event.target).attr("data-tracking");
    if (!trackingName) {
        console.warn("Tracking name is not setted on submited form : ", event)
        return false;
    }
    return rule.formSubmitted == trackingName;
}

function ruleFilterLastEvent(rule: tracking.RuleCondition) {
    let age = _trackingHistory.getAge(rule.lastEvent);
    return age == 1;//means it has been load on previous page
}

function ruleFilterSession(rule: tracking.RuleCondition) {
    return _sessionHistory.transition == rule.sessionTransition;
}

function ruleFilterAjaxRequest(rule: tracking.RuleCondition, event) {
    if (rule.ajaxRequestMethod && !rule.ajaxRequestMethod.test(event.method)) {
        return false;
    }
    if (rule.ajaxRequestUri && !rule.ajaxRequestUri.test(event.url)) {
        return false;
    }
    if (rule.ajaxRequestBodyJson) {
        try {
            const body =JSON.parse( event.body);
            if (!eval(rule.ajaxRequestBodyJson)) {
                return false;
            }
        } catch (e) {
            console.warn('Failed to eval body criteria : ', rule.ajaxRequestBodyJson)
            return false;
        }
    }
    return true;
}

/**
 * rule event emitter
 */

class RuleEventEmitter {
    previousActivated = new Set<tracking.RuleType>()
    private clickListener = async (event) => {
        try {
            if (_clickIgnore.indexOf(event.target) == -1) {
                if (this.engine.test("click", event)) {
                    event.preventDefault();
                    event.stopPropagation();
                    _clickIgnore.push(event.target)
                    await this.engine.emit("click", event);
                    // send click event
                    //https://stackoverflow.com/questions/12925153/jquery-click-works-on-every-browser-but-safari
                    const a = event.target;
                    if (a.click)
                        a.click();
                    else {
                        const evObj: any = document.createEvent('MouseEvents');
                        evObj.initMouseEvent('click', true, true, window);
                        a.dispatchEvent(evObj);
                    }
                } else {
                    return true;
                }
            } else {
                _clickIgnore = _clickIgnore.filter(e => e !== event.target);
                return true;
            }
        } catch (e) { console.error(e); }
    };
    private hashEventListener = async (event) => {
        await this.engine.emit("url-changed", window.location.hash);
    }
    private submitListener = async (event) => {
        try {
            if (_submitIgnore.indexOf(event.target) == -1) {
                if (this.engine.test("form-submit", event)) {
                    event.preventDefault();
                    event.stopPropagation();
                    _submitIgnore.push(event.target)
                    await this.engine.emit("form-submit", event);
                    jQuery(event.target).trigger("submit");
                } else {
                    return true;
                }
            } else {
                _submitIgnore = _submitIgnore.filter(e => e !== event.target);
                return true;
            }
        } catch (e) { console.error(e); }
    };

    constructor(private engine: TrackingRuleEngine) { }
    private bindClick(bind: boolean) {
        if (bind) {
            jQuery(document).ready(_ => {
                jQuery("body").on('click', '[data-tracking]', this.clickListener);
            })
        } else {
            jQuery("body").off("click", this.clickListener);
        }
    }
    private bindSubmit(bind: boolean) {
        if (bind) {
            jQuery(document).ready(_ => {
                jQuery("body").on('submit', '[data-tracking]', this.submitListener);
            })
        } else {
            jQuery("body").off("submit", this.submitListener);
        }
    }
    _ajaxNotBounded = true;
    private bindAjaxRequest(bind: boolean) {
        if (bind) {
            if (this._ajaxNotBounded) {
                const self = this;
                //
                const xhrProto = XMLHttpRequest.prototype,
                    origOpen = xhrProto.open,
                    origSend = xhrProto.send;

                xhrProto.open = function (method, url) {
                    this._url = url;
                    this._method = method;
                    return origOpen.apply(this, arguments);
                };
                //
                xhrProto.send = function (data) {
                    if ((<any>XMLHttpRequest.prototype).trackingEnabled) {
                        try {
                            //avoid emit if not needed
                            if (self.engine.test("ajax-request", { url: this._url, method: this._method, body: data })) {
                                self.engine.emit("ajax-request", { url: this._url, method: this._method, body: data })
                            }
                        } catch (e) {
                            console.warn("Failed to track ajax request", e)
                        }
                    }
                    origSend.apply(this, arguments);
                }
                this._ajaxNotBounded = false;
            }
            (<any>XMLHttpRequest.prototype).trackingEnabled = true;
        } else {
            (<any>XMLHttpRequest.prototype).trackingEnabled = false;
        }
    }
    private bindHashChange(bind: boolean) {
        try {
            if (bind) {
                if (window.HashChangeEvent) {
                    window.addEventListener("hashchange", this.hashEventListener)
                }
            } else {
                window.removeEventListener("hashchange", this.hashEventListener);
            }
        } catch (e) {
            console.warn("[RuleEventEmitter] could not bind hashchange listener", e)
        }
    }

    private shouldNotSkip(type: tracking.RuleType, currentActivated: Set<tracking.RuleType>) {
        //unbind or has not been activated yet
        return !currentActivated.has(type) || !this.previousActivated.has(type);
    }

    tryStart() {
        const activated = new Set<tracking.RuleType>();
        this.engine.rules.forEach(rule => {
            if (rule.currentType) {
                activated.add(rule.currentType);
            }
        })
        //
        this.shouldNotSkip("click", activated) && this.bindClick(activated.has("click"));
        this.shouldNotSkip("form-submit", activated) && this.bindSubmit(activated.has("form-submit"));
        this.shouldNotSkip("ajax-request", activated) && this.bindAjaxRequest(activated.has("ajax-request"));
        this.shouldNotSkip("url-changed", activated) && this.bindHashChange(activated.has("url-changed"))
        //TODO bind ajax response
        //store activated
        this.previousActivated.clear();
        activated.forEach(act => this.previousActivated.add(act));
    }


    async tryEmit() {
        let nbEmit = await this.engine.emit("url-changed")
        nbEmit += await this.engine.emit("last-event");//auto check on success
        return nbEmit
    }

    stop() {
        try {
            this.bindClick(false);
            this.bindSubmit(false);
            this.bindAjaxRequest(false);
            this.bindHashChange(false)
        } catch (e) {
            console.error("[RuleEventEmitter] Could not stop: ", e);
        }
    }
}

/**
 * rule engine
 */
class RuleState {
    current: tracking.RuleCondition;
    constructor(public rule: tracking.Rule) {
        this.reset();
    }
    reset() {
        this.current = this.rule.when;
    }
    next() {
        this.current && (this.current = this.current.and);
    }
    get finished() {
        return !this.current;
    }
    get currentType() {
        return this.current && this.current.ruleType;
    }
}

let _clickIgnore = [];
let _submitIgnore = [];
class TrackingRuleEngine {
    rules: RuleState[] = [];
    filters: Map<tracking.RuleType, RuleFilter> = new Map();
    emiter = new RuleEventEmitter(this);

    private getFilter(ruleType: tracking.RuleType): RuleFilter {
        if (!this.filters.has(ruleType)) {
            throw "Could not found a filter for ruletype: " + ruleType;
        }
        return this.filters.get(ruleType);
    }

    constructor() {
        this.filters.set("click", ruleFilterClickElement);
        this.filters.set("form-submit", ruleFilterFormSubmit);
        this.filters.set("last-event", ruleFilterLastEvent);
        this.filters.set("session-changed", ruleFilterSession);
        this.filters.set("url-changed", ruleFilterURLChanged)
        this.filters.set("ajax-request", ruleFilterAjaxRequest)
    }

    start() {
        try {
            this.emiter.tryStart();
            this.emiter.tryEmit();
        } catch (e) {
            console.error("[RuleEngine] Could not start: ", e);
        }
    }

    stop() {
        this.emiter.stop();
    }

    reset() {
        for (let ruleState of this.rules) {
            ruleState.reset();
        }
    }

    async emit(ruleType: tracking.RuleType, args?: any): Promise<number> {
        try {
            let nbSuccess = 0;
            let nbEmit = 0;
            let filter = this.getFilter(ruleType);
            for (let ruleState of this.rules) {
                if (ruleState.currentType == ruleType && !ruleState.finished) {
                    if (ruleState.current && filter(ruleState.current, args)) {
                        ruleState.next();
                        nbSuccess++;
                    }
                    if (ruleState.finished) {
                        let then = ruleState.rule.then;
                        if (typeof then == "string") {
                            await tracking.logEvent(then)
                            nbEmit++;
                        } else {
                            await tracking.logEvent(then.event, then.params)
                            nbEmit++;
                        }
                        //TODO should reset state? if so apply multiple times
                        //ruleState.reset();
                    }
                }
            }
            if (nbSuccess > 0) {
                this.emiter.tryStart();
                nbEmit += await this.emiter.tryEmit();
            }
            return nbEmit;
        } catch (e) {
            console.error("[RuleEngine] Could not emit event: ", e);
        }
    }

    test(ruleType: tracking.RuleType, args?: any) {
        let filter = this.getFilter(ruleType);
        for (let ruleState of this.rules) {
            if (ruleState.currentType == ruleType && !ruleState.finished) {
                if (ruleState.current && filter(ruleState.current, args)) {
                    return true;
                }
            }
        }
        return false;
    }

    register(rule: tracking.Rule) {
        try {
            if (rule.onlyOnPage) {
                rule.onlyOnPage.test(window.location.href) && this.rules.push(new RuleState(rule))
            } else if (rule.notOnPage) {
                !rule.notOnPage.test(window.location.href) && this.rules.push(new RuleState(rule))
            } else {
                this.rules.push(new RuleState(rule))
            }
        } catch (e) {
            console.error("[RuleEngine] Could not register rule: ", e, rule.then);
        }
    }

    registerAll(rules: tracking.Rule[]) {
        rules.forEach(rule => this.register(rule))
    }
}

/**
 * bootstrap
 */
function sessionCallback(engine: TrackingRuleEngine) {
    if (window.notLoggedIn) {
        _sessionHistory.setCurrent("notexists")
        engine.start();//start only after knowing user
        engine.emit("session-changed");
        return false;
    } else {
        _sessionHistory.setCurrent("exists")
        model.one("preferences-updated", async  _ => {
            tracking.globalProperties["$UserId"] = Me.session.userId;
            tracking.globalProperties["$Login"] = Me.session.login;
            tracking.identify({ userid: Me.session.userId })
            engine.start();//start only after knowing user
            engine.emit("session-changed");
        })
        return true;
    }
}

async function start() {
    let config = await skin.getConfig();
    const cAnalytics = config.analytics;
    if (cAnalytics) {
        await tracking.init(cAnalytics, true);
        _promiseResolver(getManager());
        tracking.globalProperties["$Origin"] = "web";

        let engine = new TrackingRuleEngine;
        //TODO move to theme-conf?
        engine.registerAll([{
            onlyOnPage: /\/login/,
            when: {
                ruleType: "form-submit",
                formSubmitted: "login"
            },
            then: "login"
        }, {
            onlyOnPage: /\/login/,
            when: {
                ruleType: "last-event",
                lastEvent: "login",
            },
            then: "loginFailed"
        }, {
            when: {
                ruleType: "session-changed",
                sessionTransition: "disconnected"
            },
            then: "logout"
        }, {
            onlyOnPage: /\/actualites/,
            when: {
                ruleType: "url-changed",
                urlMatch: /actualites#\/default/,
            },
            then: "readNews"
        }, {
            onlyOnPage: /\/actualites/,
            when: {
                ruleType: "url-changed",
                urlMatch: /actualites#\/view/,
            },
            then: "readNews"
        }, {
            onlyOnPage: /\/blog/,
            when: {
                ruleType: "url-changed",
                urlMatch: /blog#\/view/,
            },
            then: "readNews"
        }, {
            onlyOnPage: /\/schoolbook/,
            when: {
                ruleType: "ajax-request",
                ajaxRequestMethod:/post/i,
                ajaxRequestUri: /\/schoolbook\/relation\/acknowledge/
            },
            then: "confirmWord"
        }, {
            onlyOnPage: /\/conversation/,
            when: {
                ruleType: "ajax-request",
                ajaxRequestUri: /\/conversation\/send/,
                ajaxRequestMethod: /([post put])/i
            },
            then: "sendMessage"
        }, {
            onlyOnPage: /\/homeworks/,
            when: {
                ruleType: "ajax-request",
                ajaxRequestUri: /\/homeworks\/get/,
                ajaxRequestMethod: /get/i
            },
            then: "readHomework"
        }, {
            onlyOnPage: /\/exercizer/,
            when: {
                ruleType: "ajax-request",
                ajaxRequestUri: /\/schedule-subject\/modify/,
                ajaxRequestMethod: /post/i
            },
            then: "modifyDistribution"
        }, {
            onlyOnPage: /\/exercizer/,
            when: {
                ruleType: "ajax-request",
                ajaxRequestUri: /\/schedule(-simple)?-subject/,
                ajaxRequestMethod: /post/i
            },
            then: "planDistribution"
        },{
            onlyOnPage: /\/exercizer/,
            when: {
                ruleType: "ajax-request",
                ajaxRequestUri: /\/schedule(-simple)?-subject/,
                ajaxRequestMethod: /post/i,
                ajaxRequestBodyJson:"body.scheduledAt.exclude.length > 0"
            },
            then: "excludeStudent - beforeDistribution"
        }, {
            onlyOnPage: /\/exercizer/,
            when: {
                ruleType: "ajax-request",
                ajaxRequestUri: /\/action\/exclude/,
                ajaxRequestMethod: /post/i
            },
            then: "excludeStudent - afterDistribution"
        }, {
            notOnPage: /userbook\/annuaire/,
            when: {
                ruleType: "ajax-request",
                ajaxRequestUri: /\/directory\/sharebookmark/,
                ajaxRequestMethod: /post/i
            },
            then: "createShareBookMarkFromSharePanel"
        }, {
            notOnPage: /userbook\/annuaire/,
            when: {
                ruleType: "ajax-request",
                ajaxRequestUri: /\/directory\/sharebookmark\/([^all])/,
                ajaxRequestMethod: /get/i
            },
            then: "selectShareBookMarkFromSharePanel"
        }, {
            onlyOnPage: /userbook\/annuaire/,
            when: {
                ruleType: "ajax-request",
                ajaxRequestUri: /\/directory\/sharebookmark/,
                ajaxRequestMethod: /post/i
            },
            then: "createShareBookMarkFromDirectory"
        }, {
            onlyOnPage: /userbook\/annuaire/,
            when: {
                ruleType: "ajax-request",
                ajaxRequestUri: /\/directory\/sharebookmark/,
                ajaxRequestMethod: /put/i
            },
            then: "updateShareBookMarkFromDirectory"
        }, {
            onlyOnPage: /userbook\/annuaire/,
            when: {
                ruleType: "ajax-request",
                ajaxRequestUri: /\/directory\/sharebookmark/,
                ajaxRequestMethod: /delete/i
            },
            then: "deleteShareBookMarkFromDirectory"
        }, {
            onlyOnPage: /userbook\/annuaire/,
            when: {
                ruleType: "ajax-request",
                ajaxRequestUri: /\/communication\/visible/,
                ajaxRequestMethod: /post/i,
                ajaxRequestBodyJson:"body.groupType"
            },
            then: "searchGroupFromDirectory"
        }, {
            onlyOnPage: /userbook\/annuaire/,
            when: {
                ruleType: "ajax-request",
                ajaxRequestUri: /\/communication\/visible/,
                ajaxRequestMethod: /post/i,
                ajaxRequestBodyJson:"!body.groupType"
            },
            then: "searchUserFromDirectory"
        }, {
            onlyOnPage: /\/stat/,
            when: {
                ruleType: "ajax-request",
                ajaxRequestUri: /\/statistics\/data/,
                ajaxRequestMethod: /post/i,
                ajaxRequestBodyJson:"body.indicator=='LOGIN'"
            },
            then: "consultMetric - Login"
        }, {
            onlyOnPage: /\/stat/,
            when: {
                ruleType: "ajax-request",
                ajaxRequestUri: /\/statistics\/data/,
                ajaxRequestMethod: /post/i,
                ajaxRequestBodyJson:"body.indicator=='ACTIVATION'"
            },
            then: "consultMetric - Activation"
        }, {
            onlyOnPage: /\/stat/,
            when: {
                ruleType: "ajax-request",
                ajaxRequestUri: /\/statistics\/data/,
                ajaxRequestMethod: /post/i,
                ajaxRequestBodyJson:"body.indicator=='UNIQUE_VISITORS'"
            },
            then: "consultMetric - UniqueVisitor"
        }, {
            onlyOnPage: /\/stat/,
            when: {
                ruleType: "ajax-request",
                ajaxRequestUri: /\/statistics\/data/,
                ajaxRequestMethod: /post/i,
                ajaxRequestBodyJson:"body.indicator=='ACTIVATED_ACCOUNTS'"
            },
            then: "consultMetric - ActivatedAccounts"
        }, {
            onlyOnPage: /\/stat/,
            when: {
                ruleType: "ajax-request",
                ajaxRequestUri: /\/statistics\/data/,
                ajaxRequestMethod: /post/i,
                ajaxRequestBodyJson:"body.indicator=='ACCESS'"
            },
            then: "consultMetric - Access"
        }]);

        //login event
        sessionCallback(engine);
    }
}
start();


window.entcore = window.entcore || {};
window.entcore.tracking = tracking;