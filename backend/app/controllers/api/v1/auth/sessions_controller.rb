# class Api::V1::Auth::SessionsController < Devise::SessionsController
#   respond_to :json
#   # skip_before_action :verify_authenticity_token
#   # skip_before_action :authenticate_user!, only: [:create]

#   private

#   def respond_with(resource, _opts = {})
#     render json: {
#       message: 'ログインに成功しました',
#       user: {
#         id: resource.id,
#         name: resource.name,
#         email: resource.email,
#         admin: resource.admin
#       },
#       token: request.env['warden-jwt_auth.token']
#     }, status: :ok
#   end

#   def respond_to_on_destroy
#     if current_user
#       render json: { message: "ログアウトしました。" }, status: :ok
#     else
#       render json: { message: "ログインしていません。" }, status: :unauthorized
#     end
#   end
# end
# app/controllers/api/v1/auth/sessions_controller.rb
# app/controllers/api/v1/auth/sessions_controller.rb

# class Api::V1::Auth::SessionsController < Devise::SessionsController
#   respond_to :json

#   def create
#     Rails.logger.info "[DEBUG] sessions#create params=#{params.inspect}"
#     request.env["devise.mapping"] = Devise.mappings[:user]

#     email    = params.dig(:user, :email)
#     password = params.dig(:user, :password)
#     return render json: { error: 'missing params' }, status: :bad_request if email.blank? || password.blank?

#     user = User.find_for_database_authentication(email: email)

#     if user&.valid_password?(password) && user.active_for_authentication?
#       # ★ セッションに保存しない（APIは stateless）
#       sign_in(:user, user, store: false)

#       # devise-jwt がここで JWT を発行して env に格納＆レスポンスヘッダ Authorization に付与
#       token = request.env['warden-jwt_auth.token']

#       render json: {
#         message: 'ログインに成功しました',
#         user: { id: user.id, name: user.name, email: user.email, admin: user.admin },
#         token: token
#       }, status: :ok
#     else
#       reason =
#         if user.nil? then 'not_found'
#         elsif !user.valid_password?(password) then 'invalid_password'
#         elsif !user.active_for_authentication? then 'inactive'
#         else 'unknown'
#         end
#       render json: { error: 'Invalid email or password', reason: reason }, status: :unauthorized
#     end
#   end
# end
# app/controllers/api/v1/auth/sessions_controller.rb
class Api::V1::Auth::SessionsController < Devise::SessionsController
  respond_to :json

  def create
    request.env["devise.mapping"] = Devise.mappings[:user]

    email    = params.dig(:user, :email)
    password = params.dig(:user, :password)
    return render json: { error: 'missing params' }, status: :bad_request if email.blank? || password.blank?

    user = User.find_for_database_authentication(email: email)

    if user&.valid_password?(password) && user.active_for_authentication?
      # セッションを使わない stateless ログイン
      warden.set_user(user, scope: :user, store: false)

      # まずはミドルウェア経由のトークンを試す
      token = request.env['warden-jwt_auth.token']

      # ★ 保険：ミドルウェアがセットしない場合は自前で発行してヘッダに付ける
      if token.blank?
        encoder = Warden::JWTAuth::UserEncoder.new
        token, _payload = encoder.call(user, :user, nil)
        response.set_header('Authorization', "Bearer #{token}")
      end

      render json: {
        message: 'ログインに成功しました',
        user: { id: user.id, name: user.name, email: user.email, admin: user.admin },
        token: token
      }, status: :ok
    else
      render json: { error: 'Invalid email or password' }, status: :unauthorized
    end
  end
end
