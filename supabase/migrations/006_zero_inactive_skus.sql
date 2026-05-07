-- 006_zero_inactive_skus.sql
-- Zero price + stock on every SKU that does NOT belong to one of the 40 price-list
-- products. Intent: only the actively-priced catalog should be buyable on the storefront.
--
-- Scope check (run before COMMIT):
--   expected ~172 rows updated; 13,491 other SKUs are already at price=0 AND stock=0 and are
--   filtered out by the WHERE clause (no-op optimization).
--
-- Referenced SKUs on non-price-list products (order_items / discovery_set_config_items)
-- are intentionally NOT protected, per decision. order_items are unaffected (unit_price_bani
-- is snapshotted); discovery sets using these components will compute reduced totals
-- until their configs are reviewed.

BEGIN;

UPDATE skus
   SET price = 0,
       stock = 0,
       updated_at = now()
 WHERE product_id NOT IN (
   -- 40 price-list product ids (36 existing + 4 new stubs from migration 005)
   '97f72be0-c462-4d2d-814e-401880d485e8',  -- MFK Aqua Celestia
   'cdab9337-1dbf-4523-b974-4b459bab88d0',  -- MFK Aqua Media
   'e2725eb9-9b2d-42f7-bef0-73cd3f82f014',  -- MFK Gentle Fluidity Gold
   '2841763f-facf-4722-b927-8a71efea19e7',  -- MFK À la Rose
   'af79314b-d4eb-4515-a35a-7850d9f4fbb8',  -- MFK Aqua Universalis
   'b01ad9b7-4c82-4908-823b-c89e7001ba1e',  -- MFK Gentle Fluidity Silver
   'ef0637b7-c39c-424d-b4df-de72a8628566',  -- MFK Baccarat Rouge 540 Extrait
   '2c2ffb99-f64f-4a6e-9162-3bfb580ced52',  -- MFK Baccarat Rouge 540
   'c49427c6-2838-4c32-a3b0-04d319300480',  -- SHL Mortal Skin
   '00d14a47-be17-4c9f-b823-f90bd3d8e24a',  -- SHL Sand Dance (new)
   '7b044e4c-b361-497b-9013-cf4168c4d3ab',  -- Matiere Premiere Neroli Oranger
   '4db54167-5f50-4c31-8cba-3c5775da8a50',  -- Matiere Premiere Vanilla Power (new)
   '824ad005-1c59-41bf-a7f6-22f2ea109aa9',  -- Penhaligon's Elizabethan Rose
   '252dd255-c8f0-4375-8910-9755a42919e1',  -- Penhaligon's Cairo
   '5c9c3bf6-dd5e-473d-8ad9-1554e44b03d7',  -- Penhaligon's Babylon
   '67b3a02d-ad00-419c-8744-cbeaa253fe53',  -- Tom Ford Vanille Fatale
   'd5aa28a6-2fcf-4ff8-99c8-06c767053af2',  -- Tom Ford Vanilla Sex
   '4fcae97a-af59-4b23-bb97-338cc4e22e07',  -- Tom Ford Cherry Smoke
   'a278cc1a-1df4-4e19-ad40-01a6933ff47d',  -- Tom Ford Bitter Peach
   '9f32c460-d7c0-4d53-a739-6cdce4331591',  -- Tom Ford Neroli Portofino
   '3f041763-0a2c-48ba-97dc-2eb4f3d27f0f',  -- Ex Nihilo Blue Talisman
   'e05d2d00-81ba-45ec-bbfe-f5bc0e71a237',  -- Ex Nihilo Blue Talisman Extrait (new)
   '14302417-3c87-4d77-be52-d5eda7f5529a',  -- Ex Nihilo The Hedonist Extrait
   '7cd1defe-29d0-479b-810e-3377bdecfd37',  -- Ex Nihilo The Hedonist
   '6473e7a3-41c2-408c-ae59-7019926641c4',  -- Ex Nihilo Fleur Narcotique
   '53605d60-1c92-47d2-a65e-cdc963e41dcb',  -- Ex Nihilo Generation(s)
   'e0bb260e-b7ad-4aeb-9f91-6aa63ed24b3f',  -- Hormone Paris This is not GABA
   '40d8484f-fbc8-4f8b-a1c5-51b51fd9680e',  -- PdM Valaya
   '5e93efe0-a310-483d-aeeb-c1c61799880a',  -- PdM Valaya Exclusif (new)
   '3e1ed8a0-010a-4d6c-801a-27f680933309',  -- PdM Delina
   '64cf3bfe-8040-4082-8810-7808df41849e',  -- PdM Delina Exclusif
   'c6f9e7df-2146-43a4-a1b8-08aae6dda283',  -- PdM Oriana
   'f6f7b89a-3777-4081-8f67-580679a5e258',  -- PdM Delina La Rosée
   'f5762c36-28a9-4537-acdf-ee80a19bcf14',  -- Kilian Angels' Share
   'f499e330-4a8b-4b67-8c9f-4aa66f3158b6',  -- Le Labo AnOther 13
   '52fd46a4-df43-4401-aa97-0ae9d4ceb7df',  -- Le Labo Santal 33
   '15a24c7e-777f-4cbd-9e5a-256e1340d1bf',  -- Le Labo Labdanum 18
   '3e54e4c8-68b8-4b60-92d2-59c04a17760c',  -- Creed Aventus Man
   '816a40b9-6379-41e8-9a85-714775130a38',  -- Creed Aventus For Her
   '11725f7f-6664-4f59-8cfb-f1b8b02b4abd'   -- AUM Power is Power Extrait
 )
   AND (price > 0 OR stock > 0);

