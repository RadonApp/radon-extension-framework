import Identifier from 'eon.extension.framework/models/identifier';
import {dumpModel} from 'eon.extension.framework/models/core/helpers';
import {isDefined, setDefault} from 'eon.extension.framework/core/helpers';

import isEqual from 'lodash-es/isEqual';
import merge from 'lodash-es/merge';


export default class EpisodeIdentifier extends Identifier {
    constructor(keyType, key, show, season, number, title) {
        super(keyType, key);

        this.show = setDefault(show);
        this.season = setDefault(season);

        this.number = setDefault(number);
        this.title = setDefault(title);
    }

    static parse(data) {
        if(!isDefined(data)) {
            return null;
        }

        // Construct episode identifier
        return new EpisodeIdentifier(
            data.keyType,
            data.key,

            data.show,
            data.season,

            data.number,
            data.title
        );
    }

    dump() {
        return merge(super.dump(), {
            '#type': 'video/identifier/episode',

            'number': this.number,
            'title': this.title,

            // Children
            '~show': dumpModel(this.show),
            '~season': dumpModel(this.season)
        });
    }

    matches(other) {
        return (
            super.matches(other) &&
            isEqual(this.number, other.number) &&
            isEqual(this.title, other.title) &&

            // Compare show identifier
            (this.show === other.show || (
                isDefined(this.show) &&
                isDefined(other.show) &&
                this.show.matches(other.show)
            )) &&

            // Compare season identifier
            (this.season === other.season || (
                isDefined(this.season) &&
                isDefined(other.season) &&
                this.season.matches(other.season)
            ))
        );
    }
}
