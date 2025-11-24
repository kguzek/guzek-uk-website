import * as migration_20250402_140541 from './20250402_140541';
import * as migration_20250403_123539 from './20250403_123539';
import * as migration_20250403_145045 from './20250403_145045';
import * as migration_20250403_162531 from './20250403_162531';
import * as migration_20250830_031041 from './20250830_031041';
import * as migration_20251124_180400 from './20251124_180400';

export const migrations = [
  {
    up: migration_20250402_140541.up,
    down: migration_20250402_140541.down,
    name: '20250402_140541',
  },
  {
    up: migration_20250403_123539.up,
    down: migration_20250403_123539.down,
    name: '20250403_123539',
  },
  {
    up: migration_20250403_145045.up,
    down: migration_20250403_145045.down,
    name: '20250403_145045',
  },
  {
    up: migration_20250403_162531.up,
    down: migration_20250403_162531.down,
    name: '20250403_162531',
  },
  {
    up: migration_20250830_031041.up,
    down: migration_20250830_031041.down,
    name: '20250830_031041',
  },
  {
    up: migration_20251124_180400.up,
    down: migration_20251124_180400.down,
    name: '20251124_180400'
  },
];
