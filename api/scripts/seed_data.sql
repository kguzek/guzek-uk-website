INSERT INTO `guzek_uk`.`pages` (
    `title`,
    `url`,
    `local_url`,
    `admin_only`,
    `should_fetch`
  )
VALUES ('Home', '/', TRUE, FALSE, TRUE),
  ('Konrad', '/konrad', TRUE, FALSE, TRUE),
  (
    'Pipe Designer',
    '/pipe-designer',
    FALSE,
    FALSE,
    FALSE
  ),
  (
    'Content Manager',
    '/content-manager',
    TRUE,
    TRUE,
    FALSE
  );