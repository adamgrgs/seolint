const cheerio = require('cheerio');
const expect = require('chai').expect;
const { getH1s, getTitle, getDescription, getImages, getHrefs, getCanonicals } = require('.');

describe('rule helpers', () => {
    describe('getH1s', () => {
        it('multiple h1s', () => {
            const $ = cheerio.load('<html><body><h1>Foo</h1><h1>Bar</h1></body></html>');
            expect(getH1s($)).to.eql(['Foo', 'Bar']);
        });
        it('no h1s', () => {
            const $ = cheerio.load('<html><body></body></html>');
            expect(getH1s($)).to.eql([]);
        });
        it('single h1', () => {
            const $ = cheerio.load('<html><body><h1>Baz</h1></body></html>');
            expect(getH1s($)).to.eql(['Baz']);
        });
        it('empty h1', () => {
            const $ = cheerio.load('<html><body><h1></h1></body></html>');
            expect(getH1s($)).to.eql(['']);
        });
    });

    describe('getTitle', () => {
        it('has title', () => {
            const $ = cheerio.load('<html><head><title>Title!</title></head><body></body></html>');
            expect(getTitle($)).to.equal('Title!');
        });
        it('does not have title', () => {
            const $ = cheerio.load('<html><head></head><body></body></html>');
            expect(getTitle($)).to.equal(null);
        });
        it('has empty title', () => {
            const $ = cheerio.load('<html><head><title></title></head><body></body></html>');
            expect(getTitle($)).to.equal('');
        });
        it('has an svg title in the body', () => {
            const $ = cheerio.load(
                '<html><head><title>Page title</title></head><body><svg xmlns="http://www.w3.org/2000/svg"><title>This is an svg title</title></svg></body></html>'
            );
            expect(getTitle($)).to.equal('Page title');
        });
        it('has space around title', () => {
            const $ = cheerio.load(
                '<html><head><title>      Page title      </title></head><body><svg xmlns="http://www.w3.org/2000/svg"><title>This is an svg title</title></svg></body></html>'
            );
            expect(getTitle($)).to.equal('Page title');
        });
    });

    describe('getDescription', () => {
        it('has description', () => {
            const $ = cheerio.load(
                '<html><head><meta name="description" content="This is the meta description" /></head><body></body></html>'
            );
            expect(getDescription($)).to.equal('This is the meta description');
        });

        it('does not have description', () => {
            const $ = cheerio.load('<html><head></head><body></body></html>');
            expect(getDescription($)).to.equal(null);
        });

        it('has an emptye description', () => {
            const $ = cheerio.load('<html><head><meta name="description" content="" /></head><body></body></html>');
            expect(getDescription($)).to.equal('');
        });
    });

    describe('getImages', () => {
        it('has multiple images', () => {
            const $ = cheerio.load(
                '<html><head></head><body><img src="foo.png" alt="foo"><img src="bar.png" alt="bar"></body></html>'
            );
            expect(getImages($)).to.eql([{ src: 'foo.png', alt: 'foo' }, { src: 'bar.png', alt: 'bar' }]);
        });
        it('has no images', () => {
            const $ = cheerio.load('<html><head></head><body></body></html>');
            expect(getImages($)).to.eql([]);
        });
        it('has image with no attributes', () => {
            const $ = cheerio.load('<html><head></head><body><img></body></html>');
            expect(getImages($)).to.eql([{ src: undefined, alt: undefined }]);
        });
        it('has image with empty attributes', () => {
            const $ = cheerio.load('<html><head></head><body><img src="" alt=""></body></html>');
            expect(getImages($)).to.eql([{ src: '', alt: '' }]);
        });
    });

    describe('getHrefs', () => {
        it('has an anchor with no href', () => {
            const $ = cheerio.load('<html><head></head><body><a>test</a></body></html>');
            expect(getHrefs($)).to.eql([]);
        });
        it('has an anchor with javascript href', () => {
            const $ = cheerio.load('<html><head></head><body><a href="javascript:alert(1)">Alert 1</a></body></html>');
            expect(getHrefs($)).to.eql([]);
        });
        it('has no anchors', () => {
            const $ = cheerio.load('<html><head></head><body></body></html>');
            expect(getHrefs($)).to.eql([]);
        });
        it('has multiple anchors', () => {
            const $ = cheerio.load(
                '<html><head></head><body><a href="https://www.zillow.com/">zillow</a><a href="http://www.example.com/">Example</a></body></html>'
            );
            expect(getHrefs($)).to.eql(['https://www.zillow.com/', 'http://www.example.com/']);
        });
        it('has a relative urls', () => {
            const $ = cheerio.load('<html><head></head><body><a href="/foo">/foo</a></body></html>');
            expect(getHrefs($)).to.eql(['/foo']);
        });
        it('has a relative url without a leading slash', () => {
            const $ = cheerio.load('<html><head></head><body><a href="bar.html">bar.html</a></body></html>');
            expect(getHrefs($)).to.eql(['bar.html']);
        });
        it('has an id anchor', () => {
            const $ = cheerio.load('<html><head></head><body><a href="#anchor">#anchor</a></body></html>');
            expect(getHrefs($)).to.eql(['#anchor']);
        });
        it('has an empty href', () => {
            const $ = cheerio.load('<html><head></head><body><a href="">#anchor</a></body></html>');
            expect(getHrefs($)).to.eql(['']);
        });
    });

    describe('getCanonicals', () => {
        it('has no canonical', () => {
            const $ = cheerio.load('<html><head></head><body></body></html>');
            expect(getCanonicals($)).to.eql([]);
        });
        it('has canonical with no href', () => {
            const $ = cheerio.load('<html><head><link rel="canonical" /></head><body></body></html>');
            expect(getCanonicals($)).to.eql([null]);
        });
        it('has canonical with empty href', () => {
            const $ = cheerio.load('<html><head><link rel="canonical" href="" /></head><body></body></html>');
            expect(getCanonicals($)).to.eql(['']);
        });
        it('has multiple canonicals', () => {
            const $ = cheerio.load(
                '<html><head><link rel="canonical" href="foo" /></head><body><link rel="canonical" href="bar" /></body></html>'
            );
            expect(getCanonicals($)).to.eql(['foo', 'bar']);
        });
        it('limits canonicals to selector', () => {
            const $ = cheerio.load(
                '<html><head><link rel="canonical" href="foo" /></head><body><link rel="canonical" href="bar" /></body></html>'
            );
            expect(getCanonicals($, 'head')).to.eql(['foo']);
        });
    });
});
