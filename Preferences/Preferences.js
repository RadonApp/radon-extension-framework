import IsNil from 'lodash-es/isNil';
import Merge from 'lodash-es/merge';

import Log from '../Core/Logger';
import {LocalStorage} from '../Storage';
import PreferencesContext from './PreferencesContext';


export default class Preferences {
    constructor() {
        this._definitions = {};
        this._pages = {};
    }

    get bucket() {
        return LocalStorage.context('preferences');
    }

    get definitions() {
        return this._definitions;
    }

    get pages() {
        return this._pages;
    }

    context(name) {
        return new PreferencesContext(this, name, this.bucket.context(name));
    }

    exists(key) {
        return !IsNil(this._definitions[key]);
    }

    getDefaultValue(key, options) {
        options = Merge({
            timeout: 5000
        }, options);

        return new Promise((resolve, reject) => {
            let deferred = false;

            let get = () => {
                let definition = this._definitions[key];

                if(!IsNil(definition)) {
                    resolve(definition.options.default);
                    return;
                }

                if(deferred) {
                    reject(new Error('Unable to find preference definition for: "' + key + '"'));
                    return;
                }

                // Try retrieve definition again in `options.timeout` milliseconds
                deferred = true;
                setTimeout(get, options.timeout);
            };

            // Get default value
            get();
        });
    }

    // region Register

    register(item) {
        if(item.type === 'group') {
            return this.registerGroup(item);
        }

        if(item.type === 'page') {
            return this.registerPage(item);
        }

        // Ensure option hasn't already been registered
        if(!IsNil(this._definitions[item.id])) {
            Log.warn('Preference option %o has already been registered', item.id);
            return false;
        }

        // Store option reference
        this._definitions[item.id] = item;

        Log.trace('Registered preference option: %o', item.id, item);
        return true;
    }

    registerGroup(group) {
        Log.trace('Registered preference group: %o', group.id, group);

        // Register children
        for(let i = 0; i < group.children.length; ++i) {
            this.register(group.children[i]);
        }

        return true;
    }

    registerPage(page) {
        // Ensure page group exists
        if(IsNil(this._pages[page.plugin.type])) {
            this._pages[page.plugin.type] = {};
        }

        // Ensure page hasn't already been registered
        if(!IsNil(this._pages[page.plugin.type][page.id])) {
            Log.warn('Preference page %o has already been registered', page.id);
            return false;
        }

        // Store page reference
        this._pages[page.plugin.type][page.id] = page;

        Log.trace('Registered preference page: %o', page.id, page);

        // Register children
        for(let i = 0; i < page.children.length; ++i) {
            this.register(page.children[i]);
        }

        return true;
    }

    // endregion
}
