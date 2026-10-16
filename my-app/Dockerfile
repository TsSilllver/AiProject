FROM php:8.3-cli

RUN apt-get update && apt-get install -y \
    libcurl4-openssl-dev \
    libssl-dev \
    && docker-php-ext-install curl

# Копируем сертификат Минцифры в контейнер
COPY russiantrustedca.pem /usr/local/share/ca-certificates/russiantrustedca.pem

# Указываем PHP использовать этот сертификат для curl
RUN echo "curl.cainfo=/usr/local/share/ca-certificates/russiantrustedca.pem" > /usr/local/etc/php/conf.d/curl.ini

COPY . /app
WORKDIR /app

EXPOSE 10000

CMD ["php", "-S", "0.0.0.0:10000", "-t", "/app"]