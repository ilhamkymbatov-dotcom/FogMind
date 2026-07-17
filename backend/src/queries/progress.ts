/**
 * Data access for the progress table.
 *
 * Will hold: loading a user's progress across a document to decide which nodes
 * are still fogged, upserting the row for a node on the unique (user_id,
 * node_id) pair, recording an attempt and its outcome, advancing state from
 * fogged to revealed to mastered, and aggregating counts for the progress
 * summary.
 */

export {}