-- Verification. Expected after run:
--   row 1: non_pl_nonzero = 0
--   row 2: pl_skus_untouched shows all 225 price-list SKUs still have price > 0 and stock = 100
SELECT COUNT(*) AS non_pl_nonzero
  FROM skus
 WHERE product_id NOT IN (
   '97f72be0-c462-4d2d-814e-401880d485e8','cdab9337-1dbf-4523-b974-4b459bab88d0','e2725eb9-9b2d-42f7-bef0-73cd3f82f014',
   '2841763f-facf-4722-b927-8a71efea19e7','af79314b-d4eb-4515-a35a-7850d9f4fbb8','b01ad9b7-4c82-4908-823b-c89e7001ba1e',
   'ef0637b7-c39c-424d-b4df-de72a8628566','2c2ffb99-f64f-4a6e-9162-3bfb580ced52','c49427c6-2838-4c32-a3b0-04d319300480',
   '00d14a47-be17-4c9f-b823-f90bd3d8e24a','7b044e4c-b361-497b-9013-cf4168c4d3ab','4db54167-5f50-4c31-8cba-3c5775da8a50',
   '824ad005-1c59-41bf-a7f6-22f2ea109aa9','252dd255-c8f0-4375-8910-9755a42919e1','5c9c3bf6-dd5e-473d-8ad9-1554e44b03d7',
   '67b3a02d-ad00-419c-8744-cbeaa253fe53','d5aa28a6-2fcf-4ff8-99c8-06c767053af2','4fcae97a-af59-4b23-bb97-338cc4e22e07',
   'a278cc1a-1df4-4e19-ad40-01a6933ff47d','9f32c460-d7c0-4d53-a739-6cdce4331591','3f041763-0a2c-48ba-97dc-2eb4f3d27f0f',
   'e05d2d00-81ba-45ec-bbfe-f5bc0e71a237','14302417-3c87-4d77-be52-d5eda7f5529a','7cd1defe-29d0-479b-810e-3377bdecfd37',
   '6473e7a3-41c2-408c-ae59-7019926641c4','53605d60-1c92-47d2-a65e-cdc963e41dcb','e0bb260e-b7ad-4aeb-9f91-6aa63ed24b3f',
   '40d8484f-fbc8-4f8b-a1c5-51b51fd9680e','5e93efe0-a310-483d-aeeb-c1c61799880a','3e1ed8a0-010a-4d6c-801a-27f680933309',
   '64cf3bfe-8040-4082-8810-7808df41849e','c6f9e7df-2146-43a4-a1b8-08aae6dda283','f6f7b89a-3777-4081-8f67-580679a5e258',
   'f5762c36-28a9-4537-acdf-ee80a19bcf14','f499e330-4a8b-4b67-8c9f-4aa66f3158b6','52fd46a4-df43-4401-aa97-0ae9d4ceb7df',
   '15a24c7e-777f-4cbd-9e5a-256e1340d1bf','3e54e4c8-68b8-4b60-92d2-59c04a17760c','816a40b9-6379-41e8-9a85-714775130a38',
   '11725f7f-6664-4f59-8cfb-f1b8b02b4abd'
 )
   AND (price > 0 OR stock > 0);

