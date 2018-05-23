import i18n from 'i18next';
import IsNil from 'lodash-es/isNil';
import Map from 'lodash-es/map';
import Merge from 'lodash-es/merge';
import Permissions from 'wes/permissions';
import XHR from 'i18next-xhr-backend';

import Log from 'neon-extension-framework/Core/Logger';
import Messaging from 'neon-extension-framework/Messaging';
import Preferences from 'neon-extension-framework/Preferences';
import {LocalStorage} from 'neon-extension-framework/Storage';


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

    get namespace() {
        return `${this.id}/common`;
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

    createI18n(namespaces = null, options = null) {
        namespaces = Map(namespaces || [], (ns) =>
            `${this.id}/${ns}`
        );

        return new Promise((resolve, reject) => {
            i18n.use(XHR).init(Merge({
                debug: true,
                fallbackLng: 'en',

                ns: [
                    ...namespaces,

                    `${this.id}/common`,
                    'neon-extension/common'
                ],

                defaultNS: namespaces[0],

                backend: {
                    allowMultiLoading: false,
                    loadPath: '/Locales/{{lng}}/{{ns}}.json'
                },

                interpolation: {
                    escapeValue: false
                }
            }, options || {}), (err, t) => {
                if(err) {
                    reject(err);
                    return;
                }

                resolve(t);
            });
        });
    }

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
        return Messaging.channel('neon-extension').service('contentScript').request('isRegistered', {
            pluginId: this.id,
            contentScripts: this.contentScripts
        });
    }

    registerContentScripts() {
        return this.removeContentScripts().then(() => {
            Log.info('Registering content scripts', this.contentScripts);

            // Register content scripts
            return Messaging.channel('neon-extension').service('contentScript').request('register', {
                pluginId: this.id,
                contentScripts: this.contentScripts
            });
        });
    }

    removeContentScripts() {
        Log.info('Removing content scripts', this.contentScripts);

        // Unregister content scripts
        return Messaging.channel('neon-extension').service('contentScript').request('unregister', {
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
