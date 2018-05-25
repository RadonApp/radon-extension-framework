import ForEach from 'lodash-es/forEach';
import I18n from 'i18next';
import IsNil from 'lodash-es/isNil';
import Merge from 'lodash-es/merge';
import XHR from 'i18next-xhr-backend';


export const Defaults = {
    debug: process.env['NODE_ENV'] === 'development',
    fallbackLng: 'en',

    defaultNS: 'neon-extension/common',

    backend: {
        allowMultiLoading: false,
        loadPath: '/Locales/{{lng}}/{{ns}}.json'
    },

    interpolation: {
        escapeValue: false
    }
};

export default class I18nManager {
    constructor(options = null, callback = null) {
        this.formatters = {};

        // Parse options
        this.options = Merge({
            plugins: []
        }, Defaults, {
            interpolation: {
                format: this.format.bind(this)
            }
        }, options || {});

        // Create default formatters
        this.createFormatters();

        // Create instance
        this.instance = I18n.use(XHR);

        ForEach(this.options.plugins, (plugin) =>
            this.instance.use(plugin)
        );

        // Initialize instance
        this.instance.init(this.options, callback);
        this.instance.on('languageChanged', this.onLanguageChanged.bind(this));
    }

    onLanguageChanged(lng) {
        // Create formatters for `lng`
        this.createFormatters(lng);
    }

    createFormatters(lng = 'en') {
        if(IsNil(window.Intl)) {
            this.formatters = {};
            return;
        }

        // Create formatters for `lng`
        this.formatters = {
            decimal: window.Intl.NumberFormat(lng, {})
        };
    }

    format(value, format) {
        if(!IsNil(this.formatters[format])) {
            return this.formatters[format].format(value);
        }

        return value;
    }

    getInstance() {
        return this.instance;
    }

    static createInstance(options, callback) {
        return new I18nManager(options, callback).getInstance();
    }
}
