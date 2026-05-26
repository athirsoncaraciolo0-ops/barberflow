INSERT INTO "BusinessSettings" (
  "id",
  "productName",
  "businessName",
  "slogan",
  "whatsapp",
  "initials",
  "themePresetId",
  "primaryColor",
  "backgroundColor",
  "foregroundColor"
) VALUES (
  'business-1',
  'BarberFlow',
  'Barbearia Imperial',
  'Precisão, estilo e tradição.',
  '5581999999999',
  'BF',
  'luxury-gold',
  '#d4af37',
  '#070707',
  '#f8f5ed'
)
ON CONFLICT ("id") DO UPDATE SET
  "productName" = EXCLUDED."productName",
  "businessName" = EXCLUDED."businessName",
  "slogan" = EXCLUDED."slogan",
  "whatsapp" = EXCLUDED."whatsapp",
  "initials" = EXCLUDED."initials",
  "themePresetId" = EXCLUDED."themePresetId",
  "primaryColor" = EXCLUDED."primaryColor",
  "backgroundColor" = EXCLUDED."backgroundColor",
  "foregroundColor" = EXCLUDED."foregroundColor",
  "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "Barber" ("id", "name", "specialty", "phone", "active") VALUES
('barber-1', 'Rafael', 'Especialista em degradê', '', true),
('barber-2', 'Diego', 'Barba e acabamento', '', true),
('barber-3', 'Thiago', 'Cortes premium', '', true)
ON CONFLICT ("id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "specialty" = EXCLUDED."specialty",
  "phone" = EXCLUDED."phone",
  "active" = EXCLUDED."active";

INSERT INTO "Client" ("id", "name", "phone", "notes") VALUES
('client-1', 'Lucas Andrade', '5581991111111', 'Prefere degradê baixo.'),
('client-2', 'Marcos Silva', '5581992222222', NULL),
('client-3', 'Pedro Lima', '5581993333333', NULL),
('client-4', 'André Costa', '5581994444444', NULL)
ON CONFLICT ("id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "phone" = EXCLUDED."phone",
  "notes" = EXCLUDED."notes";

INSERT INTO "Service" ("id", "name", "price", "durationMinutes", "active") VALUES
('service-1', 'Corte degradê', 45, 40, true),
('service-2', 'Corte + barba', 80, 60, true),
('service-3', 'Barba premium', 40, 35, true),
('service-4', 'Combo imperial', 120, 90, true)
ON CONFLICT ("id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "price" = EXCLUDED."price",
  "durationMinutes" = EXCLUDED."durationMinutes",
  "active" = EXCLUDED."active";

INSERT INTO "Appointment" ("id", "clientId", "barberId", "serviceId", "date", "time", "status") VALUES
('appointment-1', 'client-1', 'barber-1', 'service-1', '2026-05-26', '09:00', 'confirmed'),
('appointment-2', 'client-2', 'barber-2', 'service-2', '2026-05-26', '10:30', 'scheduled'),
('appointment-3', 'client-3', 'barber-1', 'service-3', '2026-05-26', '13:00', 'scheduled'),
('appointment-4', 'client-4', 'barber-3', 'service-4', '2026-05-26', '15:30', 'confirmed')
ON CONFLICT ("id") DO UPDATE SET
  "clientId" = EXCLUDED."clientId",
  "barberId" = EXCLUDED."barberId",
  "serviceId" = EXCLUDED."serviceId",
  "date" = EXCLUDED."date",
  "time" = EXCLUDED."time",
  "status" = EXCLUDED."status";
