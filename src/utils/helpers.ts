export function isTestEnvironment() {
  return typeof ENVIRONMENT === 'string' && ENVIRONMENT === 'test'
}
