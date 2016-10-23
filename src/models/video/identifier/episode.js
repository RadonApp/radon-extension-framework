import {isDefined} from 'eon.extension.framework/core/helpers';

import isEqual from 'lodash-es/isEqual';
import merge from 'lodash-es/merge';

import Identifier from 'eon.extension.framework/models/identifier';


export default class EpisodeIdentifier extends Identifier {
    constructor(keyType, key, show, season, number, title) {
        super(keyType, key);

        this.show = show || null;
        this.season = season || null;

        this.number = number || null;
        this.title = title || null;
    }

    dump() {
        return merge(super.dump(), {
            show: isDefined(this.show) ?
                this.show.dump() :
                null,

            season: isDefined(this.season) ?
                this.season.dump() :
                null,

            number: this.number,
            title: this.title
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
