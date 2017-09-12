import DeclarativeContent, {RequestContentScript, PageStateMatcher} from 'eon.extension.browser/declarative/content';
import Permissions from 'eon.extension.browser/permissions';

import Merge from 'lodash-es/merge';

import Log from 'eon.extension.framework/core/logger';
import Messaging from 'eon.extension.framework/messaging';
import Preferences from 'eon.extension.framework/preferences';
import Storage from 'eon.extension.framework/storage';
import {isDefined} from 'eon.extension.framework/core/helpers';


export default class Plugin {
    constructor(id, type, manifest) {
        this.id = id;
        this.type = type;

        this.manifest = manifest || null;

        // Validate manifest
        this.valid = this.validate();

        // Create storage context
        this.storage = Storage.context(this.id);

        // Create preferences context
        this.preferences = Preferences.context(this.id);

        // Create messaging channel
        this.messaging = Messaging.channel(this.id);
    }

    get enabled() {
        throw new Error('Use the Plugin.isEnabled() method instead');
    }

    get title() {
        if(this.manifest === null || !isDefined(this.manifest.name)) {
            return this.id.replace('eon.extension.', '');
        }

        return this.manifest.name;
    }

    // region Manifest properties

    get contentScripts() {
        if(this.manifest === null) {
            return [];
        }

        return this.manifest['content_scripts'] || [];
    }

    get permissions() {
        if(this.manifest === null) {
            return [];
        }

        return {
            origins: this.manifest.origins,
            permissions: this.manifest.permissions
        };
    }

    get release() {
        // Retrieve release details from manifest
        let release = {};

        if(isDefined(this.manifest) && isDefined(this.manifest.release)) {
            release = this.manifest.release;
        }

        // Set release defaults
        return Merge({
            date: null,
            version: null
        }, release);
    }

    // endregion

    // region Public methods

    isEnabled() {
        if(!this.preferences.exists('enabled')) {
            Log.warn('Unable to find an "enabled" option for %o', this.id);
            return Promise.resolve(true);
        }

        return this.preferences.getBoolean('enabled');
    }

    validate() {
        if(!isDefined(this.manifest)) {
            Log.warn('Plugin "%s": no manifest defined', this.id);
            return false;
        }

        return true;
    }

    dump() {
        return {
            id: this.id,
            type: this.type,
            title: this.title
        };
    }

    // region Content Scripts

    isContentScriptsRegistered() {
        if(!DeclarativeContent.supported) {
            return Promise.resolve(true);
        }

        // Retrieve plugin content scripts
        let contentScripts = this.contentScripts;

        if(!isDefined(contentScripts) || contentScripts.length < 1) {
            return Promise.resolve(true);
        }

        // Create declarative rules
        let {rules, rulesMap, ruleIds} = this._createDeclarativeRules(contentScripts);

        // Retrieve existing content scripts
        return DeclarativeContent.getRules(ruleIds).then((existingRules) => {
            if(rules.length !== existingRules.length) {
                return false;
            }

            // Build map of existing rules
            let existingRulesMap = {};

            existingRules.forEach((rule) => {
                existingRulesMap[rule.id] = rule;
            });

            // Verify rules match
            let matched = true;

            Object.keys(rulesMap).forEach((ruleId) => {
                let rule = rulesMap[ruleId];

                // Retrieve existing rule
                let existingRule = existingRulesMap[ruleId];

                if(!isDefined(existingRule)) {
                    matched = false;
                    return;
                }

                // Check if the rules match
                if(!DeclarativeContent.matches(rule, existingRule)) {
                    matched = false;
                }
            });

            return matched;
        });
    }

    registerContentScripts() {
        if(!DeclarativeContent.supported) {
            return Promise.resolve();
        }

        // Retrieve plugin content scripts
        let contentScripts = this.contentScripts;

        if(!isDefined(contentScripts) || contentScripts.length < 1) {
            return Promise.resolve();
        }

        // Parse content scripts
        let {rules, ruleIds} = this._createDeclarativeRules(contentScripts);

        // Register content scripts
        Log.info('Registering content scripts', rules);

        return DeclarativeContent.removeRules(ruleIds)
            .then(() => DeclarativeContent.addRules(rules));
    }

    removeContentScripts() {
        if(!DeclarativeContent.supported) {
            return Promise.resolve();
        }

        // Retrieve plugin content scripts
        let contentScripts = this.contentScripts;

        if(!isDefined(contentScripts) || contentScripts.length < 1) {
            return Promise.resolve();
        }

        // Parse content scripts
        let {ruleIds} = this._createDeclarativeRules(contentScripts);

        // Remove content scripts
        Log.info('Removing content scripts', ruleIds);

        return DeclarativeContent.removeRules(ruleIds);
    }

    // endregion

    // region Permissions

    isPermissionsGranted() {
        if(!Permissions.supported) {
            return Promise.resolve(true);
        }

        // Retrieve plugin permissions
        let permissions = this.permissions;

        if(!isDefined(permissions) || Object.keys(permissions).length < 1) {
            return Promise.resolve(true);
        }

        // Check if `permissions` have been granted
        return Permissions.contains(permissions).then((granted) => {
            return granted;
        });
    }

    requestPermissions() {
        if(!Permissions.supported) {
            return Promise.resolve();
        }

        // Retrieve plugin permissions
        let permissions = this.permissions;

        if(!isDefined(permissions) || Object.keys(permissions).length < 1) {
            return Promise.resolve();
        }

        // Request permissions
        Log.info('Requesting permissions', permissions);

        return Permissions.request(permissions);
    }

    removePermissions() {
        if(!Permissions.supported) {
            return Promise.resolve();
        }

        // Retrieve plugin permissions
        let permissions = this.permissions;

        if(!isDefined(permissions) || Object.keys(permissions).length < 1) {
            return Promise.resolve();
        }

        // Request permissions
        Log.info('Removing permissions', permissions);

        return Permissions.remove(permissions);
    }

    // endregion

    // endregion

    // region Private methods

    _createDeclarativeRules(contentScripts) {
        let rules = [];
        let rulesMap = {};
        let ruleIds = [];

        // Create declarative rules from content scripts
        contentScripts.forEach((script) => {
            script = Merge({
                id: null,
                conditions: [],
                css: [],
                js: []
            }, script);

            if(script.id === null) {
                Log.warn('Ignoring invalid content script: %O (invalid/missing "id" property)', script);
                return;
            }

            // Add rule identifier
            if(ruleIds.indexOf(script.id) !== -1) {
                Log.warn('Content script with identifier %o has already been defined', script.id);
                return;
            }

            ruleIds.push(script.id);

            // Build rule
            if(!Array.isArray(script.conditions) || script.conditions.length < 1) {
                Log.warn('Ignoring invalid content script: %O (invalid/missing "conditions" property)', script);
                return;
            }

            let rule = {
                id: script.id,

                actions: [
                    new RequestContentScript({
                        css: script.css,
                        js: script.js
                    })
                ],
                conditions: script.conditions.map((condition) => {
                    return new PageStateMatcher(condition);
                })
            };

            // Store rule
            rules.push(rule);
            rulesMap[script.id] = rule;
        });

        return {
            rules: rules,
            rulesMap: rulesMap,

            ruleIds: ruleIds
        };
    }

    // endregion
}
