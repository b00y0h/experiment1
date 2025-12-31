import type { ServerComponentProps } from 'payload'

import { calculateExperimentStats } from '../utils/experimentStats.js'
import styles from './ExperimentStats.module.css'

/**
 * Server component that displays experiment statistics in the admin dashboard.
 * Shows per-variant metrics (impressions, conversions, conversion rates) for
 * all running or paused experiments.
 */
export const ExperimentStats = async (props: ServerComponentProps) => {
  const { payload } = props

  const stats = await calculateExperimentStats(payload)

  if (stats.length === 0) {
    return (
      <div className={styles.wrapper}>
        <h2 className={styles.title}>Experiment Statistics</h2>
        <p className={styles.emptyMessage}>No active experiments. Create an experiment and set its status to "Running" to see statistics here.</p>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Experiment Statistics</h2>
      <div className={styles.experimentGrid}>
        {stats.map((experiment) => (
          <div className={styles.experimentCard} key={experiment.experimentId}>
            <div className={styles.experimentHeader}>
              <h3 className={styles.experimentName}>{experiment.experimentName}</h3>
              <span
                className={`${styles.statusBadge} ${
                  experiment.status === 'running' ? styles.statusRunning : styles.statusPaused
                }`}
              >
                {experiment.status}
              </span>
            </div>
            <table className={styles.metricsTable}>
              <thead>
                <tr>
                  <th>Variant</th>
                  <th>Impressions</th>
                  <th>Conversions</th>
                  <th>Rate</th>
                </tr>
              </thead>
              <tbody>
                {experiment.variants.map((variant) => (
                  <tr
                    className={
                      variant.variantId === experiment.winningVariantId ? styles.winningRow : ''
                    }
                    key={variant.variantId}
                  >
                    <td>
                      {variant.variantName || `Variant ${variant.variantId}`}
                      {variant.variantId === experiment.winningVariantId && (
                        <span className={styles.winningIndicator}> (leading)</span>
                      )}
                    </td>
                    <td>{variant.impressions}</td>
                    <td>{variant.conversions}</td>
                    <td>{variant.conversionRate.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  )
}
