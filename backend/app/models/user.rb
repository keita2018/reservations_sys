# class User < ApplicationRecord

#   devise :database_authenticatable, :registerable,
#          :recoverable, :rememberable, :validatable,
#          :confirmable, :jwt_authenticatable,
#          jwt_revocation_strategy: Devise::JWT::RevocationStrategies::Null

#   validates :name, presence: true, length: { maximum: 50 }
# end

class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :confirmable, :jwt_authenticatable,
         jwt_revocation_strategy: JwtDenylist

  has_many :reservations, dependent: :destroy
end