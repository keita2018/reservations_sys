
class RecreateUsersWithUuid < ActiveRecord::Migration[8.0]
  def up
    enable_extension 'pgcrypto' unless extension_enabled?('pgcrypto')

    # 既存usersを消して作り直す（開発DB想定）
    drop_table :users, if_exists: true

    create_table :users, id: :uuid do |t|
      ## Database authenticatable
      t.string :email,              null: false, default: ""
      t.string :encrypted_password, null: false, default: ""

      ## Recoverable
      t.string   :reset_password_token
      t.datetime :reset_password_sent_at

      ## Rememberable
      t.datetime :remember_created_at

      ## 任意: 既存で使っているカラムをここに統合
      t.string   :name
      # Confirmable を使っているので再定義
      t.string   :confirmation_token
      t.datetime :confirmed_at
      t.datetime :confirmation_sent_at
      t.string   :unconfirmed_email

      # 管理者フラグ
      t.boolean  :admin, null: false, default: false

      t.timestamps null: false
    end

    add_index :users, :email,                unique: true
    add_index :users, :reset_password_token, unique: true
    add_index :users, :confirmation_token,   unique: true
    add_index :users, :admin
  end

  def down
    # 元に戻す（bigintで作り直し: 開発用の保険）
    drop_table :users, if_exists: true

    create_table :users do |t|
      t.string :email,              null: false, default: ""
      t.string :encrypted_password, null: false, default: ""
      t.string   :reset_password_token
      t.datetime :reset_password_sent_at
      t.datetime :remember_created_at
      t.string   :name
      t.string   :confirmation_token
      t.datetime :confirmed_at
      t.datetime :confirmation_sent_at
      t.string   :unconfirmed_email
      t.boolean  :admin, null: false, default: false
      t.timestamps null: false
    end

    add_index :users, :email,                unique: true
    add_index :users, :reset_password_token, unique: true
    add_index :users, :confirmation_token,   unique: true
    add_index :users, :admin
  end
end
