# Rails.application.routes.draw do
#   namespace :api do
#     namespace :v1 do
#       devise_for :users,
#                  path: 'auth',
#                  controllers: {
#                    registrations: 'api/v1/auth/registrations',
#                    sessions: 'api/v1/auth/sessions',
#                    confirmations: 'api/v1/auth/confirmations'
#                  },
#                  skip: [:passwords, :unlocks]
#     end
#   end

#   devise_scope :user do
#     post 'api/v1/auth/sign_up', to: 'api/v1/auth/registrations#create'
#     post 'api/v1/auth/sign_in', to: 'api/v1/auth/sessions#create'
#     delete 'api/v1/auth/sign_out', to: 'api/v1/auth/sessions#destroy'
#     get 'api/v1/auth/confirmation', to: 'api/v1/auth/confirmations#show'
#   end
# end


# config/routes.rb
require 'sidekiq/web'

Rails.application.routes.draw do
  # ← devise_for を namespace の外に
  devise_for :users,
             path: 'api/v1/auth',
             controllers: {
               registrations: 'api/v1/auth/registrations',
               sessions:      'api/v1/auth/sessions',
               confirmations: 'api/v1/auth/confirmations'
             },
             skip: [:passwords, :unlocks]

  namespace :api do
    namespace :v1 do
      # 認証チェック
      get 'me', to: 'me#show'

      # 予約API
      resources :reservations, only: %i[index show create destroy]

      # 管理者API
      namespace :admin do
        resources :reservations, only: %i[index]
      end
    end
  end

  # （あなたが既に書いている devise_scope はそのままでOKでもいいですが、
  # 上の devise_for だけで基本的には足ります）

  # Sidekiq Web
  Sidekiq::Web.use Rack::Auth::Basic do |u, p|
    ActiveSupport::SecurityUtils.secure_compare(u, ENV.fetch('SIDEKIQ_WEB_USER', 'admin')) &
      ActiveSupport::SecurityUtils.secure_compare(p, ENV.fetch('SIDEKIQ_WEB_PASSWORD', 'password'))
  end
  mount Sidekiq::Web => '/sidekiq'
end