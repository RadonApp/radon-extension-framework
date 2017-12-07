import IsNil from 'lodash-es/isNil';

import Log from 'neon-extension-framework/core/logger';
import Preferences from 'neon-extension-framework/preferences';
import {Page} from 'neon-extension-framework/services/configuration/models';
import {isString} from 'neon-extension-framework/core/helpers';


export const OptionTypes = [
    'checkbox',
    'enable',
    'slider'
];

export class Registry {
    constructor() {
        this.components = {};

        this.plugins = {};
        this.pluginsByType = {};

        this.services = {};
        this.servicesByType = {};
    }

    getPluginById(id) {
        return this.plugins[id] || null;
    }

    getPluginServiceByType(pluginId, type) {
        if(typeof this.servicesByType[type] === 'undefined') {
            return null;
        }

        return this.servicesByType[type][pluginId + ':' + type] || null;
    }

    listPlugins(type, options) {
        if(!IsNil(type) && !isString(type)) {
            options = type;
            type = null;
        }

        // Set default options
        options = options || {};
        options.disabled = !IsNil(options.disabled) ? options.disabled : false;

        // Retrieve collection
        let plugins;

        if(!IsNil(type)) {
            plugins = this.pluginsByType[type];
        } else {
            plugins = this.plugins;
        }

        if(IsNil(plugins)) {
            return Promise.resolve([]);
        }

        // Find matching plugins, and check enabled states
        return Promise
            .all(Object.keys(plugins).map((key) => {
                let plugin = plugins[key];

                if(options.disabled === true) {
                    return plugin;
                }

                // Retrieve service enabled state
                return plugin.isEnabled().then((enabled) => {
                    if(!enabled) {
                        return null;
                    }

                    return plugin;
                });
            }))
            .then((services) => {
                return services.filter((service) => {
                    return service !== null;
                });
            });
    }

    listServices(type, options) {
        if(!IsNil(type) && !isString(type)) {
            options = type;
            type = null;
        }

        options = options || {};
        options.disabled = !IsNil(options.disabled) ? options.disabled : false;

        // Retrieve collection
        let services;

        if(!IsNil(type)) {
            services = this.servicesByType[type];
        } else {
            services = this.services;
        }

        if(IsNil(services)) {
            return Promise.resolve([]);
        }

        // Find matching plugins, and check enabled states
        return Promise
            .all(Object.keys(services).map((key) => {
                let service = services[key];

                if(options.disabled === true) {
                    return service;
                }

                // Retrieve service enabled state
                return service.isEnabled().then((enabled) => {
                    if(!enabled) {
                        return null;
                    }

                    return service;
                });
            }))
            .then((services) => {
                return services.filter((service) => {
                    return service !== null;
                });
            });
    }

    registerComponent(component) {
        // Ensure component hasn't already been defined
        if(!IsNil(this.components[component.componentId])) {
            return false;
        }

        // Register component
        this.components[component.componentId] = component;

        Log.trace('Registered component: %o', component.componentId, component);
        return true;
    }

    registerPlugin(plugin) {
        // Ensure plugin is valid
        if(!plugin.valid) {
            return false;
        }

        // Ensure plugin type object has been created
        if(typeof this.pluginsByType[plugin.type] === 'undefined') {
            this.pluginsByType[plugin.type] = {};
        }

        // Ensure plugin hasn't already been registered
        if(typeof this.plugins[plugin.id] !== 'undefined') {
            return false;
        }

        if(typeof this.pluginsByType[plugin.type][plugin.id] !== 'undefined') {
            return false;
        }

        // Register plugin
        this.plugins[plugin.id] = plugin;
        this.pluginsByType[plugin.type][plugin.id] = plugin;

        Log.trace('Registered plugin: %o', plugin.id, plugin);
        return true;
    }

    registerService(service) {
        // Ensure plugin type object has been created
        if(typeof this.servicesByType[service.type] === 'undefined') {
            this.servicesByType[service.type] = {};
        }

        // Ensure service hasn't already been registered
        if(typeof this.services[service.id] !== 'undefined') {
            return false;
        }

        if(typeof this.servicesByType[service.type][service.id] !== 'undefined') {
            return false;
        }

        // Register service
        this.services[service.id] = service;
        this.servicesByType[service.type][service.id] = service;

        Log.trace('Registered service: %o', service.id, service);

        // Service registration tasks
        try {
            if(service.type === 'configuration') {
                this.registerConfigurationService(service);
            }
        } catch(e) {
            Log.error('Unable to register service %o:', service.type, e.stack);
            return false;
        }

        // Ensure plugin has been registered
        this.registerPlugin(service.plugin);
        return true;
    }

    registerConfigurationService(service) {
        if(service.plugin.type !== 'core' && service.options.length > 1) {
            Log.warn(
                '[%s] Plugin configuration services can only contain one page',
                service.plugin.id
            );
            return;
        }

        // Register preference pages
        for(let i = 0; i < service.options.length; ++i) {
            let item = service.options[i];

            if(!(item instanceof Page)) {
                Log.warn(
                    '[%s] Configuration services should only contain pages, found: %o',
                    service.plugin.id, item
                );
                continue;
            }

            // Register page
            Preferences.register(item);
        }
    }
}

// Construct registry
if(typeof window.neon === 'undefined') {
    window.neon = {};
}

if(typeof window.neon.registry === 'undefined') {
    window.neon.registry = new Registry();
}

export default window.neon.registry;
