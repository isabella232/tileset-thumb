const tape = require('tape');
const pixelmatch = require('pixelmatch');
const createThumb = require('../index.js').createThumb;
const PNG = require('pngjs').PNG;
const fs = require('fs');

tape('paint', (assert) => {
  const paint = require('../index.js').paint;
  let buffer;

  // initialize a 4x4 RGBA buffer
  buffer = (new Uint8Array(4 * 4 * 4)).fill(0);

  assert.throws(() => {
    paint(buffer, 4, 4, 0, 64);
  }, /x coordinate is beyond width of image/, 'throws with invalid x coordinate')

  assert.throws(() => {
    paint(buffer, 4, 0, 400, 64);
  }, /y coordinate is beyond height of image/, 'throws with invalid y coordinate')

  buffer = (new Uint8Array(4 * 4 * 4)).fill(0);
  paint(buffer, 4, 0, 0, 64);
  assert.deepEqual(buffer[0], 64, '0,0 R = 64');
  assert.deepEqual(buffer[1], 64, '0,0 G = 64');
  assert.deepEqual(buffer[2], 64, '0,0 B = 64');
  assert.deepEqual(buffer[3], 255, '0,0 A = 255');

  buffer = (new Uint8Array(4 * 4 * 4)).fill(0);
  paint(buffer, 4, 3, 0, 64);
  assert.deepEqual(buffer[12], 64, '3,0 R = 64');
  assert.deepEqual(buffer[13], 64, '3,0 G = 64');
  assert.deepEqual(buffer[14], 64, '3,0 B = 64');
  assert.deepEqual(buffer[15], 255, '3,0 A = 255');

  assert.end();
});

tape('paintTile', (assert) => {
  const paintTile = require('../index.js').paintTile;
  let buffer;

  // paints all pixels at z0
  buffer = (new Uint8Array(4 * 4 * 4)).fill(0);
  paintTile(buffer, 4, 0, 0, 0, 64);
  assert.deepEqual(buffer[0], 64, '0,0 R = 64');
  assert.deepEqual(buffer[1], 64, '0,0 G = 64');
  assert.deepEqual(buffer[2], 64, '0,0 B = 64');
  assert.deepEqual(buffer[3], 255, '0,0 A = 255');
  assert.deepEqual(buffer[60], 64, '15,15 R = 64');
  assert.deepEqual(buffer[61], 64, '15,15 G = 64');
  assert.deepEqual(buffer[62], 64, '15,15 B = 64');
  assert.deepEqual(buffer[63], 255, '15,15 A = 255');

  // paints top quadrant pixels at z1
  buffer = (new Uint8Array(4 * 4 * 4)).fill(0);
  paintTile(buffer, 4, 1, 0, 0, 64);
  assert.deepEqual(buffer[0], 64, '0,0 R = 64');
  assert.deepEqual(buffer[1], 64, '0,0 G = 64');
  assert.deepEqual(buffer[2], 64, '0,0 B = 64');
  assert.deepEqual(buffer[3], 255, '0,0 A = 255');
  assert.deepEqual(buffer[60], 0, '15,15 R = 0');
  assert.deepEqual(buffer[61], 0, '15,15 G = 0');
  assert.deepEqual(buffer[62], 0, '15,15 B = 0');
  assert.deepEqual(buffer[63], 0, '15,15 A = 0');

  // paints one pixel at z1
  buffer = (new Uint8Array(4 * 4 * 4)).fill(0);
  paintTile(buffer, 4, 2, 0, 0, 64);
  assert.deepEqual(buffer[0], 64, '0,0 R = 64');
  assert.deepEqual(buffer[1], 64, '0,0 G = 64');
  assert.deepEqual(buffer[2], 64, '0,0 B = 64');
  assert.deepEqual(buffer[3], 255, '0,0 A = 255');
  assert.deepEqual(buffer[4], 0, '1,0 R = 0');
  assert.deepEqual(buffer[5], 0, '1,0 G = 0');
  assert.deepEqual(buffer[6], 0, '1,0 B = 0');
  assert.deepEqual(buffer[7], 0, '1,0 A = 0');

  assert.end();
});

tape('createThumb, zxy:true', (assert) => {
  fs.createReadStream(`${__dirname}/fixtures/tiles.zxy`)
    .pipe(createThumb({ zxy: true }))
    .on('data', (buffer) => {
      if (process.env.UPDATE) {
        fs.writeFileSync(`${__dirname}/fixtures/tiles.256.png`, buffer);
      }

      const expected = PNG.sync.read(fs.readFileSync(`${__dirname}/fixtures/tiles.256.png`));
      const actual = PNG.sync.read(buffer);
      assert.deepEqual(pixelmatch(expected, actual, null, 256, 256), 0, 'matches expected fixture');
      assert.end();
    });
});

tape('createThumb, zxy:true, size:128', (assert) => {
  fs.createReadStream(`${__dirname}/fixtures/tiles.zxy`)
    .pipe(createThumb({ zxy: true, size: 128 }))
    .on('data', (buffer) => {
      if (process.env.UPDATE) {
        fs.writeFileSync(`${__dirname}/fixtures/tiles.128.png`, buffer);
      }

      const expected = PNG.sync.read(fs.readFileSync(`${__dirname}/fixtures/tiles.128.png`));
      const actual = PNG.sync.read(buffer);
      assert.deepEqual(pixelmatch(expected, actual, null, 128, 128), 0, 'matches expected fixture');
      assert.end();
    });
});

tape('createThumb, zxy:true, size:512', (assert) => {
  fs.createReadStream(`${__dirname}/fixtures/tiles.zxy`)
    .pipe(createThumb({ zxy: true, size: 512 }))
    .on('data', (buffer) => {
      if (process.env.UPDATE) {
        fs.writeFileSync(`${__dirname}/fixtures/tiles.512.png`, buffer);
      }

      const expected = PNG.sync.read(fs.readFileSync(`${__dirname}/fixtures/tiles.512.png`));
      const actual = PNG.sync.read(buffer);
      assert.deepEqual(pixelmatch(expected, actual, null, 512, 512), 0, 'matches expected fixture');
      assert.end();
    });
});

