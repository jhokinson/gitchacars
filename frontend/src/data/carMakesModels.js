import { getMakes as _getMakes, getModels as _getModels } from 'car-info'

const makesCache = _getMakes().map((name) => ({ value: name, label: name }))

export function getAllMakes() {
  return makesCache
}

export function getModelsByMake(make) {
  if (!make) return []
  return _getModels(make).map((name) => ({ value: name, label: name }))
}
