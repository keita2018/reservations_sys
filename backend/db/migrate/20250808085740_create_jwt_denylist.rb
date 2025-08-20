class CreateJwtDenylist < ActiveRecord::Migration[8.0]
  def change
    create_table :jwt_denylist do |t|
      t.string :jti, null: false
      t.datetime :exp, null: false
      t.index :jti, unique: true
    end
  end
end
