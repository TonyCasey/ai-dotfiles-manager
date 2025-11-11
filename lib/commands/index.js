/**
 * Commands Module Index
 * Exports all command handlers
 */

const { executeSetup } = require('./setup-command');
const { executeUpdate } = require('./update-command');
const { executeReview } = require('./review-command');
const { executeCommitTodo } = require('./commit-todo-command');

module.exports = {
  executeSetup,
  executeUpdate,
  executeReview,
  executeCommitTodo,
};
