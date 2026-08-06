import { researchApi } from '@shared/services/api'
import cacheService from './cacheService'
import { withRetry } from './retryService'

async function overview(options = {}) {
  return cacheService.remember('research:overview', async () => {
    const response = await withRetry(() => researchApi.overview(), { retries: 1 })
    return response.data
  }, { ttl: 30000, force: options.force })
}

async function project(id, options = {}) {
  return cacheService.remember(`research:project:${id}`, async () => {
    const response = await withRetry(() => researchApi.project(id), { retries: 1 })
    return response.data
  }, { ttl: 30000, force: options.force })
}

function invalidate(prefix = 'research:') {
  cacheService.invalidate(prefix)
}

export default { overview, project, invalidate, api: researchApi }
