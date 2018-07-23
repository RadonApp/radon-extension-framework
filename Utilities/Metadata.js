import Find from 'lodash-es/find';
import ForEachRight from 'lodash-es/forEachRight';
import Get from 'lodash-es/get';
import IsNil from 'lodash-es/isNil';
import IsString from 'lodash-es/isString';
import Map from 'lodash-es/map';
import Remove from 'lodash-es/remove';
import Slugify from 'slugify';
import Uniq from 'lodash-es/uniq';
import UniqBy from 'lodash-es/uniqBy';

import {getRegexMatches} from './Regex';


const SlugRemoveRegex = /[\>\<]/g;
const SlugSpaceRegex = /(\s[~+_,\-\\\/!;:@]+\s)|((^|\s)[~+_,\-\\\/!;:@]+)|([~+_,\-\\\/!;:@]+($|\s))|([;:\|]+)/g;

const TitleCreditsRegex = /\s?(?:\((?:with|feat\.?)\s(.*?)\)|\[(?:with|feat\.?)\s(.*?)\])/gi;
const TitleTagsRegex = /\s?(\(.*?\)|\[.*?\])/gi;

export function cleanTitle(value) {
    if(IsNil(value)) {
        return value;
    }

    return value
        .replace(/&/g, 'and')      // Replace ampersand with "and"
        .replace(/[^\w\s]/gi, '')  // Remove special characters
        .replace(/\s+/g, ' ')      // Remove extra spaces
        .toLowerCase()
        .trim();
}

export function createArtistTitle(artists) {
    if(IsNil(artists) || IsString(artists)) {
        return artists || null;
    }

    if(!Array.isArray(artists) || artists.length < 1) {
        return null;
    }

    if(artists.length === 1) {
        return artists[0];
    }

    // Join artists (e.g. 1, 2 & 3)
    return [artists.splice(0, artists.length - 1).join(', '), ...artists].join(' & ');
}

export function createSlug(value) {
    if(IsNil(value)) {
        return null;
    }

    // Remove characters
    value = value.replace(SlugRemoveRegex, '');

    // Replace leading and trailing special characters
    value = value.replace(SlugSpaceRegex, ' ');

    // Create slug
    return Slugify(value, {
        lower: true,
        remove: /[\[\]()'"*.?]/g
    });
}

export function encodeTitle(value) {
    if(IsNil(value)) {
        return value;
    }

    return encodeURIComponent(value).replace(/%20/g, '+');
}

export function resolveArtists(title, artists) {
    // Remove invalid artists
    artists = Remove(artists, (artist) => !IsNil(artist));

    // Remove duplicate artists
    artists = UniqBy(artists, 'id');

    // Ensure multiple artists exist
    if(artists.length <= 1) {
        return artists;
    }

    // Remove similar artists
    Remove(artists, ({ id, title }) => {
        title = cleanTitle(title);

        // Find similar artist
        return !IsNil(Find(artists, (artist) => {
            if(artist.id === id) {
                return false;
            }

            // Retrieve multiple artists from `artist.title`
            let artists = Map(
                artist.title.split(/\s[,&]\s/),
                cleanTitle
            );

            // Check for matching artist
            return artists.indexOf(title) >= 0;
        }));
    });

    // Retrieve title credits
    let credits = cleanTitle(getRegexMatches(TitleCreditsRegex, title).join(' '));

    if(credits.length < 1) {
        return artists;
    }

    // Resolve artists with no credit in `title`
    return Remove(artists, (artist) =>
        credits.indexOf(cleanTitle(artist.title)) < 0
    );
}

export function resolveTitle(title) {
    let titles = [];

    // Add title
    titles.push(cleanTitle(title));

    // Add title without credits
    titles.push(cleanTitle(title = title.replace(TitleCreditsRegex, '')));

    // Add title without tags
    titles.push(cleanTitle(title = title.replace(TitleTagsRegex, '')));

    // Add title fragments (reversed)
    ForEachRight(title.split(' - '), (fragment) => {
        titles.push(cleanTitle(fragment));
    });

    // Remove duplicates
    return Uniq(titles);
}

export function matchTitle(a, b) {
    if(!IsString(a) || !IsString(b)) {
        return false;
    }

    // Resolve titles for `a`
    a = resolveTitle(a);

    // Find matching title
    return !IsNil(Find(resolveTitle(b), (title) =>
        a.indexOf(title) >= 0
    ));
}

export function matchItemByTitle(items, value, name = 'title') {
    return Find(items, (item) =>
        matchTitle(Get(item, name), value)
    );
}
