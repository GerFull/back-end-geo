exports.up = function (knex) {
  return knex.schema.table("users", table => {
    table.text("info");   // JSON string
    table.text("likes");  // JSON string
  });
};

exports.down = function (knex) {
  return knex.schema.table("users", table => {
    table.dropColumn("info");
    table.dropColumn("likes");
  });
};
