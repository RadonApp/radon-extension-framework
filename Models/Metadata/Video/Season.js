import Item, {Common, Metadata} from '../Core/Base';
import {MediaTypes} from '../../../Core/Enums';


export class SeasonCommon extends Common {
    static Schema = {
        ...Common.Schema,

        title: new Item.Properties.Text(),
        number: new Item.Properties.Integer(),
        year: new Item.Properties.Integer()
    };
}

export class SeasonMetadata extends Metadata {
    static Apply = {
        ...Metadata.Apply,

        exclude: [
            ...Metadata.Apply.exclude,

            'show'
        ]
    };

    static Schema = {
        ...Metadata.Schema,
        ...SeasonCommon.Schema
    };

    get title() {
        return this.get('title');
    }

    set title(value) {
        this.set('title', value);
    }

    get number() {
        return this.get('number');
    }

    set number(value) {
        this.set('number', value);
    }

    get year() {
        return this.get('year');
    }

    set year(value) {
        this.set('year', value);
    }
}

export default class Season extends Item {
    static Metadata = SeasonMetadata;
    static Type = MediaTypes.Video.Season;

    static Schema = {
        ...Item.Schema,
        ...SeasonCommon.Schema,

        //
        // Children
        //

        show: new Item.Properties.Reference(MediaTypes.Video.Show, {
            identifier: true
        })
    };

    get show() {
        return this.get('show');
    }

    set show(value) {
        this.set('show', value);
    }

    get title() {
        return this.get('title');
    }

    set title(value) {
        this.set('title', value);
    }

    get number() {
        return this.get('number');
    }

    set number(value) {
        this.set('number', value);
    }

    get year() {
        return this.get('year');
    }

    set year(value) {
        this.set('year', value);
    }

    createSelectors(options) {
        return super.createSelectors({
            children: {
                'show': true
            },

            ...(options || {})
        });
    }
}
