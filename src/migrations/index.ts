import * as migration_20250402_131102 from './20250402_131102';

export const migrations = [
  {
    up: migration_20250402_131102.up,
    down: migration_20250402_131102.down,
    name: '20250402_131102'
  },
];
