import * as migration_20250402_140541 from './20250402_140541';
import * as migration_20250403_123539 from './20250403_123539';

export const migrations = [
  {
    up: migration_20250402_140541.up,
    down: migration_20250402_140541.down,
    name: '20250402_140541',
  },
  {
    up: migration_20250403_123539.up,
    down: migration_20250403_123539.down,
    name: '20250403_123539'
  },
];
