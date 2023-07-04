/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.createTable("versions", (table) => {
    table.increments("id");
    table.string("latest_version", 255).notNullable();
    table.string("active_version", 255).notNullable();
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropTable("versions");
};
