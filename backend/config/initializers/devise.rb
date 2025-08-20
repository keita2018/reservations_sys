
Devise.setup do |config|

  config.mailer_sender = 'please-change-me-at-config-initializers-devise@example.com'

  require 'devise/orm/active_record'

  config.case_insensitive_keys = [:email]

  config.strip_whitespace_keys = [:email]

  config.skip_session_storage = [:http_auth]

  config.stretches = Rails.env.test? ? 1 : 12

  config.reconfirmable = true

  config.expire_all_remember_me_on_sign_out = true

  config.password_length = 6..128

  config.email_regexp = /\A[^@\s]+@[^@\s]+\z/

  config.reset_password_within = 6.hours

  config.sign_out_via = :delete

  config.responder.error_status = :unprocessable_entity
  config.responder.redirect_status = :see_other

  config.navigational_formats = []

  # JWT認証用
  config.jwt do |jwt|
    # jwt.secret = Rails.application.credentials.devise[:jwt_secret_key]
    jwt.secret = Rails.application.credentials.dig(:devise, :jwt_secret_key) || ENV['JWT_SECRET_KEY']
    jwt.dispatch_requests = [['POST', %r{^/api/v1/auth/sign_in$}]]
    jwt.revocation_requests = [['DELETE', %r{^/api/v1/auth/sign_out$}]]
    jwt.expiration_time = 24.hours.to_i
    jwt.request_formats = { user: [:json] }
  end

end
