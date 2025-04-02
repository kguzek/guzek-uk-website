import * as migration_20250402_140541 from './20250402_140541';

export const migrations = [
  {
    up: migration_20250402_140541.up,
    down: migration_20250402_140541.down,
    name: '20250402_140541'
  },
];
