-- Add must-have / nice-to-have feature priority columns
ALTER TABLE want_listings ADD COLUMN IF NOT EXISTS features_must_have TEXT[] DEFAULT '{}';
ALTER TABLE want_listings ADD COLUMN IF NOT EXISTS features_nice_to_have TEXT[] DEFAULT '{}';

-- Migrate existing features to nice-to-have
UPDATE want_listings SET features_nice_to_have = features
WHERE features IS NOT NULL AND array_length(features, 1) > 0
  AND (features_nice_to_have IS NULL OR array_length(features_nice_to_have, 1) IS NULL);
