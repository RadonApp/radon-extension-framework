import Show from './Show';
import Season from './Season';


describe('Season', () => {
    let show = Show.create('alpha', {
        keys: {
            id: 100,
            slug: 'arrested-development'
        },

        title: 'Arrested Development'
    });

    describe('inherit', () => {
        let base = Season.create('alpha', {
            id: '3',
            revision: '#1',

            keys: {
                id: 1
            },

            number: 1,
            title: 'Season 1',
            year: 2003,

            createdAt: 1000,
            updatedAt: 2000,

            show
        });

        describe('keys', () => {
            it('should support alternatives', () => {
                let season = Season.create('beta', {
                    keys: {
                        id: 2
                    }
                });

                expect(season.inherit(base)).toBe(true);

                expect(season.keys['alpha'].id).toBe(1);
                expect(season.keys['beta'].id).toBe(2);

                expect(season.resolve('alpha').keys.id).toBe(1);
                expect(season.resolve('beta').keys.id).toBe(2);
            });

            it('should throw an error on conflicts', () => {
                let season = Season.create('alpha', {
                    keys: {
                        id: 2
                    }
                });

                expect(() =>
                    season.inherit(base)
                ).toThrow(new Error(
                    'Season.keys["alpha"].id: 2 doesn\'t match 1'
                ));
            });
        });

        describe('title', () => {
            it('should support alternatives', () => {
                let season = Season.create('beta', {
                    title: 'Season 2'
                });

                expect(season.inherit(base)).toBe(true);

                expect(season.title).toBe('Season 1');

                expect(season.resolve('alpha').title).toBe('Season 1');
                expect(season.resolve('beta').title).toBe('Season 2');
            });
        });

        describe('number', () => {
            it('should throw an error on conflicts', () => {
                let season = Season.create('beta', {
                    number: 2
                });

                expect(() =>
                    season.inherit(base)
                ).toThrow(new Error(
                    'Season.number: 2 doesn\'t match 1'
                ));
            });
        });

        describe('year', () => {
            it('should support alternatives', () => {
                let season = Season.create('beta', {
                    year: 2004
                });

                expect(season.inherit(base)).toBe(true);

                expect(season.year).toBe(2003);

                expect(season.resolve('alpha').year).toBe(2003);
                expect(season.resolve('beta').year).toBe(2004);
            });
        });
    });
});
