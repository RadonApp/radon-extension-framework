import IsNil from 'lodash-es/isNil';
import Permissions from 'wes/permissions';

import FrameworkPlugin from 'neon-extension-framework/core/plugin';
import Log from 'neon-extension-framework/core/logger';
import Messaging from 'neon-extension-framework/messaging';
import Preferences from 'neon-extension-framework/preferences';
import {LocalStorage} from 'neon-extension-framework/storage';


export default class Plugin {
    constructor(id, type) {
        this.id = id;
        this.type = type;

        // Retrieve manifest
        this.manifest = neon.manifests[id];

        // Validate manifest
        this.valid = this.validate();

        // Create storage context
        this.storage = LocalStorage.context(this.id);

        // Create preferences context
        this.preferences = Preferences.context(this.id);

        // Create messaging channel
        this.messaging = Messaging.channel(this.id);
    }

    get enabled() {
        throw new Error('Use the Plugin.isEnabled() method instead');
    }

    get title() {
        if(this.manifest === null || IsNil(this.manifest.title)) {
            return this.id.replace('neon-extension-', '');
        }

        return this.manifest.title;
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
        if(IsNil(this.manifest)) {
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
        // Check if content scripts have been registered
        return FrameworkPlugin.messaging.service('contentScript').request('isRegistered', {
            pluginId: this.id,
            contentScripts: this.contentScripts
        });
    }

    registerContentScripts() {
        return this.removeContentScripts().then(() => {
            Log.info('Registering content scripts', this.contentScripts);

            // Register content scripts
            return FrameworkPlugin.messaging.service('contentScript').request('register', {
                pluginId: this.id,
                contentScripts: this.contentScripts
            });
        });
    }

    removeContentScripts() {
        Log.info('Removing content scripts', this.contentScripts);

        // Unregister content scripts
        return FrameworkPlugin.messaging.service('contentScript').request('unregister', {
            pluginId: this.id,
            contentScripts: this.contentScripts
        });
    }

    // endregion

    // region Permissions

    isPermissionsGranted() {
        if(!Permissions.$exists()) {
            return Promise.resolve(true);
        }

        // Retrieve plugin permissions
        let permissions = this.permissions;

        if(IsNil(permissions) || Object.keys(permissions).length < 1) {
            return Promise.resolve(true);
        }

        // Check if `permissions` have been granted
        return Permissions.contains(permissions).then((granted) => {
            return granted;
        });
    }

    requestPermissions() {
        if(!Permissions.$exists()) {
            return Promise.resolve();
        }

        // Retrieve plugin permissions
        let permissions = this.permissions;

        if(IsNil(permissions) || Object.keys(permissions).length < 1) {
            return Promise.resolve();
        }

        // Request permissions
        Log.info('Requesting permissions', permissions);

        return Permissions.request(permissions);
    }

    removePermissions() {
        if(!Permissions.$exists()) {
            return Promise.resolve();
        }

        // Retrieve plugin permissions
        let permissions = this.permissions;

        if(IsNil(permissions) || Object.keys(permissions).length < 1) {
            return Promise.resolve();
        }

        // Request permissions
        Log.info('Removing permissions', permissions);

        return Permissions.remove(permissions);
    }

    // endregion

    // endregion
}
