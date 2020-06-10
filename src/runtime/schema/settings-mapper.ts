/**
 * This module is concerned with mapping Nexus framework schema component settings to Nexus schema standalone component.
 */
import * as NexusSchema from '@nexus/schema'
import * as Plugin from '../../lib/plugin'
import { log as schemaLogger } from './logger'
import { SettingsData } from './settings'

type NexusSchemaConfig = NexusSchema.core.SchemaConfig

const log = schemaLogger.child('settings')

export function mapSettingsAndPluginsToNexusSchemaConfig(
  frameworkPlugins: Plugin.RuntimeContributions[],
  settings: SettingsData
): NexusSchemaConfig {
  const baseConfig: NexusSchemaConfig = {
    nonNullDefaults: {
      input: !(settings?.nullable?.inputs ?? true),
      output: !(settings?.nullable?.outputs ?? true),
    },
    typegenAutoConfig: {
      sources: [],
    },
    types: [],
    plugins: [],
    // Always false here, then set to true in the reflection module
    outputs: false,
    shouldGenerateArtifacts: false,
    shouldExitAfterGenerateArtifacts: false,
  }

  baseConfig.plugins!.push(...mapConnectionsSettingsToNexusSchemaConfig(settings))

  // Merge the plugin nexus plugins
  for (const frameworkPlugin of frameworkPlugins) {
    const schemaPlugins = frameworkPlugin.schema?.plugins ?? []
    baseConfig.plugins!.push(...schemaPlugins)
  }

  log.trace('config built', { config: baseConfig })

  return baseConfig
}

/**
 * Specialized mapping for the complexity of relay connections plugins.
 */
function mapConnectionsSettingsToNexusSchemaConfig(settings: SettingsData): NexusSchema.core.NexusPlugin[] {
  if (settings.connections === undefined) {
    return [
      NexusSchema.connectionPlugin({
        nexusSchemaImportId: 'nexus/components/schema',
      }),
    ]
  }

  const instances: NexusSchema.core.NexusPlugin[] = []

  const { default: defaultTypeConfig, ...customTypesConfig } = settings.connections

  for (const [name, config] of Object.entries(customTypesConfig)) {
    if (config) {
      instances.push(
        NexusSchema.connectionPlugin({
          nexusSchemaImportId: 'nexus/components/schema',
          nexusFieldName: name,
          ...config,
        })
      )
    }
  }

  if (defaultTypeConfig) {
    instances.push(NexusSchema.connectionPlugin(defaultTypeConfig))
  }

  return instances
}
