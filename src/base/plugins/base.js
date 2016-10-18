import Preferences from 'eon.extension.browser/preferences';
import {isDefined} from 'eon.extension.framework/core/helpers';

import merge from 'lodash-es/merge';


export default class Plugin {
    constructor(id, type, manifest) {
        this.id = id;
        this.type = type;

        this.manifest = manifest || null;

        // Validate manifest
        if(!isDefined(this.manifest)) {
            console.warn('Plugin "%s": no manifest defined', this.id);
        } else if(!isDefined(this.manifest.name)) {
            console.warn('Plugin "%s": manifest has no "name" attribute', this.id);
        }

        // Construct preferences context
        this.preferences = Preferences.context(this.id);

        // Private variables
        this._enabledTodo = false;
    }

    get enabled() {
        if(!this._enabledTodo) {
            console.warn('Plugin "%s": check if the plugin has been enabled', this.id);
            this._enabledTodo = true;
        }

        return true;
    }

    get title() {
        if(this.manifest === null) {
            return null;
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
                console.warn('Content script has no conditions:', contentScript);
                return [];
            }

            return contentScript.conditions
                .map((condition) => {
                    if(!isDefined(contentScript.conditions)) {
                        console.warn('Condition has no pattern:', condition);
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

    dump() {
        return {
            id: this.id,
            type: this.type,
            title: this.title
        };
    }
}
