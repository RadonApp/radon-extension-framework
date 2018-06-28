import Show from './Show';
import Season from './Season';
import Episode from './Episode';


describe('Episode', () => {
    let show = Show.create('alpha', {
        keys: {
            id: 100,
            slug: 'arrested-development'
        },

        title: 'Arrested Development'
    });

    let season = Season.create('alpha', {
        keys: {
            id: 101
        },

        number: 1,
        title: 'Season 1',

        show
    });

    describe('inherit', () => {
        let base = Episode.create('alpha', {
            id: '3',
            revision: '#1',

            keys: {
                id: 1
            },

            number: 2,
            title: 'Top Banana',

            createdAt: 1000,
            updatedAt: 2000,

            show,
            season
        });

        describe('keys', () => {
            it('should support alternatives', () => {
                let episode = Episode.create('beta', {
                    keys: {
                        id: 2
                    }
                });

                expect(episode.inherit(base)).toBe(true);

                expect(episode.keys['alpha'].id).toBe(1);
                expect(episode.keys['beta'].id).toBe(2);

                expect(episode.resolve('alpha').keys.id).toBe(1);
                expect(episode.resolve('beta').keys.id).toBe(2);
            });

            it('should throw an error on conflicts', () => {
                let episode = Episode.create('alpha', {
                    keys: {
                        id: 2
                    }
                });

                expect(() =>
                    episode.inherit(base)
                ).toThrow(new Error(
                    'Episode.keys["alpha"].id: 2 doesn\'t match 1'
                ));
            });
        });

        describe('title', () => {
            it('should support alternatives', () => {
                let episode = Episode.create('beta', {
                    title: 'Kimmy Gets a Job!'
                });

                expect(episode.inherit(base)).toBe(true);

                expect(episode.title).toBe('Top Banana');

                expect(episode.resolve('alpha').title).toBe('Top Banana');
                expect(episode.resolve('beta').title).toBe('Kimmy Gets a Job!');
            });
        });

        describe('number', () => {
            it('should throw an error on conflicts', () => {
                let episode = Episode.create('beta', {
                    number: 3
                });

                expect(() =>
                    episode.inherit(base)
                ).toThrow(new Error(
                    'Episode.number: 3 doesn\'t match 2'
                ));
            });
        });
    });
});
