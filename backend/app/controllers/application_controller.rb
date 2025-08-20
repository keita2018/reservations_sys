class ApplicationController < ActionController::API
#     # CSRF無効化（APIのみの場合はOK、HTMLベースなら注意）
#   protect_from_forgery with: :null_session

#   before_action :configure_permitted_parameters, if: :devise_controller?

#   protected

#   def configure_permitted_parameters
#     # サインアップ時に name を許可
#     devise_parameter_sanitizer.permit(:sign_up, keys: [:name])
#   end
end
