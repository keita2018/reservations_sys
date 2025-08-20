class EnablePgcryptoAndCreateReservations < ActiveRecord::Migration[8.0]
  def change
    enable_extension 'pgcrypto' unless extension_enabled?('pgcrypto')

    create_table :reservations, id: :uuid do |t|
      t.uuid    :user_id, null: false
      t.datetime :reservation_at, null: false
      t.integer :people_count, null: false
      t.string  :phone_number, null: false, limit: 11
      t.string  :course, limit: 20
      t.boolean :food_option, default: false
      t.boolean :drink_option, default: false
      t.boolean :canceled, default: false
      t.timestamps
    end

    add_foreign_key :reservations, :users, column: :user_id, on_delete: :cascade
    add_index :reservations, :user_id
    add_index :reservations, :reservation_at
    add_index :reservations, :canceled
  end
end