SELECT COUNT(*) AS pl_skus_untouched
  FROM skus
 WHERE product_id IN (
   '97f72be0-c462-4d2d-814e-401880d485e8','cdab9337-1dbf-4523-b974-4b459bab88d0','e2725eb9-9b2d-42f7-bef0-73cd3f82f014',
   '2841763f-facf-4722-b927-8a71efea19e7','af79314b-d4eb-4515-a35a-7850d9f4fbb8','b01ad9b7-4c82-4908-823b-c89e7001ba1e',
   'ef0637b7-c39c-424d-b4df-de72a8628566','2c2ffb99-f64f-4a6e-9162-3bfb580ced52','c49427c6-2838-4c32-a3b0-04d319300480',
   '00d14a47-be17-4c9f-b823-f90bd3d8e24a','7b044e4c-b361-497b-9013-cf4168c4d3ab','4db54167-5f50-4c31-8cba-3c5775da8a50',
   '824ad005-1c59-41bf-a7f6-22f2ea109aa9','252dd255-c8f0-4375-8910-9755a42919e1','5c9c3bf6-dd5e-473d-8ad9-1554e44b03d7',
   '67b3a02d-ad00-419c-8744-cbeaa253fe53','d5aa28a6-2fcf-4ff8-99c8-06c767053af2','4fcae97a-af59-4b23-bb97-338cc4e22e07',
   'a278cc1a-1df4-4e19-ad40-01a6933ff47d','9f32c460-d7c0-4d53-a739-6cdce4331591','3f041763-0a2c-48ba-97dc-2eb4f3d27f0f',
   'e05d2d00-81ba-45ec-bbfe-f5bc0e71a237','14302417-3c87-4d77-be52-d5eda7f5529a','7cd1defe-29d0-479b-810e-3377bdecfd37',
   '6473e7a3-41c2-408c-ae59-7019926641c4','53605d60-1c92-47d2-a65e-cdc963e41dcb','e0bb260e-b7ad-4aeb-9f91-6aa63ed24b3f',
   '40d8484f-fbc8-4f8b-a1c5-51b51fd9680e','5e93efe0-a310-483d-aeeb-c1c61799880a','3e1ed8a0-010a-4d6c-801a-27f680933309',
   '64cf3bfe-8040-4082-8810-7808df41849e','c6f9e7df-2146-43a4-a1b8-08aae6dda283','f6f7b89a-3777-4081-8f67-580679a5e258',
   'f5762c36-28a9-4537-acdf-ee80a19bcf14','f499e330-4a8b-4b67-8c9f-4aa66f3158b6','52fd46a4-df43-4401-aa97-0ae9d4ceb7df',
   '15a24c7e-777f-4cbd-9e5a-256e1340d1bf','3e54e4c8-68b8-4b60-92d2-59c04a17760c','816a40b9-6379-41e8-9a85-714775130a38',
   '11725f7f-6664-4f59-8cfb-f1b8b02b4abd'
 )
   AND price > 0
   AND stock = 100;

COMMIT;
-- If non_pl_nonzero != 0 or pl_skus_untouched != 225, replace COMMIT with ROLLBACK.
