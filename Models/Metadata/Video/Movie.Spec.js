import Movie from './Movie';


describe('Movie', () => {
    describe('inherit', () => {
        let base = Movie.create('alpha', {
            id: '1',
            revision: '#1',

            keys: {
                id: 1
            },

            title: 'Bright',
            year: 2017,

            createdAt: 1000,
            updatedAt: 2000
        });

        describe('keys', () => {
            it('should support alternatives', () => {
                let movie = Movie.create('beta', {
                    keys: {
                        id: 2
                    }
                });

                expect(movie.inherit(base)).toBe(true);

                expect(movie.keys['alpha'].id).toBe(1);
                expect(movie.keys['beta'].id).toBe(2);

                expect(movie.resolve('alpha').keys.id).toBe(1);
                expect(movie.resolve('beta').keys.id).toBe(2);
            });

            it('should throw an error on conflicts', () => {
                let movie = Movie.create('alpha', {
                    keys: {
                        id: 2
                    }
                });

                expect(() =>
                    movie.inherit(base)
                ).toThrow(new Error(
                    'Movie.keys["alpha"].id: 2 doesn\'t match 1'
                ));
            });
        });

        describe('title', () => {
            it('should support alternatives', () => {
                let movie = Movie.create('beta', {
                    title: 'Annihilation'
                });

                expect(movie.inherit(base)).toBe(true);

                expect(movie.title).toBe('Annihilation');

                expect(movie.resolve('alpha').title).toBe('Bright');
                expect(movie.resolve('beta').title).toBe('Annihilation');
            });
        });

        describe('year', () => {
            it('should support alternatives', () => {
                let movie = Movie.create('beta', {
                    year: 2018
                });

                expect(movie.inherit(base)).toBe(true);

                expect(movie.year).toBe(2018);

                expect(movie.resolve('alpha').year).toBe(2017);
                expect(movie.resolve('beta').year).toBe(2018);
            });
        });
    });
});
