import Preferences from 'eon.extension.browser/preferences';
import Log from 'eon.extension.framework/core/logger';
import {isDefined} from 'eon.extension.framework/core/helpers';

import merge from 'lodash-es/merge';


export default class Plugin {
    constructor(id, type, manifest) {
        this.id = id;
        this.type = type;

        this.manifest = manifest || null;

        // Validate manifest
        this.valid = this.validate();

        // Construct preferences context
        this.preferences = Preferences.context(this.id);

        // Private variables
        this._enabledTodo = false;
    }

    get enabled() {
        if(!this._enabledTodo) {
            Log.warn('Plugin "%s": check if the plugin has been enabled', this.id);
            this._enabledTodo = true;
        }

        return true;
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

        // Retrieve content script origins
        let origins = [].concat.apply([], this.contentScripts.map((contentScript) => {
            if(!isDefined(contentScript.conditions)) {
                Log.warn('Content script has no conditions:', contentScript);
                return [];
            }

            return contentScript.conditions
                .map((condition) => {
                    if(!isDefined(contentScript.conditions)) {
                        Log.warn('Condition has no pattern:', condition);
                        return null;
                    }

                    return condition.pattern;
                })
                .filter((pattern) => {
                    return pattern !== null;
                });
        }));

        // Build permissions object, and merge manifest permissions
        return merge({
            permissions: [],
            origins: origins
        }, this.manifest['permissions']);
    }

    // endregion

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
}
