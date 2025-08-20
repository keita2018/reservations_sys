FROM ruby:3.4.5
RUN apt-get update -qq && apt-get install -y vim build-essential libpq-dev
# RUN apt-get update -qq && apt-get install -y vim build-essential libpq-dev postgresql-client

WORKDIR /usr/src/backend

COPY backend/Gemfile /usr/src/backend/Gemfile 
COPY backend/Gemfile.lock /usr/src/backend/Gemfile.lock

# RUN gem update --system 
# RUN bundle update --bundler

RUN bundle install 
COPY . /usr/src/backend

# entrypoint.shをコンテナにコピーする
COPY backend/entrypoint.sh /usr/bin/

# entrypoint.shを実行する
RUN chmod +x /usr/bin/entrypoint.sh

ENTRYPOINT ["/usr/bin/entrypoint.sh"]
CMD ["rails", "server", "-b", "0.0.0.0"]