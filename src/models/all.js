// Music
import ArtistIdentifier from './music/identifier/artist';
import ArtistMetadata from './music/metadata/artist';

import AlbumIdentifier from './music/identifier/album';
import AlbumMetadata from './music/metadata/album';

import TrackIdentifier from './music/identifier/track';
import TrackMetadata from './music/metadata/track';

// Video
import MovieIdentifier from './video/identifier/movie';
import MovieMetadata from './video/metadata/movie';

import ShowIdentifier from './video/identifier/show';
import ShowMetadata from './video/metadata/show';

import SeasonIdentifier from './video/identifier/season';
import SeasonMetadata from './video/metadata/season';

import EpisodeIdentifier from './video/identifier/episode';
import EpisodeMetadata from './video/metadata/episode';

// Core
import Identifier from './identifier';
import Session from './session';


// Build type map
export const ModelTypes = {
    // Music
    'music/identifier/artist': ArtistIdentifier,
    'music/metadata/artist': ArtistMetadata,

    'music/identifier/album': AlbumIdentifier,
    'music/metadata/album': AlbumMetadata,

    'music/identifier/track': TrackIdentifier,
    'music/metadata/track': TrackMetadata,

    // Video
    'video/identifier/movie': MovieIdentifier,
    'video/metadata/movie': MovieMetadata,

    'video/identifier/show': ShowIdentifier,
    'video/metadata/show': ShowMetadata,

    'video/identifier/season': SeasonIdentifier,
    'video/metadata/season': SeasonMetadata,

    'video/identifier/episode': EpisodeIdentifier,
    'video/metadata/episode': EpisodeMetadata,

    // Core
    'identifier': Identifier,
    'session': Session
};
